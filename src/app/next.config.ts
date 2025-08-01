
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn.com',
        port: '',
        pathname: '/**',
        },
      {
        protocol: 'https',
        hostname: '**.p16-sign-va.tiktokcdn.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;