
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
    ],
  },
  // Basic PWA setup with next-pwa (can be enhanced later)
  // Note: For full PWA offline capabilities, you'd typically use a package like next-pwa
  // and configure a service worker. This is a starting point.
  // For now, this basic manifest makes it "add to homescreen" capable.
  // If you install next-pwa, you'd uncomment and configure something like this:
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  //   disable: process.env.NODE_ENV === 'development',
  // },
};

export default nextConfig;
