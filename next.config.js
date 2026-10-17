/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // ESLint runs in dev/CI; don't let a plugin version mismatch block production builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
