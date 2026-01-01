// Type pour les en-têtes de sécurité
type SecurityHeaders = {
  'X-Content-Type-Options'?: string;
  'X-Frame-Options'?: string;
  'X-XSS-Protection'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Content-Security-Policy'?: string;
};

// Configuration des en-têtes de sécurité
export const securityHeaders: SecurityHeaders = process.env.NODE_ENV === 'production' 
  ? {
      // Configuration de production stricte
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://*",
        "font-src 'self'",
        "connect-src 'self'"
      ].join('; '),
    }
  : {
      // Configuration de développement plus permissive
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' http://localhost:* ws://localhost:*;",
    };

// Configuration des rôles
export const ROLES = {
  OWNER: {
    level: 3,
    redirectPath: '/admin/owner',
  },
  ADMIN: {
    level: 2,
    redirectPath: '/admin/dashboard',
  },
  MODERATOR: {
    level: 1,
    redirectPath: '/admin/moderator',
  },
  USER: {
    level: 0,
    redirectPath: '/',
  },
};

// Chemins publics
const publicPaths = ['/connexion', '/api/auth', '/_next', '/favicon.ico'];

export function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path)) || pathname === '/';
}

// Configuration du rate limiting
export const rateLimitConfig = {
  maxRequests: 100, // Nombre maximum de requêtes
  timeWindow: '1 m', // Fenêtre de temps (1 minute)
};

// Configuration CORS
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_APP_URL
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-CSRF-Token',
  ],
  credentials: true,
  maxAge: 86400, // 24 heures
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Configuration de la sécurité des cookies
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 1 semaine
};

// Configuration du CSRF
export const csrfConfig = {
  cookieName: 'XSRF-TOKEN',
  secret: process.env.CSRF_SECRET || 'your-secret-key',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

// Configuration du rate limiting pour les requêtes API
export const apiRateLimitConfig = {
  public: {
    max: 100, // 100 requêtes par fenêtre
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  auth: {
    max: 10, // 10 tentatives de connexion
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
};

// Configuration de la journalisation
export const loggingConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug', // Niveau de journalisation
  format: 'json', // Format des logs
  timestamp: true, // Inclure les horodatages
  colorize: process.env.NODE_ENV !== 'production', // Couleurs en développement
};

// Configuration de la sécurité des en-têtes HTTP
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 63072000, // 2 ans en secondes
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'same-origin' },
};

// Configuration du pare-feu d'application Web (WAF)
export const wafConfig = {
  enabled: process.env.NODE_ENV === 'production',
  rules: [
    // Règles de base pour bloquer les attaques courantes
    { name: 'SQL Injection', pattern: /(?:\b(?:select|insert|update|delete|drop|alter|create|exec|xp_cmdshell|--|\/\*|\*\/|@@version|union|or\s+1=1|'\s+or\s+'1'='1')\b)/i },
    { name: 'XSS', pattern: /(?:<script\b[^>]*>|\b(?:on\w+|javascript:)[\s\S]*?\b)/i },
    { name: 'Path Traversal', pattern: /(?:\.\.\/|\.\\)/ },
    { name: 'Command Injection', pattern: /(?:;|\|\||\&\&|\`|\$\()/ },
  ],
};

// Configuration de la protection contre les attaques par force brute
export const bruteForceConfig = {
  maxAttempts: 5, // Nombre maximum de tentatives
  durationWindow: 15 * 60 * 1000, // 15 minutes
  blockDuration: 30 * 60 * 1000, // 30 minutes de blocage
};

// Configuration de la sécurité des mots de passe
export const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // jours avant expiration
  history: 5, // nombre de mots de passe à conserver dans l'historique
};

// Configuration de la sécurité des sessions
export const sessionSecurity = {
  name: '__Secure-session', // Préfixe __Secure- pour les cookies sécurisés
  rolling: true, // Renouveler le cookie à chaque requête
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 semaine
  },
};

// Configuration de la protection CSRF pour les formulaires
export const csrfProtection = {
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
};

// Configuration de la sécurité des en-têtes HTTP/2
// ... (votre configuration existante)
