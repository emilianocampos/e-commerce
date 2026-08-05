'use server';

import { createClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { uploadProductImage, deleteProductImage } from '@/lib/storage';

function generateSKU(type: string, gender: string | null): string {
  let prefix = 'PROD';
  if (type === 'CLOTHES') {
    if (gender === 'MEN') prefix = 'HOMB';
    else if (gender === 'WOMEN') prefix = 'MUJE';
    else prefix = 'URBA';
  } else if (type === 'SUPPLEMENT') {
    prefix = 'SUPP';
  }
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomPart}`;
}

export async function createProduct(_prevState: any, formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const sizes = formData.getAll('sizes') as string[];

  const type = formData.get('type') as string;
  const gender = formData.get('gender') as string || null;
  const urbano_category = type === 'CLOTHES' && gender === 'UNISEX' ? formData.get('urbano_category') as string : null;
  
  // Autogenerate SKU
  const sku = generateSKU(type, gender);

  const sale_price_str = formData.get('sale_price') as string;
  const sale_price = sale_price_str ? parseFloat(sale_price_str) : null;
  const brand_name = formData.get('brand_name') as string;

  if (!title || isNaN(price) || isNaN(stock)) {
    return { error: 'Faltan campos requeridos o son inválidos' };
  }

  const supabase = await createClient();

  let brand_id = null;
  if (brand_name) {
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', brand_name.trim())
      .maybeSingle();

    if (existingBrand) {
      brand_id = existingBrand.id;
    } else {
      const { data: newBrand } = await supabase
        .from('brands')
        .insert({ name: brand_name.trim(), active: true })
        .select('id')
        .single();
      if (newBrand) brand_id = newBrand.id;
    }
  }

  // Handle Images
  const imageMainFile = formData.get('image_main') as File | null;
  let imageUrl = null;
  if (imageMainFile && imageMainFile.size > 0) {
    try {
      imageUrl = await uploadProductImage(imageMainFile);
    } catch (e: any) {
      return { error: e.message };
    }
  }

  const optFiles = [
    formData.get('image_opt_1') as File | null,
    formData.get('image_opt_2') as File | null,
    formData.get('image_opt_3') as File | null
  ];

  const { data: newProduct, error } = await supabase.from('products').insert({
    title,
    description,
    price,
    stock,
    sizes: type === 'CLOTHES' ? sizes : [],
    image: imageUrl,
    type,
    gender: type === 'CLOTHES' ? gender : null,
    urbano_category,
    sku,
    sale_price,
    brand_id,
    active: true,
  }).select('id').single();

  if (error) {
    return { error: error.message };
  }

  // Upload and insert optional images
  for (let i = 0; i < optFiles.length; i++) {
    const file = optFiles[i];
    if (file && file.size > 0) {
      try {
        const url = await uploadProductImage(file);
        await supabase.from('product_images').insert({
          product_id: newProduct.id,
          url: url,
          order: i + 1
        });
      } catch (e: any) {
        console.error("Error uploading optional image:", e);
      }
    }
  }

  // Insertar variantes de ropa (talle + color)
  if (type === 'CLOTHES' && newProduct && sizes.length > 0) {
    // Validar que cada talle tenga al menos un color
    for (const size of sizes) {
      const colorStr = formData.get(`size_color_${size}`) as string || '';
      const colors = colorStr.split(',').map(c => c.trim()).filter(Boolean);
      if (colors.length === 0) {
        await supabase.from('products').delete().eq('id', newProduct.id);
        return { error: `El talle ${size} debe tener al menos un color asignado.` };
      }
    }

    const variantInserts: any[] = [];
    sizes.forEach((size) => {
      const colorStr = formData.get(`size_color_${size}`) as string || '';
      const colors = colorStr.split(',').map(c => c.trim()).filter(Boolean);
      colors.forEach(color => {
        variantInserts.push({
          product_id: newProduct.id,
          size,
          color,
          stock: Math.floor(stock / sizes.length) || stock,
        });
      });
    });
    if (variantInserts.length > 0) {
      await supabase.from('product_variants').insert(variantInserts);
    }
  }

  // Insertar supplement_information si es suplemento
  if (type === 'SUPPLEMENT' && newProduct) {
    const servingsStr = formData.get('supp_servings') as string;
    const netWeightStr = formData.get('supp_net_weight') as string;
    const gramsStr = formData.get('supp_grams') as string;
    const entradaStr = formData.get('supp_entrada') as string;
    const salidaStr = formData.get('supp_salida') as string;

    const suppData = {
      product_id: newProduct.id,
      servings: servingsStr ? parseInt(servingsStr, 10) : null,
      flavor: formData.get('supp_flavor') as string || null,
      net_weight: netWeightStr ? parseFloat(netWeightStr) : null,
      grams: gramsStr ? parseFloat(gramsStr) : null,
      ingredients: formData.get('supp_ingredients') as string || null,
      entrada: entradaStr ? parseInt(entradaStr, 10) : null,
      salida: salidaStr ? parseInt(salidaStr, 10) : null,
    };
    
    await supabase.from('supplement_information').insert(suppData);
  }

  revalidatePath('/');
  revalidatePath('/admin/productos');

  return { success: true };
}

export async function updateProduct(id: string, _prevState: any, formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const sizes = formData.getAll('sizes') as string[];

  const type = formData.get('type') as string;
  const gender = formData.get('gender') as string || null;
  const urbano_category = type === 'CLOTHES' && gender === 'UNISEX' ? formData.get('urbano_category') as string : null;
  
  const sale_price_str = formData.get('sale_price') as string;
  const sale_price = sale_price_str ? parseFloat(sale_price_str) : null;
  const brand_name = formData.get('brand_name') as string;

  if (!title || isNaN(price) || isNaN(stock)) {
    return { error: 'Faltan campos requeridos o son inválidos' };
  }

  const supabase = await createClient();

  let brand_id = null;
  if (brand_name) {
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', brand_name.trim())
      .maybeSingle();

    if (existingBrand) {
      brand_id = existingBrand.id;
    } else {
      const { data: newBrand } = await supabase
        .from('brands')
        .insert({ name: brand_name.trim(), active: true })
        .select('id')
        .single();
      if (newBrand) brand_id = newBrand.id;
    }
  }

  const imageMainFile = formData.get('image_main') as File | null;
  let imageUrl = undefined;
  if (imageMainFile && imageMainFile.size > 0) {
    try {
      imageUrl = await uploadProductImage(imageMainFile);
      const { data: oldProduct } = await supabase.from('products').select('image').eq('id', id).single();
      if (oldProduct?.image) {
        await deleteProductImage(oldProduct.image);
      }
    } catch (e: any) {
      return { error: e.message };
    }
  }

  // We are skipping deletion of optional images here for simplicity,
  // but we can upload new optional images that replace or add.
  const optFiles = [
    formData.get('image_opt_1') as File | null,
    formData.get('image_opt_2') as File | null,
    formData.get('image_opt_3') as File | null
  ];

  for (let i = 0; i < optFiles.length; i++) {
    const file = optFiles[i];
    if (file && file.size > 0) {
      try {
        const { data: oldOptImage } = await supabase.from('product_images').select('url').eq('product_id', id).eq('order', i + 1).maybeSingle();
        if (oldOptImage?.url) {
          try {
            await deleteProductImage(oldOptImage.url);
            await supabase.from('product_images').delete().eq('product_id', id).eq('order', i + 1);
          } catch (delError) {
            console.error("Error deleting old optional image:", delError);
          }
        }

        const url = await uploadProductImage(file);
        await supabase.from('product_images').insert({
          product_id: id,
          url: url,
          order: i + 1
        });
      } catch (e: any) {
        console.error("Error uploading optional image:", e);
      }
    }
  }

  const updateData: any = {
    title,
    description,
    price,
    stock,
    sizes: type === 'CLOTHES' ? sizes : [],
    type,
    gender: type === 'CLOTHES' ? gender : null,
    urbano_category,
    sale_price,
    brand_id,
    updated_at: new Date().toISOString(),
  };

  if (imageUrl) {
    updateData.image = imageUrl;
  }

  const { error } = await supabase.from('products').update(updateData).eq('id', id);

  if (error) {
    return { error: error.message };
  }

  if (type === 'CLOTHES') {
    if (sizes.length > 0) {
      for (const size of sizes) {
        const colorStr = formData.get(`size_color_${size}`) as string || '';
        const colors = colorStr.split(',').map(c => c.trim()).filter(Boolean);
        if (colors.length === 0) {
          return { error: `El talle ${size} debe tener al menos un color asignado.` };
        }
      }
    }

    await supabase.from('product_variants').delete().eq('product_id', id);
    if (sizes.length > 0) {
      const variantInserts: any[] = [];
      sizes.forEach((size) => {
        const colorStr = formData.get(`size_color_${size}`) as string || '';
        const colors = colorStr.split(',').map(c => c.trim()).filter(Boolean);
        colors.forEach(color => {
          variantInserts.push({
            product_id: id,
            size,
            color,
            stock: Math.floor(stock / sizes.length) || stock,
          });
        });
      });
      if (variantInserts.length > 0) {
        await supabase.from('product_variants').insert(variantInserts);
      }
    }
  }

  if (type === 'SUPPLEMENT') {
    const servingsStr = formData.get('supp_servings') as string;
    const netWeightStr = formData.get('supp_net_weight') as string;
    const gramsStr = formData.get('supp_grams') as string;
    const entradaStr = formData.get('supp_entrada') as string;
    const salidaStr = formData.get('supp_salida') as string;

    const suppData = {
      product_id: id,
      servings: servingsStr ? parseInt(servingsStr, 10) : null,
      flavor: formData.get('supp_flavor') as string || null,
      net_weight: netWeightStr ? parseFloat(netWeightStr) : null,
      grams: gramsStr ? parseFloat(gramsStr) : null,
      ingredients: formData.get('supp_ingredients') as string || null,
      entrada: entradaStr ? parseInt(entradaStr, 10) : null,
      salida: salidaStr ? parseInt(salidaStr, 10) : null,
    };
    
    await supabase.from('supplement_information').upsert(suppData);
  }

  revalidatePath('/');
  revalidatePath('/admin/productos');
  revalidatePath(`/producto/${id}`);

  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: product } = await supabase.from('products').select('image').eq('id', id).single();
  if (product?.image) {
    await deleteProductImage(product.image);
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/productos');
  return { success: true };
}

export async function deleteAllProducts() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: products } = await supabase.from('products').select('image');
  
  if (products && products.length > 0) {
    for (const p of products) {
      if (p.image) {
        try {
          await deleteProductImage(p.image);
        } catch (e) {
          console.error("Error deleting image:", e);
        }
      }
    }
  }

  const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/productos');
  return { success: true };
}
