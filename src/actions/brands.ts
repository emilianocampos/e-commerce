'use server';

import { createClient } from '@/lib/supabase-server';

export async function getBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
  return data;
}

export async function getSupplementBrands() {
  const supabase = await createClient();

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('brand_id')
    .eq('type', 'SUPPLEMENT')
    .not('brand_id', 'is', null);

  if (productsError || !productsData || productsData.length === 0) {
    return [];
  }

  const brandIds = Array.from(new Set(productsData.map(p => p.brand_id).filter(Boolean)));
  if (brandIds.length === 0) return [];

  const { data: brandsData, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .in('id', brandIds)
    .eq('active', true)
    .order('name');

  if (brandsError) {
    console.error('Error fetching supplement brands:', brandsError);
    return [];
  }

  return brandsData || [];
}
