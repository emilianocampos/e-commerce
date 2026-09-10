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
    tiktok_url: formData.get('tiktok_url'),
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
    show_stats_numbers: formData.get('show_stats_numbers') === 'true',
    style_1_title: formData.get('style_1_title'),
    style_1_link: formData.get('style_1_link'),
    style_2_title: formData.get('style_2_title'),
    style_2_link: formData.get('style_2_link'),
    style_3_title: formData.get('style_3_title'),
    style_3_link: formData.get('style_3_link'),
    style_4_title: formData.get('style_4_title'),
    style_4_link: formData.get('style_4_link'),
    discount_code: formData.get('discount_code'),
    discount_percentage: formData.get('discount_percentage') ? Number(formData.get('discount_percentage')) : 0,
    theme_mode: formData.get('theme_mode') || 'light',
    gradient_color_from: formData.get('gradient_color_from') || '#18181b',
    gradient_color_to: formData.get('gradient_color_to') || '#09090b',
    gradient_text_primary: formData.get('gradient_text_primary') || '#ffffff',
    gradient_text_secondary: formData.get('gradient_text_secondary') || '#d4d4d8',
    card_glow_color: formData.get('card_glow_color') || '#10b981',
    google_tag_id: formData.get('google_tag_id') ? String(formData.get('google_tag_id')).trim() : null,
    google_site_verification: formData.get('google_site_verification') ? String(formData.get('google_site_verification')).trim() : null,
    updated_at: new Date().toISOString(),
  };

  // Handle multiple discount codes if submitted
  const discountCodesJson = formData.get('discount_codes_json') as string;
  if (discountCodesJson) {
    try {
      const parsedCodes = JSON.parse(discountCodesJson);
      if (Array.isArray(parsedCodes)) {
        const cleanedCodes = parsedCodes
          .filter((item: any) => item && typeof item.code === 'string' && item.code.trim() !== '')
          .map((item: any) => ({
            code: item.code.trim().toUpperCase(),
            percentage: Math.max(0, Math.min(100, Number(item.percentage) || 0))
          }));
        updates.discount_codes = cleanedCodes;
        if (cleanedCodes.length > 0) {
          updates.discount_code = cleanedCodes[0].code;
          updates.discount_percentage = cleanedCodes[0].percentage;
        } else {
          updates.discount_code = '';
          updates.discount_percentage = 0;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const storeLogoFile = formData.get('store_logo_file') as File;
  const heroImageFile = formData.get('hero_image_file') as File;
  const heroMobileImageFile = formData.get('hero_mobile_image_file') as File;

  const faviconFile = formData.get('favicon_file') as File;
  if (faviconFile && faviconFile.size > 0) {
    const fileExt = faviconFile.name.split('.').pop() || 'png';
    const fileName = `favicon_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(`settings/${fileName}`, faviconFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(`settings/${fileName}`);
      updates.favicon_url = publicUrlData.publicUrl;
    }
  }

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

  if (heroMobileImageFile && heroMobileImageFile.size > 0) {
    const fileExt = heroMobileImageFile.name.split('.').pop();
    const fileName = `hero_mobile_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(`settings/${fileName}`, heroMobileImageFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(`settings/${fileName}`);
      updates.hero_mobile_image_url = publicUrlData.publicUrl;
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
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const isImg = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'avif'].includes(fileExt);
      if (!isImg) {
        return { success: false, error: 'Solo se permiten archivos de imagen para los logos de las marcas.' };
      }
      const mimeType = file.type || (fileExt === 'svg' ? 'image/svg+xml' : fileExt === 'jpg' ? 'image/jpeg' : `image/${fileExt}`);
      const fileName = `brand_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(`settings/${fileName}`, file, { upsert: true, contentType: mimeType });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(`settings/${fileName}`);
        currentBrands.push({ type: 'image', value: publicUrlData.publicUrl });
      } else {
        console.error('Error al subir logo de marca:', uploadError);
      }
    }
  }
  updates.brands_images = currentBrands;

  let updateErr: any = null;
  let attempts = 0;

  // Retry loop: if a column does not exist in store_settings, remove it and update the remaining fields
  while (attempts < 10) {
    attempts++;
    const { error } = await supabase
      .from('store_settings')
      .update(updates)
      .eq('id', 1);

    if (!error) {
      updateErr = null;
      break;
    }

    const match = error.message.match(/Could not find the '(.*?)' column/);
    if (match && match[1] && match[1] in updates) {
      delete updates[match[1]];
      updateErr = error;
    } else {
      updateErr = error;
      break;
    }
  }

  if (updateErr) {
    return { success: false, error: 'Error al actualizar configuración: ' + updateErr.message };
  }

  revalidatePath('/', 'layout');
  
  return { success: true };
}

export async function validateDiscountCode(code: string) {
  if (!code || !code.trim()) return { success: false, error: 'Código inválido' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al validar código' };
  }

  const cleanCode = code.trim().toUpperCase();

  // Check in discount_codes array if present
  let codesList: { code: string; percentage: number }[] = [];
  if (data.discount_codes) {
    if (typeof data.discount_codes === 'string') {
      try {
        codesList = JSON.parse(data.discount_codes);
      } catch (e) {}
    } else if (Array.isArray(data.discount_codes)) {
      codesList = data.discount_codes;
    }
  }

  // Also check legacy single code if list is empty
  if ((!codesList || codesList.length === 0) && data.discount_code) {
    codesList.push({
      code: data.discount_code,
      percentage: Number(data.discount_percentage) || 0
    });
  }

  const found = codesList.find(c => c && typeof c.code === 'string' && c.code.trim().toUpperCase() === cleanCode);
  if (found && Number(found.percentage) > 0) {
    return { success: true, percentage: Number(found.percentage), code: found.code.trim().toUpperCase() };
  }

  if (data.discount_code && data.discount_code.trim().toUpperCase() === cleanCode && Number(data.discount_percentage) > 0) {
    return { success: true, percentage: Number(data.discount_percentage) || 0, code: data.discount_code.trim().toUpperCase() };
  }

  return { success: false, error: 'Código inválido o expirado' };
}
