import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://klonfark.com';
  const baseUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl.slice(0, -1) : rawSiteUrl;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hombre`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mujer`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/suplementos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ofertas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ayuda/envios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ayuda/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ayuda/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ayuda/soporte`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: products } = await supabase
        .from('products')
        .select('id, updated_at')
        .order('updated_at', { ascending: false });

      if (products && products.length > 0) {
        const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
          url: `${baseUrl}/producto/${product.id}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));

        return [...staticRoutes, ...productRoutes];
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return staticRoutes;
}
