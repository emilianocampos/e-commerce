'use server';

import { createClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface ImportRow {
  producto: string;
  marca: string;
  entrada?: number;
  salida?: number;
  stock: number;
  precio: number;
}

export async function processExcelImport(rows: ImportRow[], type: string, gender: string | null) {
  await requireAdmin();
  const supabase = await createClient();

  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (!row.producto || typeof row.precio !== 'number' || typeof row.stock !== 'number') {
        results.errors.push(`Fila ${i + 2}: Datos incompletos o formato inválido.`);
        continue;
      }

      // 1. Manejar Marca (Crear si no existe)
      let brandId = null;
      if (row.marca) {
        const { data: existingBrand, error: brandSearchError } = await supabase
          .from('brands')
          .select('id')
          .ilike('name', row.marca.trim())
          .maybeSingle();

        if (existingBrand) {
          brandId = existingBrand.id;
        } else {
          const { data: newBrand, error: brandInsertError } = await supabase
            .from('brands')
            .insert({ name: row.marca.trim(), active: true })
            .select('id')
            .single();

          if (brandInsertError) throw brandInsertError;
          brandId = newBrand.id;
        }
      }

      // Generar SKU
      let prefix = 'PROD';
      if (type === 'CLOTHES') {
        if (gender === 'MEN') prefix = 'HOMB';
        else if (gender === 'WOMEN') prefix = 'MUJE';
        else prefix = 'URBA';
      } else if (type === 'SUPPLEMENT') {
        prefix = 'SUPP';
      }
      const sku = `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // 2. Buscar Producto Existente (por titulo exacto para simplificar)
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, stock')
        .eq('title', row.producto.trim())
        .maybeSingle();

      let productId = null;

      if (existingProduct) {
        // Actualizar
        const { error: updateError } = await supabase
          .from('products')
          .update({
            price: row.precio,
            stock: row.stock,
            brand_id: brandId,
            type: type,
            gender: type === 'CLOTHES' ? gender : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProduct.id);

        if (updateError) throw updateError;
        productId = existingProduct.id;
        results.updated++;
      } else {
        // Crear
        const { data: newProd, error: insertError } = await supabase
          .from('products')
          .insert({
            title: row.producto.trim(),
            price: row.precio,
            stock: row.stock,
            brand_id: brandId,
            type: type,
            gender: type === 'CLOTHES' ? gender : null,
            sku: sku,
            active: true,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        productId = newProd.id;
        results.created++;
      }

      // Si es suplemento y hay entrada/salida, guardar
      if (type === 'SUPPLEMENT' && productId) {
        const suppData = {
          product_id: productId,
          entrada: row.entrada || 0,
          salida: row.salida || 0
        };
        await supabase.from('supplement_information').upsert(suppData);
      }
    } catch (e: any) {
      results.errors.push(`Error en fila ${i + 2} (${row.producto}): ${e.message}`);
    }
  }

  revalidatePath('/');
  revalidatePath('/admin/productos');

  return results;
}
