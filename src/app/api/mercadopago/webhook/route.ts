import { NextResponse } from 'next/server';
import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendMetaCapiEvent } from '@/lib/meta-capi';
import { getSiteUrl } from '@/lib/site-url';

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
        const orderId = paymentData.external_reference || paymentData.metadata?.order_id;
        
        if (orderId) {
          
          // 4. Buscar la orden
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('id, status')
            .eq('id', orderId)
            .single();
            
          if (!existingOrder) {
            console.error(`[Webhook MP] Orden no encontrada: ${orderId}`);
            return NextResponse.json({ received: true }, { status: 200 }); 
          }

          if (existingOrder.status === 'paid') {
            console.log(`[Webhook MP] La orden ${orderId} ya estaba pagada.`);
            return NextResponse.json({ received: true }, { status: 200 }); 
          }

          // 5. Actualizar orden a "paid"
          const { error: orderError } = await supabase
            .from('orders')
            .update({
              status: 'paid', 
              mp_payment_id: paymentData.id!.toString()
            })
            .eq('id', orderId);

          if (orderError) {
            console.error('[Webhook MP] Error actualizando orden:', orderError);
            return NextResponse.json({ received: true }, { status: 200 });
          }

          console.log(`[Webhook MP] Orden actualizada a pagada (UUID: ${orderId})`);

          // 6. Obtener los items y descontar stock
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id, quantity')
            .select('product_id, quantity, unit_price')
            .eq('order_id', orderId);

          if (orderItems && orderItems.length > 0) {
            for (const item of orderItems) {
              const { data: product } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single();
                
              if (product) {
                const newStock = Math.max(0, product.stock - item.quantity);
                await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
              }
            }
          }

          // 7. Enviar evento Purchase a Meta Conversions API (server-side, deduplicado con purchase_${orderId})
          try {
            const { data: fullOrder } = await supabase
              .from('orders')
              .select('id, total_amount, shipping_phone, shipping_city, shipping_zip, profile:profiles(email, full_name)')
              .eq('id', orderId)
              .single();

            const profileData: any = Array.isArray((fullOrder as any)?.profile)
              ? (fullOrder as any).profile[0]
              : (fullOrder as any)?.profile;
            const fullName: string = profileData?.full_name || '';
            const [firstName, ...restName] = fullName.trim().split(/\s+/);
            const lastName = restName.join(' ');

            const contents = (orderItems || []).map((item: any) => ({
              id: String(item.product_id),
              quantity: Number(item.quantity || 1),
              item_price: Number(item.unit_price || 0),
            }));

            await sendMetaCapiEvent({
              eventName: 'Purchase',
              eventId: `purchase_${orderId}`,
              eventSourceUrl: `${getSiteUrl()}/pago/exito?external_reference=${orderId}`,
              userData: {
                email: profileData?.email || paymentData.payer?.email || undefined,
                phone: (fullOrder as any)?.shipping_phone || undefined,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                city: (fullOrder as any)?.shipping_city || undefined,
                zip: (fullOrder as any)?.shipping_zip || undefined,
                country: 'ar',
              },
              customData: {
                content_ids: contents.map((c) => c.id),
                contents,
                content_type: 'product',
                num_items: contents.reduce((acc, c) => acc + c.quantity, 0) || 1,
                value: Number((fullOrder as any)?.total_amount || paymentData.transaction_amount || 0),
                currency: 'ARS',
                order_id: orderId,
              },
            });
          } catch (capiErr) {
            console.error('[Webhook MP] Error enviando Purchase a Meta CAPI:', capiErr);
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
