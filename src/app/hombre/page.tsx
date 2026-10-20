import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase-server';
import { ProductGridWithLoadMore } from '@/components/ProductGridWithLoadMore';

export const metadata: Metadata = {
  title: 'Hombre',
  description: 'Descubre nuestra selección exclusiva para hombre en KLONFARK. Ropa urbana, indumentaria deportiva y estilo de vanguardia.',
  alternates: {
    canonical: '/hombre',
  },
  openGraph: {
    title: 'Colección Hombre | KLONFARK',
    description: 'Descubre nuestra selección exclusiva para hombre en KLONFARK. Ropa urbana, indumentaria deportiva y estilo de vanguardia.',
    url: 'https://klonfark.com/hombre',
  },
};

export const revalidate = 60;

export default async function HombrePage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .or('category.eq.hombre,gender.eq.MEN')
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

        <ProductGridWithLoadMore
          products={(products || []) as any}
          chunkSize={6}
          initialCount={6}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
          emptyTitle="No hay productos disponibles por ahora en esta categoría."
          emptySubtitle="Vuelve a consultar pronto o explora otras secciones de nuestra tienda."
        />
      </div>
    </div>
  );
}
