/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: {
          loader: 'workerize-loader',
          options: {
            inline: true,
          },
        },
      });
    }
    return config;
  },
};

export default nextConfig;
