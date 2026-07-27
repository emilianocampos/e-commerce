import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { ShopFilters } from '@/components/ShopFilters';
import { ChevronDown } from 'lucide-react';

export const metadata = {
  title: 'Tienda | SHOP.CO',
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('products').select('*, reviews(rating)');

  // URL Params mappings for Type and Gender
  if (params.type) query = query.eq('type', params.type);
  if (params.gender) query = query.eq('gender', params.gender);
  if (params.category_name === 'urbano') {
    query = query.eq('type', 'CLOTHES').eq('gender', 'UNISEX');
  }

  // Search by name
  if (params.q) {
    query = query.ilike('name', `%${params.q}%`);
  }

  // Price Filters
  if (params.min_price) query = query.gte('price', parseFloat(params.min_price as string));
  if (params.max_price) query = query.lte('price', parseFloat(params.max_price as string));

  // Size Filter (Array inclusion)
  if (params.size) {
    const sizes = Array.isArray(params.size) ? params.size : [params.size];
    query = query.overlaps('sizes', sizes);
  }

  // Sorting
  const sort = params.sort as string || 'popular';
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else if (sort === 'popular') {
    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
  }

  const { data: products, error } = await query;

  // Determine dynamic title
  let pageTitle = 'Todos los productos';
  if (params.type === 'SUPPLEMENT') pageTitle = 'Suplementos';
  if (params.gender === 'MEN') pageTitle = 'Hombre';
  if (params.gender === 'WOMEN') pageTitle = 'Mujer';
  if (params.category_name === 'urbano') pageTitle = 'Urbano';
  if (params.q) pageTitle = `Resultados para "${params.q}"`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <div className="w-full md:w-[295px] shrink-0">
          <Suspense fallback={<div className="p-4">Cargando filtros...</div>}>
            <ShopFilters />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <div className="w-full flex-1">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-[32px] font-black text-zinc-900 leading-none m-0 p-0">
              {pageTitle}
            </h1>
            
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span>Mostrando 1-{products?.length || 0} de {products?.length || 0} Productos</span>
              <span className="hidden md:inline mx-2 text-zinc-300">|</span>
              <div className="flex items-center gap-1 cursor-pointer">
                <span>Ordenar por:</span>
                <span className="font-bold text-zinc-900 flex items-center">
                  {sort === 'popular' ? 'Más Popular' : sort === 'newest' ? 'Más Recientes' : 'Precio'} 
                  <ChevronDown className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6">
              Error al cargar productos: {error.message}
            </div>
          )}

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-zinc-50 rounded-[20px] border border-zinc-200">
              <h3 className="text-xl font-bold text-zinc-400 mb-2">No se encontraron productos</h3>
              <p className="text-zinc-500">Intenta cambiar los filtros para ver más resultados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
