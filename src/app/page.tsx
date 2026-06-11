/**
 * Archivo: src/app/page.tsx
 * Responsabilidad: Es el "Home" de la aplicación. Al ser un Server Component,
 * se conecta directamente a la base de datos para obtener el listado de productos,
 * sin necesidad de llamadas a APIs REST o carga (loading states) en el cliente.
 */
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';

// Instrucción de Next.js para que esta página no se guarde en caché permanentemente,
// sino que busque la versión más fresca siempre (útil para un catálogo en constante cambio).
export const revalidate = 0; 

export default async function Home() {
  // 1. Inicializamos el cliente de Supabase para poder hacer queries a la DB
  const supabase = await createClient();
  
  // 2. Ejecutamos la consulta: Seleccionar todo de 'products' ordenados del más nuevo al más antiguo
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Manejo de error si la base de datos falla
  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-red-500">
        Error al cargar los productos: {error.message}
      </div>
    );
  }

  // 4. Si la consulta fue exitosa, renderizamos el HTML
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado del catálogo */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Catálogo</h1>
          <p className="mt-2 text-sm text-zinc-500">Encuentra los mejores productos a un click.</p>
        </div>
      </div>

      {/* 5. Verificamos si la tienda tiene o no productos para mostrar un mensaje vacío o la grilla */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-24 text-zinc-500">
          <p>No hay productos disponibles por ahora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {/* Iteramos por cada producto usando map() y renderizamos un ProductCard */}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
