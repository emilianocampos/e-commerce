import { NextResponse } from 'next/server';
import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    // Mercado Pago envía notificaciones de diferentes formas, a veces en la URL, a veces en el body
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (topic === 'payment' && id) {
      const payment = new Payment(mpClient);

      // Verificamos con MP el estado real del pago para evitar fraudes (spoofing)
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
        // En metadata guardamos el productId en el Server Action anterior
        const productId = paymentData.metadata?.product_id;

        if (productId) {
          const supabase = await createClient();

          // Aquí puedes implementar tu lógica de negocio final:
          // 1. Guardar la orden en una tabla 'orders'
          // 2. Descontar stock
          // 3. Notificar al usuario por email
          console.log(`[Webhook] Pago aprobado verificado. Producto: ${productId}, Monto: ${paymentData.transaction_amount}`);
        }
      }
    }

    // MP siempre espera un 200 OK lo más rápido posible
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook de Mercado Pago:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
