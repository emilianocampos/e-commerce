'use server';

import { createClient } from '@/lib/supabase-server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene los datos completos del perfil del usuario autenticado.
 */
export async function getUserProfile() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }

  // Devolver el perfil consolidando también datos de auth.user si algunos campos de profiles vinieran vacíos
  return {
    ...profile,
    email: profile?.email || user.email || '',
    phone: profile?.phone || '',
    telefono: profile?.phone || '',
  };
}

/**
 * Actualiza los datos del perfil del usuario en la base de datos Supabase.
 */
export async function updateUserProfile(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const nombre = (formData.get('nombre') as string || '').trim();
  const apellido = (formData.get('apellido') as string || '').trim();
  const dni = (formData.get('dni') as string || '').trim();
  const telefono = (formData.get('telefono') as string || '').trim();
  const calle = (formData.get('calle') as string || '').trim();
  const numero = (formData.get('numero') as string || '').trim();
  const piso = (formData.get('piso') as string || '').trim();
  const departamento = (formData.get('departamento') as string || '').trim();
  const referencias = (formData.get('referencias') as string || '').trim();
  const provincia = (formData.get('provincia') as string || '').trim();
  const localidad = (formData.get('localidad') as string || formData.get('ciudad') as string || '').trim();
  const codigo_postal = (formData.get('codigo_postal') as string || '').trim();
  const shipping_quote_required = formData.get('shipping_quote_required') === 'true';

  if (!nombre || !apellido || !dni || !telefono || !calle || !numero || !provincia || !localidad || !codigo_postal) {
    return { success: false, error: 'Por favor completa todos los campos obligatorios (*).' };
  }

  if (telefono.replace(/\D/g, '').length < 6) {
    return { success: false, error: 'El número de teléfono debe tener al menos 6 dígitos numéricos.' };
  }

  const full_name = `${nombre} ${apellido}`.trim();
  const fullAddress = [
    `${calle} ${numero}`,
    piso ? `Piso ${piso}` : '',
    departamento ? `Dpto ${departamento}` : '',
    provincia ? `Prov ${provincia}` : '',
    referencias ? `Ref: ${referencias}` : ''
  ].filter(Boolean).join(', ');

  const supabase = await createClient();

  const updates: any = {
    full_name,
    nombre,
    apellido,
    dni,
    phone: telefono,
    address: fullAddress,
    calle,
    numero,
    piso,
    departamento,
    referencias,
    city: localidad,
    localidad,
    provincia,
    postal_code: codigo_postal,
    codigo_postal,
    shipping_quote_required,
  };

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error.message);
    return { success: false, error: 'Error al actualizar el perfil: ' + error.message };
  }

  revalidatePath('/perfil');
  revalidatePath('/mis-pedidos');
  revalidatePath('/cart');

  return { success: true, message: '¡Perfil actualizado exitosamente!' };
}

/**
 * Permite guardar rápidamente el número de teléfono/WhatsApp de un usuario
 * si no lo tenía configurado previamente antes de comprar.
 */
export async function updateUserPhone(phone: string) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const cleanPhone = phone.trim();
  if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 6) {
    return { success: false, error: 'Por favor ingresa un número de teléfono válido (mínimo 6 dígitos).' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ phone: cleanPhone })
    .eq('id', user.id);

  if (error) {
    console.error('Error saving user phone:', error.message);
    return { success: false, error: 'Error al guardar el teléfono: ' + error.message };
  }

  revalidatePath('/perfil');
  revalidatePath('/cart');

  return { success: true };
}
