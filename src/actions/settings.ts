'use server';

import { createClient } from '@/lib/supabase-server';
import { getUser, getProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getStoreSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    // Silently return null if table doesn't exist yet
    return null;
  }
  return data;
}

export async function updateStoreSettings(prevState: any, formData: FormData) {
  const user = await getUser();
  const profile = await getProfile();

  if (!user || profile?.role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const supabase = await createClient();

  // Retrieve values from FormData
  const updates: any = {
    top_banner_text: formData.get('top_banner_text'),
    store_logo_text: formData.get('store_logo_text'),
    instagram_url: formData.get('instagram_url'),
    facebook_url: formData.get('facebook_url'),
    hero_title: formData.get('hero_title'),
    hero_title_color: formData.get('hero_title_color'),
    hero_subtitle: formData.get('hero_subtitle'),
    hero_subtitle_color: formData.get('hero_subtitle_color'),
    stats_1_number: formData.get('stats_1_number'),
    stats_1_label: formData.get('stats_1_label'),
    stats_2_number: formData.get('stats_2_number'),
    stats_2_label: formData.get('stats_2_label'),
    stats_3_number: formData.get('stats_3_number'),
    stats_3_label: formData.get('stats_3_label'),
    style_1_title: formData.get('style_1_title'),
    style_1_link: formData.get('style_1_link'),
    style_2_title: formData.get('style_2_title'),
    style_2_link: formData.get('style_2_link'),
    style_3_title: formData.get('style_3_title'),
    style_3_link: formData.get('style_3_link'),
    style_4_title: formData.get('style_4_title'),
    style_4_link: formData.get('style_4_link'),
    updated_at: new Date().toISOString(),
  };

  // Image uploads (optional)
  const storeLogoFile = formData.get('store_logo_file') as File;
  const heroImageFile = formData.get('hero_image_file') as File;

  if (storeLogoFile && storeLogoFile.size > 0) {
    const fileExt = storeLogoFile.name.split('.').pop();
    const fileName = `logo_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(`settings/${fileName}`, storeLogoFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(`settings/${fileName}`);
      updates.store_logo_url = publicUrlData.publicUrl;
    }
  }

  if (heroImageFile && heroImageFile.size > 0) {
    const fileExt = heroImageFile.name.split('.').pop();
    const fileName = `hero_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(`settings/${fileName}`, heroImageFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(`settings/${fileName}`);
      updates.hero_image_url = publicUrlData.publicUrl;
    }
  }

  // Handle styles images
  for (let i = 1; i <= 4; i++) {
    const styleFile = formData.get(`style_${i}_file`) as File;
    if (styleFile && styleFile.size > 0) {
      const fileExt = styleFile.name.split('.').pop();
      const fileName = `style_${i}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(`settings/${fileName}`, styleFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(`settings/${fileName}`);
        updates[`style_${i}_image`] = publicUrlData.publicUrl;
      }
    }
  }

  // Handle brands images (since it's a dynamic array, we might receive them as JSON string or handle uploads separately)
  // We'll process any newly uploaded brand files, and combine them with existing ones
  const brandsJson = formData.get('brands_images_json') as string;
  let currentBrands: any[] = [];
  if (brandsJson) {
    try {
      currentBrands = JSON.parse(brandsJson);
    } catch (e) {
      // ignore
    }
  }

  const brandFiles = formData.getAll('new_brand_files') as File[];
  for (const file of brandFiles) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(`settings/${fileName}`, file, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(`settings/${fileName}`);
        currentBrands.push({ type: 'image', value: publicUrlData.publicUrl });
      }
    }
  }
  updates.brands_images = currentBrands;

  const { error } = await supabase
    .from('store_settings')
    .update(updates)
    .eq('id', 1);

  if (error) {
    return { success: false, error: 'Error al actualizar configuración: ' + error.message };
  }

  revalidatePath('/', 'layout');
  
  return { success: true };
}
