import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Chemins protégés et leurs rôles requis
const protectedPaths = [
  { path: '/admin', roles: ['ADMIN', 'OWNER', 'SUPERADMIN'] },
  { path: '/admin/dashboard', roles: ['ADMIN', 'OWNER', 'SUPERADMIN'] },
  { path: '/admin/moderator', roles: ['MODERATOR', 'ADMIN', 'OWNER', 'SUPERADMIN'] },
  { path: '/admin/owner', roles: ['OWNER', 'SUPERADMIN'] },
  { path: '/paiement', roles: ['USER', 'ADMIN', 'OWNER', 'SUPERADMIN'] },
];

// Chemins d'API et pages qui ne nécessitent pas de redirection
const publicPaths = [
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/login',
  '/inscription',
  '/verification',
  '/acces-refuse',
];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Ignorer les chemins publics
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Gestion spéciale pour le callback Discord
  if (pathname.startsWith('/api/auth/callback/discord')) {
    const token = await getToken({ req: request });
    let redirectUrl = '/paiement';
    
    // Vérifier le rôle de l'utilisateur pour la redirection
    const userRole = token?.role as string || 'USER';
    if (['OWNER', 'ADMIN', 'SUPERADMIN'].includes(userRole)) {
      redirectUrl = '/admin/dashboard';
    }
    
    const callbackUrl = searchParams.get('callbackUrl') || redirectUrl;
    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    return response;
  }

  // Vérifier si le chemin actuel nécessite une authentification
  const pathConfig = protectedPaths.find(config => pathname.startsWith(config.path));
  
  if (!pathConfig) {
    return NextResponse.next();
  }

  // Récupérer le token de session
  const token = await getToken({ req: request });
  
  console.log('[MIDDLEWARE] Token:', token);
  console.log('[MIDDLEWARE] Path:', pathname);
  console.log('[MIDDLEWARE] Path Config:', pathConfig);
  
  // Rediriger vers la page de connexion si non connecté
  if (!token) {
    console.log('[MIDDLEWARE] Aucun token trouvé, redirection vers la page de connexion');
    const loginUrl = new URL('/connexion', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier les rôles
  const userRole = token.role as string || 'USER';
  console.log('[MIDDLEWARE] Rôle utilisateur:', userRole);
  console.log('[MIDDLEWARE] Rôles requis:', pathConfig.roles);
  
  if (!pathConfig.roles.includes(userRole)) {
    console.log('[MIDDLEWARE] Accès refusé: rôle non autorisé');
    // Rediriger vers la page d'accès refusé si le rôle n'est pas autorisé
    return NextResponse.redirect(new URL('/acces-refuse', request.url));
  }
  
  console.log('[MIDDLEWARE] Accès autorisé pour le rôle:', userRole);
  
  // Si l'utilisateur est sur la page de connexion mais déjà connecté, rediriger en fonction du rôle
  if (pathname === '/login' && token) {
    let redirectUrl = '/paiement';
    const userRole = token.role as string || 'USER';
    
    if (['OWNER', 'ADMIN', 'SUPERADMIN'].includes(userRole)) {
      redirectUrl = '/admin/dashboard';
    }
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
