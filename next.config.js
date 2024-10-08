/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,       // Automatically registers the service worker
  skipWaiting: true,  
  runtimeCaching: [
    {
      // Cache for static assets such as JS, CSS, and fonts
      urlPattern: /\.(?:js|css|woff2|woff|eot|ttf|otf|svg|png|jpg|jpeg|gif|webp|ico|mp4|json)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
        },
      },
    },
    {
      // Cache for all HTML pages (all routes)
      urlPattern: /^https?.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-pages-cache',
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
