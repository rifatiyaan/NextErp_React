import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },

      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },


  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // TypeScript এরর থাকলেও বিল্ড সাকসেসফুল হবে
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optional: 
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      }
    ]
  }
};

export default nextConfig;