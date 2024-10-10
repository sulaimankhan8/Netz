/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  scope: "/app",
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline", // Fallback to a custom offline page
  },
  workboxOptions: {
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
        // Caching strategy for JS files
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-assets",
          expiration: {
            maxEntries: 48,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        // Caching strategy for Next.js static assets
        urlPattern: /\/_next\/static.+\.js$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-js-assets",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        // Caching for external resources (excluding internal _next routes)
        urlPattern: /^https?.*\/(?!_next).*/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
          },
        },
      },
      {
        // Caching strategy for JSON data
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
      {
        // Caching for CSS files
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
      // Add other caching strategies here...
    ],
  },
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
