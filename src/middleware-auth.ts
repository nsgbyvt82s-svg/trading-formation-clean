import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Chemins protégés
const adminPaths = ['/admin'];
const publicPaths = ['/admin/login', '/login', '/inscription', '/'];
const authPaths = ['/profil', '/paiement'];

// Emails des administrateurs
const adminEmails = [
  'compris@diamondtrade.com', 
  'vexx@diamondtrade.com',
  '1compris@diamondtrade.com'  // Ajout de l'email administrateur
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si le chemin nécessite une authentification
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Vérifier si c'est une route d'administration
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  
  // Vérifier si c'est une route publique
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Si c'est une route publique, on laisse passer
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Récupérer le token de session
  const token = await getToken({ req: request as any });
  
  // Si pas de token et que la route nécessite une authentification
  if ((!token || !token.email) && (isAuthPath || isAdminPath)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
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
