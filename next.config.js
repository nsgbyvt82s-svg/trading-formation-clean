/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactive Turbopack explicitement
  experimental: {
    serverActions: {},
    // Désactive Turbopack
    turbotrace: false,
    // Désactive le Edge Runtime par défaut
    serverComponentsExternalPackages: []
  },
  
  // Configuration de sortie pour Netlify
  output: 'standalone',
  
  // Désactive le mode strict pour éviter des avertissements inutiles
  reactStrictMode: false,
  // Configuration Webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        worker_threads: false,
      };
    }
    return config;
  },
  // Configuration des variables d'environnement
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-' + Math.random().toString(36).substring(2),
  },
  
  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuration expérimentale
  experimental: {
    externalDir: true,
    serverActions: {}
  },
  
  // Configuration des packages externes pour les composants serveur
  serverExternalPackages: ['bcryptjs'],
  
  // Configuration Webpack - Désactiver le Edge Runtime pour les routes API
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        worker_threads: false,
      };
    }
    return config;
  },
  
  // Configuration des en-têtes (uniquement en production)
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
