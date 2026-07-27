import { createClient } from '@/lib/supabase-server';
import { Hero } from '@/components/Hero';
import { BrandsBanner } from '@/components/BrandsBanner';
import { ProductSection } from '@/components/ProductSection';
import { BrowseStyle } from '@/components/BrowseStyle';

import { getStoreSettings } from '@/actions/settings';

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const settings = await getStoreSettings();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, reviews(rating)')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto py-24 text-center text-red-500">
        Error al cargar los productos: {error.message}
      </div>
    );
  }

  // Mocking New Arrivals and Top Selling usando los productos. 
  // Si hay pocos productos, repetimos para que la UI no quede vacía y el usuario pueda ver las secciones.
  const newArrivals = products?.slice(0, 4) || [];
  const topSelling = products && products.length > 4 ? products.slice(4, 8) : newArrivals;

  return (
    <div className="flex flex-col w-full bg-white">
      <Hero settings={settings} />
      <BrandsBanner settings={settings} />
      
      {newArrivals.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <ProductSection 
            title="NUEVOS INGRESOS" 
            products={newArrivals} 
            viewAllLink="/shop?sort=newest" 
            showDivider={true}
          />
        </div>
      )}

      {topSelling.length > 0 && (
        <ProductSection 
          title="MÁS VENDIDOS" 
          products={topSelling} 
          viewAllLink="/shop?sort=popular" 
        />
      )}

      <BrowseStyle settings={settings} />
    </div>
  );
}
