import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'spiritt.net',
      },
    ],
    domains: ['localhost', 'spiritt.net'],
  },
};

export default nextConfig;
