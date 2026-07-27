import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 0;

export default async function HombrePage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'hombre')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto py-24 text-center text-red-500">
        Error al cargar los productos: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 border-b border-zinc-200 pb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">
            Colección Hombre
          </h1>
          <p className="mt-4 text-zinc-500 max-w-2xl">
            Descubre nuestra selección exclusiva para hombre. Estilo, comodidad y calidad en cada prenda.
          </p>
        </div>

        {(!products || products.length === 0) ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white border border-zinc-200 py-32 text-zinc-500">
            <p>No hay productos disponibles por ahora en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
