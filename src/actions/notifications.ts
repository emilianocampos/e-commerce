'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';

/**
 * Obtiene todas las notificaciones del usuario logueado.
 */
export async function getUserNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('notifications')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Marca una notificación como leída.
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('profile_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Crea una notificación para un usuario (uso interno).
 * Se usa el cliente administrador para evadir restricciones de RLS si la dispara un admin.
 */
export async function createNotification(profileId: string, title: string, message: string) {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from('notifications')
    .insert({
      profile_id: profileId,
      title,
      message,
      is_read: false
    });

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
