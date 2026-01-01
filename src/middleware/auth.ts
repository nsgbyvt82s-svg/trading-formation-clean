import { getToken } from "next-auth/jwt";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Chemins protégés
const adminPaths = ['/admin'];
const publicPaths = ['/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si le chemin commence par /admin
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.includes(pathname);

  // Si ce n'est pas une route admin, on laisse passer
  if (!isAdminPath) {
    return NextResponse.next();
  }

  // Si c'est une route publique d'admin, on laisse passer
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Vérifier le token de session
  const token = await getToken({ req: request as any });
  
  // Si pas de token, rediriger vers la page de connexion
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier le rôle de l'utilisateur
  const userRole = token.role || 'USER';
  
  // Si l'utilisateur n'est pas admin, owner ou modo, rediriger vers la page d'accueil
  if (!['ADMIN', 'OWNER', 'MODO'].includes(userRole.toUpperCase())) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Vérifier les permissions spécifiques
  if (pathname.startsWith('/admin/settings') && userRole !== 'OWNER') {
    return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
  }

  // Autoriser l'accès
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
