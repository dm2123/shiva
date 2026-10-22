/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
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
