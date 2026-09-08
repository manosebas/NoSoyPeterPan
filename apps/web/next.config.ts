import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // El paquete compartido se publica como ESM dentro del monorepo.
  transpilePackages: ['@nspp/shared'],
  eslint: { ignoreDuringBuilds: true },
};

export default config;
