/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
      config.externals.push({
        'onnxruntime-node': 'commonjs onnxruntime-node',
      });
      return config;
    },
  };
  
  export default nextConfig;