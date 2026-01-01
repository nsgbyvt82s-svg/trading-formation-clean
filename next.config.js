/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration pour le déploiement
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  
  // Configuration des en-têtes de sécurité
  async headers() {
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuration des images
  images: {
    domains: [
      'localhost',
      'votre-domaine.com',
      '*.stripe.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      's.gravatar.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configuration Webpack pour le support des modules Node.js
  webpack: (config, { isServer, dev }) => {
    // Optimisation pour les builds de production
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
    }
    
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
      };
    }
    
    return config;
  },
  
  // Configuration des variables d'environnement
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-local',
  },
  
  // Configuration TypeScript
  typescript: {
    // Active la vérification TypeScript lors du build
    ignoreBuildErrors: false,
  },
  
  // Configuration ESLint
  eslint: {
    // Exécute ESLint pendant le build
    ignoreDuringBuilds: false,
  },
  
  // Configuration pour les redirections
  async redirects() {
    return [
      // Exemple de redirection
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
  
  // Configuration pour les réécritures d'URL
  async rewrites() {
    return [
      // Exemple de réécriture
      // {
      //   source: '/api/:path*',
      //   destination: 'https://api.votresite.com/:path*',
      // },
    ];
  }
};

module.exports = nextConfig;
