/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: true,
  images: {
    // disabling this to avoid going over limits
    unoptimized: true,
  },
};

module.exports = nextConfig;
