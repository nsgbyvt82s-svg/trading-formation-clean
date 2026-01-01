import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { updateSession } from '@/lib/active-sessions';

// Chemins publics (accessibles sans authentification)
const publicPaths = [
  '/login',
  '/inscription',
  '/',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/paiement',
  '/_error',
  '/api/auth/signin',
  '/api/auth/callback/credentials'
];

// Chemins qui nécessitent une authentification
const authRequiredPaths = [
  '/admin',
  '/dashboard',
  '/compte'
];

// Chemins d'administration
const adminPaths = ['/admin'];

// Rôles autorisés pour l'administration
const adminRoles = ['ADMIN', 'OWNER', 'SUPERADMIN'];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  
  // Récupérer le token de session une seule fois
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
    secureCookie: process.env.NODE_ENV === 'production'
  });
  
  // Log pour le débogage
  console.log(`[Middleware] Requête vers: ${pathname}`);
  console.log('[Middleware] Utilisateur connecté:', token ? 'Oui' : 'Non');
  if (token) {
    console.log('[Middleware] Rôle:', token.role);
    console.log('[Middleware] Email:', token.email);
  }
  
  // Liste des rôles administrateur
  const adminRoles = ['ADMIN', 'OWNER', 'SUPERADMIN'];
  const userRole = token?.role || '';
  const isAdmin = adminRoles.some(role => userRole.includes(role));
  
  // Vérifier si c'est une route publique
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Vérifier si c'est une route qui nécessite une authentification
  const isAuthRequired = authRequiredPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Vérifier si c'est une route d'administration
  const isAdminPath = adminPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Si c'est une route publique, on laisse passer
  if (isPublicPath || 
      pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/_vercel/') ||
      pathname.startsWith('/_static/') ||
      pathname.includes('.')) { // Pour les fichiers statiques
    console.log(`[Middleware] Accès autorisé (route publique): ${pathname}`);
    return NextResponse.next();
  }
  
  // Si l'utilisateur n'est pas connecté et que la route nécessite une authentification
  if (!token && isAuthRequired) {
    console.log(`[Middleware] Accès non autorisé à ${pathname}, redirection vers /login`);
    const loginUrl = new URL('/login', origin);
    // Ne pas ajouter de callbackUrl si on est déjà sur /login
    if (!pathname.startsWith('/login')) {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }
  
  // Gestion des routes d'administration
  if (isAdminPath) {
    console.log('[Middleware] Accès à une route admin demandée');
    
    // Si pas de token, rediriger vers la page de connexion
    if (!token) {
      console.log('[Middleware] Non authentifié, redirection vers /login');
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Vérifier si l'utilisateur a les droits d'administration
    if (!isAdmin) {
      console.log('[Middleware] Accès refusé - Rôle insuffisant');
      return NextResponse.redirect(new URL('/', origin));
    }
    
    // Rediriger de /admin vers /admin/dashboard si nécessaire
    if (pathname === '/admin') {
      console.log('[Middleware] Redirection vers /admin/dashboard');
      return NextResponse.redirect(new URL('/admin/dashboard', origin));
    }
    
    console.log(`[Middleware] Accès admin autorisé à ${pathname}`);
    return NextResponse.next();
  }

  // Si l'utilisateur est sur la page de connexion mais déjà connecté
  if ((pathname === '/login' || pathname === '/inscription') && token) {
    console.log('[Middleware] Utilisateur déjà connecté, redirection');
    const userRole = token.role as string;
    const isUserAdmin = userRole && adminRoles.includes(userRole);
    
    // Rediriger vers le tableau de bord admin si l'utilisateur est admin
    if (isUserAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', origin));
    }
    // Sinon rediriger vers la page d'accueil
    return NextResponse.redirect(new URL('/', origin));
  }

  // Mettre à jour la session active pour tous les utilisateurs connectés
  if (token) {
    // Définir le rôle par défaut si non défini
    const userRole = token.role || 'USER';
    const isAdmin = ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(userRole as string);
    
    // Mettre à jour la session active avec des valeurs par défaut si nécessaires
    const sessionData = {
      role: userRole as string,
      name: (token.name as string) || (token.email as string)?.split('@')[0] || 'Utilisateur',
      email: (token.email as string) || ''
    };
    
    updateSession(token.sub!, sessionData);
    
    // Pour le débogage
    console.log(`[Middleware] Session mise à jour pour l'utilisateur:`, {
      id: token.sub,
      role: userRole,
      isAdmin,
      name: token.name,
      email: token.email,
      timestamp: new Date().toISOString()
    });
    
    // Si c'est un administrateur, ajouter un en-tête personnalisé
    if (isAdmin) {
      const response = NextResponse.next();
      response.headers.set('X-User-Role', userRole as string);
      response.headers.set('X-User-Id', token.sub || '');
      return response;
    }
    return NextResponse.next();
  }

  console.log(`[Middleware] Accès autorisé à ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
