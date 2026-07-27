'use server';

import { createClient } from '@/lib/supabase-server';

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data;
}

export async function getSubcategories(categoryId?: string) {
  const supabase = await createClient();
  let query = supabase.from('subcategories').select('*').order('name');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
  return data;
}
