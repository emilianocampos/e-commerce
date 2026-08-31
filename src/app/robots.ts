import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://klonfark.com';
  const baseUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl.slice(0, -1) : rawSiteUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/perfil',
          '/mis-pedidos',
          '/pago/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
