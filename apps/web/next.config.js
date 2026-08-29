/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    // Mismo-origen: el proxy de abajo reenvía /api a la API de SIGEB en dev.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_PROXY || 'http://localhost:3000/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;