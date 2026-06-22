const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output for a small production Docker image.
  output: 'standalone',
  experimental: {
    // Trace files from the monorepo root so workspace deps are bundled.
    // (Top-level `outputFileTracingRoot` in Next 15+; under `experimental` in Next 14.)
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

module.exports = nextConfig;
