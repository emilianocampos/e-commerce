import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase-server';
import { ProductGridWithLoadMore } from '@/components/ProductGridWithLoadMore';

export const metadata: Metadata = {
  title: 'Mujer',
  description: 'Descubre nuestra selección exclusiva para mujer en KLONFARK. Tendencia, estilo urbano y prendas de alta calidad.',
  alternates: {
    canonical: '/mujer',
  },
  openGraph: {
    title: 'Colección Mujer | KLONFARK',
    description: 'Descubre nuestra selección exclusiva para mujer en KLONFARK. Tendencia, estilo urbano y prendas de alta calidad.',
    url: 'https://klonfark.com/mujer',
  },
};

export const revalidate = 60;

export default async function MujerPage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .or('category.eq.mujer,gender.eq.WOMEN')
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
            Colección Mujer
          </h1>
          <p className="mt-4 text-zinc-500 max-w-2xl">
            Descubre nuestra selección exclusiva para mujer. Elegancia, estilo y tendencia en cada diseño.
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
