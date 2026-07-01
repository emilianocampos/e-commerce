import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uptfdcaubsbjazhysdqf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '5mb',
  },
};

export default nextConfig;

