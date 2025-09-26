/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {}, // Désactive Turbopack → retour sur Webpack
  },
};

module.exports = nextConfig;
