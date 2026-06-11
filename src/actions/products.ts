/**
 * Archivo: src/actions/products.ts
 * Responsabilidad: Albergar las Server Actions que realizan operaciones de CRUD de productos.
 * Todos estos métodos aseguran primero que el usuario activo tenga el rol 'admin'
 * antes de efectuar cualquier cambio en Supabase (base de datos o storage).
 */
'use server'; // Indica a Next.js que todas estas funciones se corren en el servidor y no en el cliente.

import { createClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { uploadProductImage, deleteProductImage } from '@/lib/storage';

/**
 * Crea un nuevo producto en la base de datos de Supabase y sube su imagen asociada.
 * Únicamente ejecutable por un administrador autorizado.
 * @param {FormData} formData - Datos del formulario de creación de producto.
 * @returns {Promise<{error?: string, success?: boolean}>} Éxito o el mensaje de error.
 */
export async function createProduct(_prevState: any, formData: FormData) {
  // 1. Validar que quien intenta ejecutar esto sea realmente un administrador
  await requireAdmin(); // Si no lo es, esta función lanzará un error y detendrá la ejecución aquí mismo.

  // 2. Extraer todos los valores de los campos del formulario, y forzarlos a ser de su tipo correcto
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string); // Convertimos el precio a número flotante
  const stock = parseInt(formData.get('stock') as string, 10); // Convertimos el stock a entero base 10
  const category = formData.get('category') as string;
  const imageFile = formData.get('image') as File | null; // El archivo de imagen (si el usuario subió una)

  // 3. Validación de datos: asegurarnos de que los valores numéricos y campos obligatorios estén presentes
  if (!title || isNaN(price) || isNaN(stock)) {
    return { error: 'Faltan campos requeridos o son inválidos' };
  }

  // 4. Gestión de subida de la imagen
  let imageUrl = null;
  // Verificamos si el usuario seleccionó un archivo válido
  if (imageFile && imageFile.size > 0) {
    // Usamos nuestra función utilitaria para subir el archivo a Supabase Storage y obtener la URL
    imageUrl = await uploadProductImage(imageFile);
  }

  // 5. Inicializamos Supabase
  const supabase = await createClient();
  
  // 6. Insertamos un nuevo registro en la tabla 'products'
  const { error } = await supabase.from('products').insert({
    title,
    description,
    price,
    stock,
    category,
    image: imageUrl, // Guardamos la URL pública de la imagen (o null si no hay)
  });

  // 7. Si falló la inserción en base de datos, retornamos el error
  if (error) {
    return { error: error.message };
  }

  // 8. En Next.js App Router la cache es agresiva. Con esto le decimos a Next.js que 
  // limpie el caché del home y del listado de admin para que el nuevo producto aparezca inmediatamente.
  revalidatePath('/');
  revalidatePath('/admin/productos');
  
  return { success: true };
}

/**
 * Actualiza los datos de un producto existente. Si se provee una imagen nueva, 
 * reemplaza la anterior en Storage. Requiere permisos de administrador.
 * @param {string} id - Identificador único del producto a modificar.
 * @param {FormData} formData - Nuevos valores.
 * @returns {Promise<{error?: string, success?: boolean}>} Éxito o el mensaje de error.
 */
export async function updateProduct(id: string, formData: FormData) {
  // 1. Verificamos que sea administrador
  await requireAdmin();

  // 2. Extraemos todos los valores actualizados del formulario
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const category = formData.get('category') as string;
  const imageFile = formData.get('image') as File | null;

  // 3. Validamos que el administrador no haya borrado el título o puesto precios inválidos
  if (!title || isNaN(price) || isNaN(stock)) {
    return { error: 'Faltan campos requeridos o son inválidos' };
  }

  // 4. Inicializamos Supabase
  const supabase = await createClient();

  // 5. Gestión de actualización de imagen (Si es que el admin subió una imagen nueva)
  let imageUrl = undefined;
  if (imageFile && imageFile.size > 0) {
    // Si subió una imagen, primero subimos la nueva a Storage
    imageUrl = await uploadProductImage(imageFile);
    
    // Y luego buscamos la imagen antigua en la base de datos para eliminarla y no ocupar espacio basura
    const { data: oldProduct } = await supabase.from('products').select('image').eq('id', id).single();
    if (oldProduct?.image) {
      // Borramos físicamente la imagen antigua de Supabase Storage
      await deleteProductImage(oldProduct.image);
    }
  }

  // 6. Preparamos el objeto con los datos a actualizar
  const updateData: any = {
    title,
    description,
    price,
    stock,
    category,
  };

  // Solo incluimos la imagen en la actualización si se generó una nueva URL
  if (imageUrl) {
    updateData.image = imageUrl;
  }

  // 7. Ejecutamos la actualización (UPDATE) sobre la tabla de productos donde el id coincida
  const { error } = await supabase.from('products').update(updateData).eq('id', id);

  if (error) {
    return { error: error.message };
  }

  // 8. Volvemos a limpiar la cache para que se vea la actualización
  revalidatePath('/');
  revalidatePath('/admin/productos');
  revalidatePath(`/producto/${id}`); // Invalidamos específicamente la ruta de ese producto
  
  return { success: true };
}

/**
 * Elimina un producto y purga de igual modo su imagen vinculada en Storage.
 * Requiere permisos de administrador. 
 * Invoca `revalidatePath` al finalizar para reflejar los cambios globalmente sin recargar.
 * @param {string} id - Identificador del producto a eliminar.
 * @returns {Promise<{error?: string, success?: boolean}>} Éxito o el mensaje de error.
 */
export async function deleteProduct(id: string) {
  // 1. Verificamos rol
  await requireAdmin();

  // 2. Inicializamos cliente
  const supabase = await createClient();

  // 3. Antes de eliminar el producto, tenemos que obtener qué imagen tenía asociada para borrarla de Storage
  const { data: product } = await supabase.from('products').select('image').eq('id', id).single();
  
  if (product?.image) {
    await deleteProductImage(product.image); // Borramos la imagen en el Storage
  }

  // 4. Una vez la imagen no está, borramos la fila en la base de datos (DELETE)
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  // 5. Invalidamos cache
  revalidatePath('/');
  revalidatePath('/admin/productos');
  return { success: true };
}
