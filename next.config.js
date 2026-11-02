/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Marketing SIRF GitHub Pages par hai (user ka FINAL faisla). Render par
  // marketing pages NAHI hain — ye purane JSX routes ke pate sirf Pages ke
  // sambandhit HTML paton par redirect karte hain taaki dead link na bane.
  async redirects() {
    return [
      {
        source: '/scholarship',
        destination: 'https://dm2123.github.io/shiva/scholarship.html',
        permanent: false,
      },
      {
        source: '/results',
        destination: 'https://dm2123.github.io/shiva/results.html',
        permanent: false,
      },
    ];
  },
  reactStrictMode: true,
  swcMinify: true,
  // ESLint runs in dev/CI; don't let a plugin version mismatch block production builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Explicit webpack alias for '@' -> src. Next.js normally derives this from
  // tsconfig.json paths, but that resolution silently fails in some CI/build
  // environments (e.g. Render). Setting it here guarantees '@/...' works.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
