import { createRequire } from 'node:module';

const _require = createRequire(import.meta.url);
const bufferPath = _require.resolve('buffer/');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // resolve.alias works for BOTH CJS and ESM imports — resolve.fallback
      // only works for CJS require() calls. @solana/web3.js v1.98 uses ESM
      // internally, so fallback misses it and Buffer becomes undefined/partial.
      config.resolve.alias = {
        ...config.resolve.alias,
        buffer: bufferPath,
      };
      // Keep fallback for CJS modules that do `require('buffer')`
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        buffer: bufferPath,
      };
      // ProvidePlugin works for CJS; the alias above handles ESM
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
