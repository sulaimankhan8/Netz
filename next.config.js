/** @type {import('next').NextConfig} */

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
  // Recognition models, the ONNX runtime and ambient audio (~138 MB) are only needed in the
  // Playground. They are fetched and cached on first use instead of on every visitor's first visit.
  publicExcludes: ['!noprecache/**/*', '!onnx/**/*', '!models/**/*', '!audio/**/*'],
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // ONNX runtime files keep the same name across package upgrades, so check the network first
        urlPattern: /\/onnx\/.*\.(?:wasm|mjs)$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'onnx-runtime',
          expiration: { maxEntries: 8 },
        },
      },
      {
        // modelManager.js keeps its own Cache Storage copy of each model; do not store them twice
        urlPattern: /\/models\/.*\.onnx$/i,
        handler: 'NetworkOnly',
      },
    ],
  },
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

module.exports = withPWA(nextConfig);

