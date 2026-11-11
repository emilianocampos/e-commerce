import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 días de caché en el CDN de Vercel para no re-descargar de Supabase a Compute
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uptfdcaubsbjazhysdqf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'sweetalert2',
      'qrcode',
      'nextjs-toast-notify',
      '@supabase/supabase-js',
      '@supabase/ssr',
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'e-commerce-emi-campos.vercel.app',
          },
        ],
        destination: 'https://klonfark.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.klonfark.com',
          },
        ],
        destination: 'https://klonfark.com/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/devoluciones',
        destination: '/ayuda/devoluciones',
      },
      {
        source: '/cambios-y-devoluciones',
        destination: '/ayuda/devoluciones',
      },
      {
        source: '/politica-de-devolucion',
        destination: '/ayuda/devoluciones',
      },
      {
        source: '/politicas-de-devolucion',
        destination: '/ayuda/devoluciones',
      },
      {
        source: '/merchant-feed.xml',
        destination: '/api/merchant-feed',
      },
      {
        source: '/feed.xml',
        destination: '/api/merchant-feed',
      },
      {
        source: '/merchant-feed.txt',
        destination: '/api/merchant-feed?format=txt',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
