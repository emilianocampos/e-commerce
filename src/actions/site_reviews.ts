'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth';

export async function getSiteReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching site reviews:', error);
    return [];
  }
  return data || [];
}

export async function createSiteReview(formData: FormData) {
  const rating = Number(formData.get('rating'));
  const message = formData.get('message') as string;

  if (!rating || rating < 1 || rating > 5 || !message) {
    return { error: 'Por favor, proporciona una calificación válida y un mensaje.' };
  }

  const user = await getUser();
  if (!user) {
    return { error: 'Debes iniciar sesión para dejar una reseña.' };
  }

  const supabase = await createClient();
  
  // Try to get user profile name
  let name = user.email?.split('@')[0] || 'Usuario anónimo';
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();
    
  if (profile && (profile.first_name || profile.last_name)) {
    name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  }

  const { error } = await supabase.from('site_reviews').insert({
    user_id: user.id,
    name,
    rating,
    message
  });

  if (error) {
    console.error('Error creating site review:', error);
    return { error: 'Error al enviar la reseña. Inténtalo de nuevo.' };
  }

  revalidatePath('/');
  return { success: true };
}
