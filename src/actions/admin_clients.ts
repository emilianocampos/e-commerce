'use server';

import { createAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

/**
 * Actualiza la información de un cliente desde el panel de administración
 */
export async function updateClientAdmin(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return { success: false, error: 'ID de cliente requerido' };
    }

    const nombre = (formData.get('nombre') as string || '').trim();
    const apellido = (formData.get('apellido') as string || '').trim();
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const phone = (formData.get('phone') as string || '').trim();
    const dni = (formData.get('dni') as string || '').trim();
    const calle = (formData.get('calle') as string || '').trim();
    const numero = (formData.get('numero') as string || '').trim();
    const piso = (formData.get('piso') as string || '').trim();
    const departamento = (formData.get('departamento') as string || '').trim();
    const localidad = (formData.get('localidad') as string || formData.get('city') as string || '').trim();
    const provincia = (formData.get('provincia') as string || '').trim();
    const codigo_postal = (formData.get('codigo_postal') as string || formData.get('postal_code') as string || '').trim();
    const role = (formData.get('role') as string || 'user').trim();

    const fullName = [nombre, apellido].filter(Boolean).join(' ') || (formData.get('full_name') as string || '').trim();

    const referencias = (formData.get('referencias') as string || '').trim();

    const fullAddress = [
      `${calle} ${numero}`.trim(),
      piso ? `Piso ${piso}` : '',
      departamento ? `Dpto ${departamento}` : '',
      provincia ? `Prov ${provincia}` : '',
      referencias ? `Ref: ${referencias}` : '',
    ].filter(Boolean).join(', ');

    const updates: Record<string, any> = {
      full_name: fullName,
      nombre,
      apellido,
      email,
      phone: phone || null,
      dni: dni || null,
      calle: calle || null,
      numero: numero || null,
      piso: piso || null,
      departamento: departamento || null,
      referencias: referencias || null,
      localidad: localidad || null,
      city: localidad || null,
      provincia: provincia || null,
      codigo_postal: codigo_postal || null,
      postal_code: codigo_postal || null,
      role: role || 'user',
    };

    if (fullAddress) {
      updates.address = fullAddress;
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('profiles')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating client in admin:', error.message);
      return { success: false, error: 'Error al actualizar: ' + error.message };
    }

    revalidatePath('/admin/clientes');
    revalidatePath('/admin');
    return { success: true, message: 'Cliente actualizado correctamente' };
  } catch (err: any) {
    console.error('Error in updateClientAdmin:', err);
    return { success: false, error: err.message || 'Error inesperado' };
  }
}

/**
 * Obtiene los pedidos asociados a un cliente específico
 */
export async function getClientOrders(clientId: string) {
  try {
    const adminClient = createAdminClient();
    const { data: orders, error } = await adminClient
      .from('orders')
      .select('id, total_amount, status, created_at, order_number, shipping_status')
      .eq('profile_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, orders: [] };
    }

    return { success: true, orders: orders || [] };
  } catch {
    return { success: false, orders: [] };
  }
}
