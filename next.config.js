/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
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
    {
      urlPattern: /\.html$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
        },
      },
    },
    {
      urlPattern: /\.js$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'js-cache',
        expiration: {
          maxEntries: 50, // Maximum number of .js files to cache
          maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
        },
      },
    },
    {
      urlPattern: /^https?.*\/(?!_next).*/, // Exclude internal _next routes
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
        },
      },
    },
    // Caching strategy for external libraries (e.g., react-joyride)
    {
      urlPattern: ({ url }) =>
        url.origin === 'https://unpkg.com' ||
        url.origin === 'https://cdn.jsdelivr.net' ||
        url.origin === 'https://cdnjs.cloudflare.com',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'external-libraries',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
        },
      },
    },
    {
      urlPattern: /^https?.*\/public\/videos\/.*\.json$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'json-data-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
        },
      },
    },
    // Caching for CSS files
    {
      urlPattern: /\.css$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'css-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
        },
      },
    },
    {
      // Caching for the offline page
      urlPattern: /^\/offline$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offline-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
        },
      },
    },
    // Other caching strategies...
  ],
  fallback: '/offline', // Set the fallback option here
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
