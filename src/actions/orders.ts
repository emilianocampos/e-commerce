'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { createNotification } from './notifications';
import { revalidatePath } from 'next/cache';

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
 * Obtiene los detalles de una orden específica por su ID.
 */
export async function getOrderById(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: order, error } = await supabase
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
    .eq('id', orderId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (error || !order) {
    // Si falla o la RLS bloquea por usuario, intentamos consultar con admin client si coincide
    return null;
  }

  return order;
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
  
  revalidatePath('/mis-pedidos');
  revalidatePath('/admin/ventas');
  revalidatePath('/admin/pedidos');
  return { success: true };
}

/**
 * Actualiza el estado del pago / compra de una orden (solo para admins).
 */
export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();

  const adminClient = createAdminClient();
  
  const { data: order } = await adminClient
    .from('orders')
    .select('profile_id, id')
    .eq('id', orderId)
    .single();

  const { error } = await adminClient
    .from('orders')
    .update({ status: status })
    .eq('id', orderId);

  if (error) {
    throw new Error('Error al actualizar estado del pedido: ' + error.message);
  }

  if (order && order.profile_id) {
    const ref = orderId.split('-')[0];
    const normalizedStatus = (status || '').toLowerCase();
    let msg = `El estado de tu compra (Ref: ${ref}) ha cambiado a: ${status}.`;

    if (normalizedStatus === 'approved' || normalizedStatus === 'aprobado' || normalizedStatus === 'paid') {
      msg = `¡Tu pago para el pedido (Ref: ${ref}) ha sido APROBADO!`;
    } else if (normalizedStatus === 'pending' || normalizedStatus === 'pendiente') {
      msg = `El pago de tu pedido (Ref: ${ref}) está pendiente.`;
    } else if (normalizedStatus === 'rejected' || normalizedStatus === 'rechazado') {
      msg = `El pago de tu pedido (Ref: ${ref}) fue rechazado.`;
    } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'cancelado') {
      msg = `El pedido (Ref: ${ref}) ha sido cancelado.`;
    }

    await createNotification(
      order.profile_id,
      'Actualización de Compra',
      msg
    );
  }

  revalidatePath('/mis-pedidos');
  revalidatePath('/admin/ventas');
  revalidatePath('/admin/pedidos');
  return { success: true };
}

/**
 * Marca una orden como pagada/aprobada y descuenta el stock de productos.
 */
