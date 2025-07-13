import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Correctly handle wasm files
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true, layers: true };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource'
    });
    
    // This is to fix a build error with genkit/core when it tries to import optional dependencies.
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'fs': false,
            'net': false,
            'tls': false,
            '@opentelemetry/exporter-jaeger': false,
            'node:worker_threads': false
        };
    }
    
    // This is to fix a build error with handlebars.
    config.externals.push({
      'handlebars': 'handlebars'
    });
    
    return config;
  },
};

export default nextConfig;
