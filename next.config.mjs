/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Enables React's strict mode, which helps in finding potential problems in the app
    swcMinify: true, // Enable SWC-based minification for faster builds and smaller bundles
    images: {
      domains: ['your-domain.com'], // If you need to load images from an external domain
    },
  };
  
  export default nextConfig;
  