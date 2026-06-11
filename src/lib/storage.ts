import { createClient } from './supabase-server';

/**
 * Sube una imagen al bucket "products" en Supabase Storage
 * y devuelve la URL pública.
 */
export async function uploadProductImage(file: File): Promise<string | null> {
  const supabase = await createClient();
  
  // Generar un nombre único para el archivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('products')
    .upload(fileName, file);

  if (error) {
    console.error('Error al subir la imagen:', error.message);
    return null;
  }

  // Obtener URL pública
  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Elimina una imagen del bucket "products" dada su URL pública.
 */
export async function deleteProductImage(imageUrl: string) {
  const supabase = await createClient();
  
  // Extraer el nombre del archivo de la URL
  const urlParts = imageUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  const { error } = await supabase.storage
    .from('products')
    .remove([fileName]);

  if (error) {
    console.error('Error al eliminar la imagen:', error.message);
  }
}
