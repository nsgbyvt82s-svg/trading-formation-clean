import { type DefaultSession, type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Chemin vers le fichier des utilisateurs
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

// Extension des types de session et d'utilisateur
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      username: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    name?: string | null
    email: string
    role: string
    username?: string | null
  }
}

// Fonction pour lire les utilisateurs depuis le fichier
const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      console.warn('Users file does not exist, creating an empty one')
      fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2))
      return { users: [] }
    }
    
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users file:', error)
    return { users: [] }
  }
}

// Vérification des variables d'environnement
if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables')
  } else {
    console.warn('NEXTAUTH_SECRET is not defined - using development fallback')
    process.env.NEXTAUTH_SECRET = 'dev-secret-' + Math.random().toString(36).substring(2)
  }
}

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { users } = readUsers()
        const user = users.find((user: any) => user.email === credentials.email)

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role || 'user',
          username: user.username || null,
          image: null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.username = token.username as string | null
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

export { authOptions }
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-' + Math.random().toString(36).substring(2),
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || 'dummy-client-id',
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || 'dummy-client-secret',
} as const;

const authConfig: NextAuthOptions = {
  // Pas d'adapter nécessaire pour l'instant
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  secret: env.NEXTAUTH_SECRET,
  // Configuration des pages
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Configuration de sécurité
  useSecureCookies: process.env.NODE_ENV === 'production',
  // Configuration pour le développement
  debug: process.env.NODE_ENV === 'development',
  // Configuration du logger pour le débogage
  logger: process.env.NODE_ENV === 'development' ? {
    error(code, metadata) {
      console.error('Auth error:', code, metadata);
    },
    warn(code) {
      console.warn('Auth warning:', code);
    },
    debug(code, metadata) {
      console.log('Auth debug:', code, metadata);
    }
  } : undefined,
  // @ts-ignore - Ignorer les erreurs de type pour les callbacks
  callbacks: {
    // @ts-ignore - Ignorer les erreurs de type pour les callbacks
    async signIn({ user, account }) {
      try {
        console.log('signIn callback - user:', user);
        console.log('signIn callback - account:', account);
        
        // Si l'utilisateur n'existe pas, empêcher la connexion
        if (!user) {
          console.error('Aucun utilisateur trouvé dans la session');
          return false;
        }

        // S'assurer que l'utilisateur a un ID
        if (!user.id) {
          console.error('L\'utilisateur n\'a pas d\'ID');
          return false;
        }

        // Vérifier si l'utilisateur est actif (vérification optionnelle si le champ status existe)
        if ('status' in user && (user.status === 'SUSPENDED' || user.status === 'BANNED')) {
          console.error('Ce compte est suspendu ou banni');
          return false;
        }

        return true;
      } catch (error) {
        console.error('Erreur dans le callback signIn:', error);
        return false;
      }
    },
    // @ts-ignore
    async redirect({ url, baseUrl }) {
      if (url.startsWith('http')) return url;
      if (url.startsWith('/api/')) return url;
      
      const protectedPaths = ['/login', '/connexion', '/auth/'];
      const isProtectedPath = protectedPaths.some(path => 
        url.startsWith(path) || url.includes('callbackUrl=')
      );
      
      if (isProtectedPath || !url || url === '/') {
        return `${baseUrl}/paiement`;
      }
      
      return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    },
    // @ts-ignore
    async jwt({ token, user, trigger, session }) {
      console.log('JWT Callback - Token:', token);
      console.log('JWT Callback - User:', user);
      console.log('JWT Callback - Trigger:', trigger);
      
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'USER';
        token.username = (user as any).username || null;
        console.log('JWT token mis à jour avec les données utilisateur');
      }
      
      // Mise à jour du token depuis la session si nécessaire
      if (trigger === 'update' && session) {
        console.log('Mise à jour du token depuis la session:', session);
        token = { ...token, ...session };
      }
      
      console.log('JWT token final:', token);
      return token;
    },
    // @ts-ignore
    async session({ session, token }) {
      try {
        console.log('Session callback - token:', token);
        if (token && session?.user) {
          session.user = {
            ...session.user,
            id: token.id as string,
            // S'assurer que le rôle est en majuscules
            role: (token.role as string)?.toUpperCase() || 'USER',
            username: token.username as string | null || null,
          };
          console.log('Session mise à jour avec les données du token');
        }
        console.log('Session finale:', session);
        return session;
      } catch (error) {
        console.error('Erreur dans le callback de session:', error);
        return {
          ...session,
          user: {
            ...session?.user,
            id: '',
            role: 'USER',
            username: null,
          }
        };
      }
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
        username: { label: 'Nom d\'utilisateur', type: 'text' },
      },
      async authorize(credentials, req) {
        try {
          console.log('Tentative d\'authentification avec les identifiants:', {
            email: credentials?.email,
            hasPassword: !!credentials?.password
          });

          if (!credentials?.email || !credentials?.password) {
            console.error('Email ou mot de passe manquant');
            throw new Error('Veuillez fournir un email et un mot de passe');
          }

          // Vérifier si l'utilisateur existe
          console.log('Recherche de l\'utilisateur avec l\'email:', credentials.email);
          const user = findUserByEmail(credentials.email as string);
          console.log('Utilisateur trouvé:', user ? { id: user.id, email: user.email, role: user.role } : 'Aucun utilisateur trouvé');

          if (!user) {
            console.error('Aucun utilisateur trouvé pour cet email');
            throw new Error('Aucun utilisateur trouvé avec cet email');
          }

          // Vérifier le mot de passe
          console.log('Vérification du mot de passe...');
          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          );
          console.log('Résultat de la vérification du mot de passe:', isPasswordValid);

          if (!isPasswordValid) {
            console.error('Mot de passe incorrect');
            throw new Error('Mot de passe incorrect');
          }

          // Vérifier si le compte est actif
          console.log('Vérification du statut du compte:', user.status);
          if (user.status !== 'active') {
            console.error('Compte non actif. Statut:', user.status);
            throw new Error('Ce compte est désactivé');
          }

          // Retourner les informations de l'utilisateur sans le mot de passe
          const userData = {
            id: user.id,
            email: user.email,
            name: user.name || null,
            role: user.role,
            username: user.username,
            emailVerified: null,
            image: null,
          };
          
          console.log('Authentification réussie pour l\'utilisateur:', { id: user.id, email: user.email, role: user.role });
          return userData;
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error);
          return null;
        }
      },
    }),
    // Désactivation de la connexion Discord pour l'instant
    // Vous pouvez la réactiver plus tard si nécessaire
  ]
};

// Initialiser NextAuth
const auth = NextAuth(authConfig);

// Exporter les gestionnaires pour les routes API
export const { GET, POST } = auth;

// Exporter les fonctions d'authentification
export const { signIn, signOut } = auth;

// Exporter la configuration pour une utilisation ultérieure
export { authConfig };

export default auth;
