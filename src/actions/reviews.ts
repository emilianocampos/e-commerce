'use server';

import { createClient } from '@/lib/supabase-server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createReview(prevState: any, formData: FormData) {
  const user = await getUser();
  
  if (!user) {
    return { error: 'Debes iniciar sesión para dejar una reseña.' };
  }

  const productId = formData.get('product_id') as string;
  const ratingStr = formData.get('rating') as string;
  const comment = formData.get('comment') as string;

  if (!productId || !ratingStr) {
    return { error: 'Faltan campos requeridos.' };
  }

  const rating = parseInt(ratingStr, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'La calificación debe ser entre 1 y 5 estrellas.' };
  }

  const supabase = await createClient();

  // Asegurar que el usuario tenga un perfil en la tabla profiles para evitar error de Foreign Key
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      role: 'user'
    });
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    profile_id: user.id,
    rating,
    comment: comment || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/producto/${productId}`);
  revalidatePath('/');
  revalidatePath('/shop');
  
  return { success: true };
}
