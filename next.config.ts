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

  async redirects() {
    return [
      {
        source: "/sales/invoices",
        destination: "/dashboard/sales",
        permanent: false,
      },
      {
        source: "/sales/invoices/:id",
        destination: "/dashboard/sales/:id",
        permanent: false,
      },
      {
        source: "/inventory/stock",
        destination: "/inventory/products",
        permanent: false,
      },
      {
        source: "/dashboard/stock",
        destination: "/inventory/products",
        permanent: false,
      },
    ]
  },

  // Optional:
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    // If no API base URL is configured, skip rewrites to avoid crashing `next dev`.
    // (You can still run the UI against mock data.)
    if (!apiBaseUrl) return []

    // Next.js requires `destination` to be an absolute URL or start with `/`.
    // We only accept absolute URLs here.
    if (!/^https?:\/\//.test(apiBaseUrl)) return []

    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ]
  }
};

export default nextConfig;