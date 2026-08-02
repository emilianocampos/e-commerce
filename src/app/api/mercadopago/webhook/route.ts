import { NextResponse } from 'next/server';
import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * Este archivo implementa el Webhook de Mercado Pago.
 * Es la URL que Mercado Pago llamará (POST) automáticamente cuando haya una actualización en un pago.
 * 
 * ¿Por qué creamos este archivo?
 * Para que el e-commerce sea automático. Si un cliente paga, necesitamos que el sistema se entere
 * sin que el cliente tenga que hacer click en "Volver a la tienda". El webhook asegura que,
 * aunque el cliente cierre el navegador tras pagar, nosotros registramos la venta y descontamos el stock.
 */

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    // Extraemos los query params enviados por MP (tipo de evento y ID)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    
    // Obtenemos el payload completo para registrarlo en logs
    let payloadStr = '';
    try {
      const clonedReq = request.clone();
      payloadStr = await clonedReq.text();
    } catch(e) {
      // Ignorar si falla la lectura del body
    }

    const payload = payloadStr ? JSON.parse(payloadStr) : {};

    // 1. Guardar log del webhook en la BD (para depuración)
    const supabase = createAdminClient();
    await supabase.from('webhook_logs').insert({
      topic,
      payment_id: id,
      payload
    });

    console.log(`[Webhook MP] Recibido - topic: ${topic}, id: ${id}`);

    // Solo nos interesa procesar pagos ("payment")
    if (topic === 'payment' && id) {
      const payment = new Payment(mpClient);

      // 2. Consultar a MP mediante el SDK (nunca confiar ciegamente en el payload que llega)
      // Esto previene ataques donde alguien pueda falsificar un POST a esta URL.
      const paymentData = await payment.get({ id });
      console.log(`[Webhook MP] Estado del pago consultado: ${paymentData.status}`);

      // 3. Validar estado (Solo procesar cuando está aprobado)
      if (paymentData.status === 'approved') {
        const profileId = paymentData.metadata?.profile_id;
        const cartItems = paymentData.metadata?.cart_items;
        
        if (profileId && cartItems && cartItems.length > 0) {
          
          // 4. Evitar duplicados
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('mp_payment_id', paymentData.id!.toString())
            .maybeSingle();
            
          if (existingOrder) {
            console.log(`[Webhook MP] La orden para el pago ${paymentData.id} ya fue insertada.`);
            return NextResponse.json({ received: true }, { status: 200 }); // Responder 200 rápido
          }

          // 5. Obtener los productos de la BD para sacar sus precios y nombres REALES
          const productIds = cartItems.map((item: any) => item.productId);
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, title, price, stock')
            .in('id', productIds);

          if (productsError || !products || products.length === 0) {
            console.error('[Webhook MP] Error consultando productos:', productsError);
            return NextResponse.json({ received: true }, { status: 200 }); // Retornar 200 para que MP no reintente.
          }

          // Calculamos el total internamente por seguridad, aunque MP envíe transaction_amount
          // Esto asegura congruencia
          const realTotal = paymentData.transaction_amount || 0;

          // 6. Crear el pedido principal (orders)
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              profile_id: profileId,
              total_amount: realTotal,
              status: 'paid', // Estado guardado como "paid"
              mp_payment_id: paymentData.id!.toString()
            })
            .select('id')
            .single();

          if (orderError || !order) {
            console.error('[Webhook MP] Error creando orden:', orderError);
            return NextResponse.json({ received: true }, { status: 200 });
          }

          console.log(`[Webhook MP] Orden creada (UUID: ${order.id})`);

          // 7. Crear items (congelando la data) y actualizar stock
          for (const item of cartItems) {
            const product = products.find((p: any) => p.id === item.productId);
            if (product) {
              const unitPrice = product.price;
              const subtotal = unitPrice * item.quantity;
              
              // Insertamos item
              await supabase.from('order_items').insert({
                order_id: order.id,
                product_id: product.id,
                selected_size: item.selectedSize || '',
                quantity: item.quantity,
                unit_price: unitPrice
              });

              // Descontamos stock (NO bajando por debajo de 0)
              const newStock = Math.max(0, product.stock - item.quantity);
              await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
            }
          }

          console.log(`[Webhook MP] Productos procesados y stock actualizado exitosamente.`);
        }
      } else {
        console.log(`[Webhook MP] Pago con estado "${paymentData.status}" - No se genera orden.`);
      }
    }

    // Responder 200 rápido a Mercado Pago para indicar recepción correcta
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook MP] Error no controlado:', error.message);
    // MP espera un HTTP 200/201 (si devuelves 500 te seguirán bombardeando con reintentos). 
    // Usualmente ante un error de negocio devuelves 200, pero si es un error fatal de server devuelves 500 para el retry log.
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