export async function markOrderAsPaid(orderId: string, paymentId?: string) {
  const adminClient = createAdminClient();

  const { data: order, error } = await adminClient
    .from('orders')
    .select('id, status, profile_id, mp_payment_id')
    .eq('id', orderId)
    .single();

  if (error || !order) return { success: false, error: 'Orden no encontrada' };

  // Si ya estaba aprobada o pagada, no duplicar descuento de stock
  if (order.status === 'approved' || order.status === 'paid') {
    return { success: true, message: 'La orden ya figuraba como aprobada' };
  }

  const updatePayload: any = {
    status: 'approved',
  };
  if (paymentId && (!order.mp_payment_id || order.mp_payment_id.startsWith('pending-'))) {
    updatePayload.mp_payment_id = paymentId;
  }

  await adminClient.from('orders').update(updatePayload).eq('id', orderId);

  // Descontar stock de productos comprados
  const { data: orderItems } = await adminClient
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (orderItems && orderItems.length > 0) {
    for (const item of orderItems) {
      if (item.product_id) {
        const { data: product } = await adminClient
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product && typeof product.stock === 'number') {
          const newStock = Math.max(0, product.stock - (item.quantity || 1));
          await adminClient.from('products').update({ stock: newStock }).eq('id', item.product_id);
        }
      }
    }
  }

  // Notificar al comprador
  if (order.profile_id) {
    const ref = orderId.split('-')[0].toUpperCase();
    await createNotification(
      order.profile_id,
      '¡Pago Aprobado!',
      `Tu pago para el pedido #${ref} fue acreditado con éxito. Ya estamos preparando tu compra.`
    );
  }

  revalidatePath('/mis-pedidos');
  revalidatePath('/admin/ventas');
  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${orderId}`);

  return { success: true };
}

/**
 * Marca una orden como cancelada (por falta de pago, rechazo o abandono de pasarela).
 */
export async function markOrderAsCancelled(orderId: string, reason?: string) {
  const adminClient = createAdminClient();

  const { data: order } = await adminClient
    .from('orders')
    .select('id, status, profile_id')
    .eq('id', orderId)
    .single();

  if (!order) return { success: false, error: 'Orden no encontrada' };

  if (order.status === 'approved' || order.status === 'paid' || order.status === 'cancelled') {
    return { success: true };
  }

  await adminClient
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);

  if (order.profile_id) {
    const ref = orderId.split('-')[0].toUpperCase();
    await createNotification(
      order.profile_id,
      'Compra Cancelada',
      reason || `El pedido #${ref} no completó el pago y fue cancelado.`
    );
  }

  revalidatePath('/mis-pedidos');
  revalidatePath('/admin/ventas');
  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${orderId}`);

  return { success: true };
}

/**
 * Consulta en tiempo real a Mercado Pago para saber si la orden fue pagada o no,
 * y actualiza automáticamente el estado en la base de datos (Aprobado o Cancelado).
 */
export async function syncOrderPaymentStatus(orderId: string, forceCheck: boolean = false) {
  const adminClient = createAdminClient();

  const { data: order, error } = await adminClient
    .from('orders')
    .select('id, status, created_at, mp_payment_id')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { status: 'not_found', message: 'Orden no encontrada' };
  }

  if (order.status === 'approved' || order.status === 'paid') {
    return { status: 'approved', message: 'Pago ya acreditado' };
  }

  if ((order.status === 'cancelled' || order.status === 'rejected') && !forceCheck) {
    return { status: order.status, message: 'Orden cancelada' };
  }

  try {
    const { Payment } = await import('mercadopago');
    const { mpClient } = await import('@/lib/mercadopago');

    const payment = new Payment(mpClient);

    // 1. Si tiene ID numérico real de Mercado Pago
    if (order.mp_payment_id && !order.mp_payment_id.startsWith('pending-') && /^\d+$/.test(order.mp_payment_id)) {
      try {
        const paymentData = await payment.get({ id: order.mp_payment_id });
        if (paymentData.status === 'approved') {
          await markOrderAsPaid(order.id, order.mp_payment_id);
          return { status: 'approved', message: '¡Pago verificado y aprobado!' };
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          await markOrderAsCancelled(order.id, 'Pago cancelado o rechazado por Mercado Pago.');
          return { status: 'cancelled', message: 'El pago fue cancelado o rechazado por Mercado Pago.' };
        }
      } catch (e) {
        // Fallback a búsqueda
      }
    }

    // 2. Buscar en Mercado Pago por external_reference (ID de la orden)
    const searchRes = await payment.search({
      options: {
        external_reference: order.id,
      }
    });

    const results = searchRes?.results || [];

    if (results.length > 0) {
      // Si hay al menos un pago aprobado
      const approvedPayment = results.find(p => p.status === 'approved');
      if (approvedPayment && approvedPayment.id) {
        await markOrderAsPaid(order.id, approvedPayment.id.toString());
        return { status: 'approved', message: '¡Pago acreditado en Mercado Pago!' };
      }

      // Si todos los intentos figuran cancelados o rechazados
      const allDone = results.every(p => p.status === 'rejected' || p.status === 'cancelled');
      if (allDone) {
        await markOrderAsCancelled(order.id, 'El intento de pago fue rechazado o cancelado.');
        return { status: 'cancelled', message: 'Pago rechazado o cancelado en Mercado Pago.' };
      }
    } else {
      // Mercado Pago no registra ningún pago para esta orden (el cliente llegó a MP pero nunca pagó)
      const orderAgeMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);

      // Si pasaron más de 10 minutos o si se fuerza la verificación:
      if (orderAgeMinutes >= 10 || forceCheck) {
        await markOrderAsCancelled(order.id, 'La orden no completó el pago en Mercado Pago.');
        return { status: 'cancelled', message: 'No se acreditó el dinero en Mercado Pago. Orden cancelada.' };
      }
    }

    return { status: order.status, message: `Estado actual: ${order.status}` };
  } catch (error: any) {
    console.error('Error sincronizando con Mercado Pago:', error);

    const orderAgeMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);
    if ((orderAgeMinutes >= 30 || forceCheck) && order.status === 'pending' && order.mp_payment_id?.startsWith('pending-')) {
      await markOrderAsCancelled(order.id, 'Tiempo límite de pago expirado.');
      return { status: 'cancelled', message: 'Orden expirada sin pago acreditado.' };
    }

    return { status: order.status, error: error.message };
  }
}

