'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { VipCard, VipValidationResult } from '@/types/vip';

/**
 * Valida un código o número de tarjeta VIP ingresado por el cliente.
 * Se ejecuta de forma segura en el servidor.
 */
export async function validateVipCard(code: string): Promise<VipValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Por favor ingresa un código de tarjeta VIP.' };
  }

  const cleanCode = code.trim().toUpperCase();
  const supabase = await createClient();

  try {
    const { data: card, error } = await supabase
      .from('vip_cards')
      .select('id, card_number, client_name, discount_percentage, active')
      .ilike('card_number', cleanCode)
      .maybeSingle();

    if (error) {
      console.error('Error buscando tarjeta VIP:', error);
      return { valid: false, error: 'Error al consultar la tarjeta VIP.' };
    }

    if (!card) {
      return { valid: false, error: 'Tarjeta VIP no encontrada o número inválido.' };
    }

    if (!card.active) {
      return { valid: false, error: 'Esta tarjeta VIP se encuentra actualmente pausada o inactiva.' };
    }

    return {
      valid: true,
      card: {
        id: card.id,
        cardNumber: card.card_number,
        clientName: card.client_name,
        discountPercentage: Number(card.discount_percentage) || 10,
      }
    };
  } catch (err: any) {
    console.error('Excepción al validar tarjeta VIP:', err);
    return { valid: false, error: 'No se pudo validar la tarjeta en este momento.' };
  }
}

/**
 * Obtiene el listado completo de tarjetas VIP (solo administradores).
 */
export async function getVipCards(): Promise<VipCard[]> {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('vip_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener tarjetas VIP:', error);
    return [];
  }

  return data as VipCard[];
}

/**
 * Genera un código de tarjeta VIP único si el usuario no especifica uno.
 */
function generateVipCardNumber(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `VIP-${randomNum}`;
}

/**
 * Crea una nueva tarjeta VIP.
 */
export async function createVipCard(formData: FormData) {
  await requireAdmin();

  let cardNumber = (formData.get('card_number') as string)?.trim().toUpperCase();
  if (!cardNumber) {
    cardNumber = generateVipCardNumber();
  }

  const clientName = (formData.get('client_name') as string)?.trim();
  const clientEmail = (formData.get('client_email') as string)?.trim() || null;
  const clientPhone = (formData.get('client_phone') as string)?.trim() || null;
  const discountPercentage = parseFloat(formData.get('discount_percentage') as string) || 10;
  const notes = (formData.get('notes') as string)?.trim() || null;
  const active = formData.get('active') !== 'false';

  if (!clientName) {
    return { error: 'El nombre del cliente es obligatorio.' };
  }

  const adminClient = createAdminClient();

  // Verificar si ya existe el número de tarjeta
  const { data: existing } = await adminClient
    .from('vip_cards')
    .select('id')
    .ilike('card_number', cardNumber)
    .maybeSingle();

  if (existing) {
    return { error: `Ya existe una tarjeta con el número ${cardNumber}.` };
  }

  const { data, error } = await adminClient
    .from('vip_cards')
    .insert({
      card_number: cardNumber,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      discount_percentage: discountPercentage,
      active,
      notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear tarjeta VIP:', error);
    return { error: error.message || 'Error al guardar la tarjeta VIP.' };
  }

  revalidatePath('/admin/vip');
  return { success: true, card: data };
}

/**
 * Actualiza los datos de una tarjeta VIP existente.
 */
export async function updateVipCard(id: string, formData: FormData) {
  await requireAdmin();

  const cardNumber = (formData.get('card_number') as string)?.trim().toUpperCase();
  const clientName = (formData.get('client_name') as string)?.trim();
  const clientEmail = (formData.get('client_email') as string)?.trim() || null;
  const clientPhone = (formData.get('client_phone') as string)?.trim() || null;
  const discountPercentage = parseFloat(formData.get('discount_percentage') as string) || 10;
  const notes = (formData.get('notes') as string)?.trim() || null;
  const active = formData.get('active') === 'true';

  if (!cardNumber || !clientName) {
    return { error: 'El número de tarjeta y el nombre son obligatorios.' };
  }

  const adminClient = createAdminClient();

  // Verificar que el número de tarjeta no esté en uso por otra tarjeta
  const { data: existing } = await adminClient
    .from('vip_cards')
    .select('id')
    .ilike('card_number', cardNumber)
    .neq('id', id)
    .maybeSingle();

  if (existing) {
    return { error: `El número ${cardNumber} ya pertenece a otra tarjeta VIP.` };
  }

  const { error } = await adminClient
    .from('vip_cards')
    .update({
      card_number: cardNumber,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      discount_percentage: discountPercentage,
      active,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar tarjeta VIP:', error);
    return { error: error.message || 'Error al actualizar la tarjeta VIP.' };
  }

  revalidatePath('/admin/vip');
  return { success: true };
}

/**
 * Activa o desactiva rápidamente una tarjeta VIP.
 */
export async function toggleVipCardStatus(id: string, newActiveState: boolean) {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('vip_cards')
    .update({
      active: newActiveState,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/vip');
  return { success: true };
}

/**
 * Elimina una tarjeta VIP.
 */
export async function deleteVipCard(id: string) {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('vip_cards')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/vip');
  return { success: true };
}
