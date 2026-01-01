import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Clé secrète pour NextAuth
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret';

// Liste des chemins qui ne nécessitent pas d'authentification
const publicPaths = [
  '/',
  '/login',
  '/connexion',
  '/auth/signin',
  '/inscription',
  '/api/auth',
  '/_next',
  '/static',
  '/favicon.ico',
  '/images',
  '/fonts'
];

// Vérifie si le chemin est public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`) ||
    path.startsWith('/_next/') ||
    path.startsWith('/api/')
  );
};

// Vérifie si le chemin nécessite une authentification
const isProtectedPath = (path: string) => {
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/profil',
    '/parametres',
    '/api/checkout'  // Protéger uniquement les endpoints de paiement
  ];
  
  return protectedPaths.some(protectedPath => 
    path === protectedPath || 
    path.startsWith(`${protectedPath}/`)
  );
};

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  
  // 1. Ignorer les routes publiques
  if (isPublicPath(pathname)) {
    // Si l'utilisateur est déjà connecté et accède à la page de connexion, le rediriger
    if (['/login', '/connexion', '/auth/signin'].includes(pathname)) {
      const token = await getToken({ 
        req: request, 
        secret: NEXTAUTH_SECRET 
      });
      
      if (token) {
        const callbackUrl = url.searchParams.get('callbackUrl') || '/paiement';
        url.pathname = callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`;
        url.search = '';
        return NextResponse.redirect(url);
      }
    }
    
    return NextResponse.next();
  }

  // 2. Vérifier l'authentification pour les routes protégées
  if (isProtectedPath(pathname)) {
    const token = await getToken({ 
      req: request, 
      secret: NEXTAUTH_SECRET
    });

    // Si pas de token, rediriger vers la page de connexion
    if (!token) {
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = token?.email && adminEmails.includes(token.email);
  
  // Si l'utilisateur essaie d'accéder à une route admin sans être admin
  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Pour les routes d'admin, s'assurer que l'utilisateur est connecté et admin
  if (isAdminPath && (!token || !isAdmin)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pour les routes d'authentification, rediriger si déjà connecté
  if (token && (pathname === '/login' || pathname === '/inscription')) {
    const redirectUrl = isAdmin ? '/admin/dashboard' : '/paiement';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/profil',
    '/paiement',
    '/admin/:path*',
  ],
};
