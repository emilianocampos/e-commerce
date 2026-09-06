import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { ShopFilters } from '@/components/ShopFilters';
import { ShopSearchBar } from '@/components/ShopSearchBar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explora nuestra colección completa de ropa y accesorios. Encuentra lo que combina con tu estilo en KLONFARK.',
  openGraph: {
    title: 'Tienda | KLONFARK',
    description: 'Explora nuestra colección completa de ropa y accesorios. Encuentra lo que combina con tu estilo en KLONFARK.',
  }
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('products').select('*, reviews(rating), product_variants(size, color)');

  // URL Params mappings for Type and Gender
  if (params.type) query = query.eq('type', params.type);
  if (params.gender) query = query.eq('gender', params.gender);
  if (params.category_name === 'urbano') {
    query = query.eq('type', 'CLOTHES').eq('gender', 'UNISEX');
    if (params.urbano_category) {
      query = query.eq('urbano_category', params.urbano_category);
    }
  }

  // Brand Filter
  if (params.brand_id) {
    query = query.eq('brand_id', params.brand_id);
  }

  // On Sale Filter
  if (params.on_sale === 'true' || params.ofertas === 'true') {
    query = query.not('sale_price', 'is', null).gt('sale_price', 0);
  }

  // Search by title or description
  if (params.q) {
    const searchVal = String(params.q).trim();
    if (searchVal) {
      query = query.or(`title.ilike.%${searchVal}%,description.ilike.%${searchVal}%`);
    }
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
  const sort = params.sort as string || 'newest';
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  }

  const { data: products, error } = await query;

  // Filtrado en memoria por Color si se especificó
  let filteredProducts = products || [];
  if (params.color) {
    const filterColors = Array.isArray(params.color) ? params.color : [params.color];
    filteredProducts = filteredProducts.filter((p: any) => {
      return p.product_variants?.some((v: any) => 
        v.color && filterColors.some((fc: string) => fc.trim().toLowerCase() === v.color.trim().toLowerCase())
      );
    });
  }

  // Determine dynamic title
  let pageTitle = 'Todos los productos';
  if (params.on_sale === 'true' || params.ofertas === 'true') pageTitle = 'Ofertas';
  if (params.type === 'SUPPLEMENT') {
    pageTitle = 'Suplementos';
    if (params.brand_id) {
      const brand = await supabase.from('brands').select('name').eq('id', params.brand_id).single();
      if (brand.data) pageTitle = `Suplementos ${brand.data.name}`;
    }
  }
  if (params.gender === 'MEN') pageTitle = 'Hombre';
  if (params.gender === 'WOMEN') pageTitle = 'Mujer';
  if (params.category_name === 'urbano') {
    pageTitle = 'Urbano';
    if (params.urbano_category === 'MEN') pageTitle = 'Urbano Hombre';
    if (params.urbano_category === 'WOMEN') pageTitle = 'Urbano Mujer';
    if (params.urbano_category === 'UNISEX') pageTitle = 'Urbano Unisex';
  }
  if (params.q) pageTitle = `Resultados para "${params.q}"`;

  // Helper to build URL for sorting
  const buildSortUrl = (newSort: string) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (key !== 'sort' && val !== undefined) {
        if (Array.isArray(val)) {
          val.forEach(v => p.append(key, v));
        } else {
          p.set(key, val);
        }
      }
    });
    p.set('sort', newSort);
    return `/shop?${p.toString()}`;
  };

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
          {/* Functional Search Bar */}
          <Suspense fallback={null}>
            <ShopSearchBar />
          </Suspense>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="text-[28px] md:text-[32px] font-black text-zinc-900 leading-none m-0 p-0">
              {pageTitle}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-zinc-500 text-sm">
              <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'Producto' : 'Productos'}</span>
              <span className="hidden sm:inline mx-1 text-zinc-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400">Ordenar:</span>
                <div className="flex items-center gap-1 text-xs font-bold bg-zinc-800/90 border border-zinc-700/80 p-1 rounded-xl">
                  <Link
                    href={buildSortUrl('newest')}
                    className={`px-3 py-1.5 rounded-lg transition ${sort === 'newest' ? 'bg-white text-zinc-950 shadow-sm font-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Recientes
                  </Link>
                  <Link
                    href={buildSortUrl('price_asc')}
                    className={`px-3 py-1.5 rounded-lg transition ${sort === 'price_asc' ? 'bg-white text-zinc-950 shadow-sm font-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    $ Menor
                  </Link>
                  <Link
                    href={buildSortUrl('price_desc')}
                    className={`px-3 py-1.5 rounded-lg transition ${sort === 'price_desc' ? 'bg-white text-zinc-950 shadow-sm font-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    $ Mayor
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6">
              Error al cargar productos: {error.message}
            </div>
          )}

          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8">
              {filteredProducts.map((product) => (
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
