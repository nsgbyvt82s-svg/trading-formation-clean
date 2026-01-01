import NextAuth, { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import fileAuth from '@/lib/file-auth';

// Configuration de base de NextAuth
const authOptions: any = {
  // Pages personnalisées
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Stratégie de session
  session: {
    strategy: 'jwt' as const,
  },
  // Callbacks
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name;
        session.user.role = token.role as string;
        session.user.username = token.username as string | null;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'USER';
        token.username = user.username || null;
      }
      return token;
    },
  },
  // Fournisseurs d'authentification
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await fileAuth.validateUser(
            credentials.email as string,
            credentials.password as string
          );

          if (!user) {
            return null;
          }

          // Mettre à jour la dernière connexion
          await fileAuth.updateUser(user.id, {
            lastLogin: new Date().toISOString(),
            lastIp: '127.0.0.1' // À remplacer par l'IP réelle en production
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: user.role,
            emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
            username: user.username || user.email.split('@')[0],
            image: user.image || null,
          };
        } catch (error) {
          console.error('Erreur d\'authentification:', error);
          return null;
        }
      },
    }),
  ],
};

// Création et exportation des gestionnaires
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authOptions,
  // Désactiver le Edge Runtime pour éviter les problèmes avec les modules Node.js
  experimental: {
    enableWebAuthn: false,
  },
  // Désactiver les pages personnalisées si elles ne sont pas utilisées
  pages: {},
  // Désactiver les callbacks non nécessaires
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'USER';
      }
      return token;
    },
  },
});

export { auth as default };
