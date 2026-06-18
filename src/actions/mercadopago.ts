'use server';

import { Preference } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createClient } from '@/lib/supabase-server';

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
export async function createCheckoutPreference(cartItems: { productId: string, quantity: number }[]) {
  try {
    // supabase: Instancia del cliente de base de datos para ejecutar queries con nuestros permisos.
    // Viene de nuestra función helper en lib/supabase-server.ts
    const supabase = await createClient();

    // Verificar que el usuario haya iniciado sesión antes de permitir la compra.
    // supabase.auth.getUser() extrae la sesión actual basándose en las cookies del servidor.
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Si no hay usuario logueado, retornamos un aviso al frontend para que lo redirija al login.
      return { requireLogin: true };
    }

    // productIds: Creamos un array simple ['uuid-1', 'uuid-2'] sacado del carrito.
    // Se usa para buscar esos IDs específicos en la tabla de productos de Supabase de una sola vez.
    const productIds = cartItems.map(item => item.productId);

    // products: Resultado de la consulta a Supabase. Trae la data REAL y SEGURA de los productos 
    // (título, descripción, PRECIO verdadero e imagen) directamente desde la base de datos.
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, description, price, image')
      .in('id', productIds);

    if (error || !products || products.length === 0) {
      throw new Error('Los productos del carrito ya no están disponibles');
    }

    // preference: Es una clase que provee el SDK de MercadoPago para interactuar con la API.
    // Le pasamos "mpClient", que es nuestra configuración inicializada con el ACCESS_TOKEN secreto.
    const preference = new Preference(mpClient);

    // siteUrl: La URL base de nuestra web (ej: http://localhost:3000 o https://midominio.com).
    // Viene de las variables de entorno (.env.local).
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // items: Un array con la estructura y validaciones exactas que exige Mercado Pago.
    // Cruzamos la información del carrito local (cantidades) con la info de la BD (precios, títulos).
    const items = cartItems.reduce((acc, cartItem) => {
      // Buscamos el producto en la BD que coincide con este item del carrito
      const product = products.find(p => p.id === cartItem.productId);

      if (product) {
        acc.push({
          id: product.id,
          title: product.title,
          quantity: Number(cartItem.quantity), // MP requiere un Number estricto
          unit_price: Number(product.price),   // Precio sacado de la BD, NO del frontend
          currency_id: 'ARS', // Moneda en Pesos Argentinos
          // Aseguramos que la URL de la imagen sea absoluta, sino MP tira error
          picture_url: product.image?.startsWith('http') ? product.image : `${siteUrl}${product.image || ''}`,
          // Si no hay descripción, le ponemos el título para que no falle
          description: product.description || product.title,
        });
      }
      return acc;
    }, [] as any[]);

    if (items.length === 0) {
      throw new Error('Ninguno de los productos seleccionados está disponible para la compra');
    }

    // preferencePayload: El "paquete" de datos o cuerpo de la petición que se le envía a Mercado Pago
    const preferencePayload = {
      body: {
        items, // Lista de productos armados arriba
        // back_urls: Adonde debe volver el usuario luego de pagar (éxito, fallo o pendiente)
        back_urls: {
          success: `${siteUrl}/pago/exito`,
          failure: `${siteUrl}/pago/fallo`,
          pending: `${siteUrl}/pago/pendiente`,
        },
        // auto_return: Obliga a MercadoPago a redirigir al usuario al "success" inmediatamente tras un pago exitoso.
        // Ojo: Solo lo activamos si NO estamos en localhost, ya que MP rechaza "localhost" como URL válida de retorno automático.
        ...(siteUrl.includes('localhost') ? {} : { auto_return: 'approved' }),
        // notification_url: (Webhooks) URL donde MercadoPago nos enviará POSTs silenciosos avisándonos si un pago se concretó
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      }
    };

    console.log('--- PAYLOAD PARA MERCADO PAGO ---');
    console.log(JSON.stringify(preferencePayload, null, 2));
    console.log('---------------------------------');

    // response: Respuesta oficial de Mercado Pago tras recibir nuestra preferencia.
    // Usamos preference.create(...) pasándole el payload.
    const response = await preference.create(preferencePayload as any);

    // Retornamos el init_point al frontend. 
    // init_point es un string tipo "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123"
    // Al cual enviaremos a nuestro usuario en el navegador para que proceda con su pago.
    return { init_point: response.init_point };

  } catch (error: any) {
    // Si algo falla, atrapamos el error y se lo mandamos de forma segura al frontend
    console.error('Error al crear preferencia de Mercado Pago:', error);
    return { error: error.message || 'Ocurrió un error al procesar el pago' };
  }
}
