// next-sitemap.config.js

// next-sitemap.config.js

module.exports = {
  // Base URL of your site
  siteUrl: process.env.SITE_URL || 'https://netz-ruby.vercel.app',

  // Automatically generate robots.txt
  generateRobotsTxt: true,

  // Options for robots.txt
  robotsTxtOptions: {
    // If you have additional sitemap files, list their URLs here
    // For example:
    // additionalSitemaps: [
    //   'https://netz-ruby.vercel.app/sitemap-blog.xml',
    //   'https://netz-ruby.vercel.app/sitemap-products.xml',
    // ],
  },

  // Exclude specific paths from the sitemap
  exclude: [
    '/admin/**',        // Example: Exclude all admin routes
    '/secret-page',     // Example: Exclude a specific page
    // Add more paths or patterns as needed
  ],

  // Customize how each URL is transformed in the sitemap
  transform: async (config, path) => {
    let priority = 0.5;          // Default priority
    let changefreq = 'daily';    // Default change frequency

    // Customize priority and changefreq for specific important pages
    if (path === '/newton-backward' || path === '/newton-forward') {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,                            // URL location
      changefreq,                           // Change frequency
      priority,                             // Priority of the URL
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined, // Last modification date
      // You can add more fields like `alternateRefs` for multilingual sites
    };
  },

  // Optional: Define how to handle trailing slashes
  trailingSlash: false,

  // Optional: Define the sitemap generation priority
  // Defaults are generally sufficient, but you can adjust if needed
};
