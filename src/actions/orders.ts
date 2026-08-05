'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { createNotification } from './notifications';

/**
 * Obtiene todas las órdenes del usuario logueado.
 */
export async function getUserOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No estás autenticado');
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          title,
          image,
          price
        )
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Error al obtener pedidos: ' + error.message);
  }

  return orders;
}

/**
 * Obtiene todas las órdenes de la tienda (solo para admins).
 */
export async function getAllOrders() {
  await requireAdmin();

  const adminClient = createAdminClient();
  
  const { data: orders, error } = await adminClient
    .from('orders')
    .select(`
      *,
      profile:profiles (
        email,
        full_name,
        phone,
        address,
        city,
        postal_code
      ),
      order_items (
        *,
        product:products (
          title,
          image
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Error al obtener ventas: ' + error.message);
  }

  return orders;
}

/**
 * Actualiza el estado de envío de una orden (solo para admins).
 */
export async function updateShippingStatus(orderId: string, status: string) {
  await requireAdmin();

  const adminClient = createAdminClient();
  
  // Primero obtenemos la orden para saber a qué usuario pertenece
  const { data: order } = await adminClient
    .from('orders')
    .select('profile_id, id')
    .eq('id', orderId)
    .single();

  const { error } = await adminClient
    .from('orders')
    .update({ shipping_status: status })
    .eq('id', orderId);

  if (error) {
    throw new Error('Error al actualizar estado de envío: ' + error.message);
  }

  // Notificar al usuario si la orden tiene un perfil asociado
  if (order && order.profile_id) {
    const ref = orderId.split('-')[0];
    const normalizedStatus = (status || '').toLowerCase();
    let msg = `El estado de tu pedido (Ref: ${ref}) ha sido actualizado a: ${status}.`;

    if (normalizedStatus === 'shipped' || normalizedStatus === 'enviado') {
      msg = `¡Buenas noticias! Tu pedido (Ref: ${ref}) ha sido enviado.`;
    } else if (normalizedStatus === 'delivered' || normalizedStatus === 'entregado') {
      msg = `Tu pedido (Ref: ${ref}) figura como entregado. ¡Que lo disfrutes!`;
    } else if (normalizedStatus === 'preparing' || normalizedStatus === 'empaquetado' || normalizedStatus === 'preparación' || normalizedStatus === 'preparacion') {
      msg = `Tu pedido (Ref: ${ref}) se encuentra en preparación y empaquetado.`;
    } else if (normalizedStatus === 'pending' || normalizedStatus === 'pendiente') {
      msg = `Tu pedido (Ref: ${ref}) está registrado como pendiente.`;
    } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'cancelado') {
      msg = `Tu pedido (Ref: ${ref}) ha sido cancelado.`;
    }

    await createNotification(
      order.profile_id,
      'Actualización de Envío',
      msg
    );
  }
  
  return { success: true };
}
