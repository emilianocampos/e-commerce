'use server';

import { Preference } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createClient, createAdminClient } from '@/lib/supabase-server';

/**
 * Función: createCheckoutPreference
 * Propósito: Crear una "Preferencia" de pago en la API de Mercado Pago. 
 * Una Preferencia es básicamente una orden de compra pendiente. Le decimos a Mercado Pago qué 
 * productos se van a cobrar y MP nos devuelve una URL (init_point) adonde debemos enviar al usuario para que pague.
 * 
 * @param cartItems: Viene desde el frontend (del carrito del cliente). Es un array que contiene
 *                   únicamente los IDs de los productos y la cantidad elegida, pero NO los precios 
 *                   por cuestiones de seguridad.
 */
export async function createCheckoutPreference(
  cartItems: { productId: string, quantity: number, selectedSize?: string, selectedColor?: string }[],
  options?: {
    vipCardCode?: string;
    isTransferPromo?: boolean;
    promoCode?: string;
  }
) {
  try {
    // supabase: Instancia del cliente de base de datos para ejecutar queries con nuestros permisos.
    const supabase = await createClient();

    // Verificar que el usuario haya iniciado sesión antes de permitir la compra.
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { requireLogin: true };
    }

    const productIds = cartItems.map(item => item.productId);

    // products: Trae la data REAL y SEGURA de los productos con configuración VIP
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, description, price, image, vip_discount_percentage, vip_stackable')
      .in('id', productIds);

    if (error || !products || products.length === 0) {
      throw new Error('Los productos del carrito ya no están disponibles');
    }

    // Validar tarjeta VIP en base de datos de forma segura si fue enviada
    let validatedVipCard: { card_number: string; discount_percentage: number } | null = null;
    if (options?.vipCardCode && options.vipCardCode.trim()) {
      const { data: vipCard } = await supabase
        .from('vip_cards')
        .select('card_number, discount_percentage, active')
        .ilike('card_number', options.vipCardCode.trim())
        .maybeSingle();

      if (vipCard && vipCard.active) {
        validatedVipCard = {
          card_number: vipCard.card_number,
          discount_percentage: Number(vipCard.discount_percentage) || 10,
        };
      }
    }

    // Porcentaje de promo (transferencia y/o cupón de descuento)
    let promoPercentage = 0;
    if (options?.isTransferPromo) {
      promoPercentage += 10;
    }

    if (options?.promoCode && options.promoCode.trim()) {
      const cleanCode = options.promoCode.trim().toUpperCase();
      const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('discount_codes, discount_code, discount_percentage')
        .eq('id', 1)
        .maybeSingle();

      if (storeSettings) {
        let codesList: { code: string; percentage: number }[] = [];
        if (storeSettings.discount_codes) {
          if (typeof storeSettings.discount_codes === 'string') {
            try { codesList = JSON.parse(storeSettings.discount_codes); } catch (e) {}
          } else if (Array.isArray(storeSettings.discount_codes)) {
            codesList = storeSettings.discount_codes;
          }
        }
        if ((!codesList || codesList.length === 0) && storeSettings.discount_code) {
          codesList.push({ code: storeSettings.discount_code, percentage: Number(storeSettings.discount_percentage) || 0 });
        }
        const foundPromo = codesList.find(c => c && typeof c.code === 'string' && c.code.trim().toUpperCase() === cleanCode);
        if (foundPromo && Number(foundPromo.percentage) > 0) {
          promoPercentage += Number(foundPromo.percentage);
        }
      }
    }

    const preference = new Preference(mpClient);

    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const siteUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl.slice(0, -1) : rawSiteUrl;

    let orderSubtotal = 0;
    let orderPromoDiscount = 0;
    let orderVipDiscount = 0;

    // Calculamos items con precios y descuentos exactos
    const items = cartItems.reduce((acc, cartItem) => {
      const product = products.find(p => p.id === cartItem.productId);

      if (product) {
        const qty = Number(cartItem.quantity);
        const originalPrice = Number(product.price);
        orderSubtotal += originalPrice * qty;

        // Promo discount
        const promoDiscountPerUnit = promoPercentage > 0 ? (originalPrice * (promoPercentage / 100)) : 0;
        const priceAfterPromo = originalPrice - promoDiscountPerUnit;
        orderPromoDiscount += promoDiscountPerUnit * qty;

        // VIP discount
        let vipDiscountPerUnit = 0;
        if (validatedVipCard) {
          const productVipPct = product.vip_discount_percentage !== null && product.vip_discount_percentage !== undefined
            ? Number(product.vip_discount_percentage)
            : validatedVipCard.discount_percentage;

          const isStackable = product.vip_stackable !== false;

          if (productVipPct > 0 && (isStackable || promoDiscountPerUnit === 0)) {
            vipDiscountPerUnit = priceAfterPromo * (productVipPct / 100);
            orderVipDiscount += vipDiscountPerUnit * qty;
          }
        }

        const finalUnitPrice = Math.max(0, Math.round((priceAfterPromo - vipDiscountPerUnit) * 100) / 100);

        const variantSpecs = [
          cartItem.selectedSize && cartItem.selectedSize !== 'Único' && cartItem.selectedSize.trim() !== '' ? `Talle: ${cartItem.selectedSize}` : null,
          cartItem.selectedColor ? `Color: ${cartItem.selectedColor}` : null,
        ].filter(Boolean).join(', ');

        acc.push({
          id: product.id,
          title: `${product.title} ${variantSpecs ? `(${variantSpecs})` : ''}`,
          quantity: qty,
          unit_price: finalUnitPrice,
          currency_id: 'ARS',
          picture_url: product.image?.startsWith('http') ? product.image : `${siteUrl}${product.image || ''}`,
          description: product.description || product.title,
        });
      }
      return acc;
    }, [] as any[]);

    if (items.length === 0) {
      throw new Error('Ninguno de los productos seleccionados está disponible para la compra');
    }

    // 1. Crear la orden en estado "pending" antes de ir a MP
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!profile) {
      const adminClient = createAdminClient();
      await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
      });
    }

    const totalAmount = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        profile_id: user.id,
        total_amount: totalAmount,
        subtotal_amount: orderSubtotal,
        promo_discount_amount: orderPromoDiscount,
        vip_discount_amount: orderVipDiscount,
        vip_card_code: validatedVipCard ? validatedVipCard.card_number : null,
        status: 'pending',
        mp_payment_id: `pending-${Date.now()}`
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Error creando orden previa:', orderError);
      throw new Error('No se pudo inicializar la orden');
    }

    // 2. Insertar los items de la orden
    const orderItemsToInsert = cartItems.map(cartItem => {
       const p = products.find(prod => prod.id === cartItem.productId);
       return {
         order_id: order.id,
         product_id: cartItem.productId,
         selected_size: (cartItem.selectedSize && cartItem.selectedSize !== 'Único') ? cartItem.selectedSize : '',
         quantity: cartItem.quantity,
         unit_price: p?.price || 0
       };
    });
    
    await supabase.from('order_items').insert(orderItemsToInsert);

    const isHttps = siteUrl.startsWith('https://');
    const isTestToken = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST-');

    if (isTestToken) {
      console.warn('⚠️ ATENCIÓN: El MERCADOPAGO_ACCESS_TOKEN configurado es de PRUEBA (empieza con TEST-). Para producción debes usar las credenciales que empiezan con APP_USR-');
    }

    const preferencePayload = {
      body: {
        items,
        payer: {
          email: user.email,
        },
        external_reference: order.id.toString(),
        statement_descriptor: 'KLONFARK',
        metadata: {
          order_id: order.id.toString(),
        },
        back_urls: {
          success: `${siteUrl}/pago/exito`,
          failure: `${siteUrl}/pago/fallo`,
          pending: `${siteUrl}/pago/pendiente`,
        },
        ...(isHttps ? { auto_return: 'approved', notification_url: `${siteUrl}/api/mercadopago/webhook` } : {}),
      }
    };

    console.log('--- PAYLOAD PARA MERCADO PAGO ---');
    console.log(JSON.stringify(preferencePayload, null, 2));
    console.log('---------------------------------');

    const response = await preference.create(preferencePayload as any);

    // En modo prueba Mercado Pago puede requerir sandbox_init_point, pero en producción devuelve init_point.
    const checkoutUrl = isTestToken ? (response.sandbox_init_point || response.init_point) : response.init_point;

    return { init_point: checkoutUrl };

  } catch (error: any) {
    // Si algo falla, atrapamos el error y se lo mandamos de forma segura al frontend
    console.error('Error al crear preferencia de Mercado Pago:', error);
    return { error: error.message || 'Ocurrió un error al procesar el pago' };
  }
}
