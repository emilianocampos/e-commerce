'use server';

import { createClient } from '@/lib/supabase-server';
import { createPublicClient } from '@/lib/supabase-public';
import { unstable_cache } from 'next/cache';

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

const fetchCachedSupplementBrands = unstable_cache(
  async () => {
    const supabase = createPublicClient();

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
  },
  ['supplement-brands'],
  { revalidate: 300, tags: ['supplement-brands'] }
);

export async function getSupplementBrands() {
  return fetchCachedSupplementBrands();
}
