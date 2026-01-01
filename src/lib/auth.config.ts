import NextAuth, { type DefaultSession, type NextAuthOptions, type User as NextAuthUser, type DefaultUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Interface pour l'utilisateur stocké dans la base de données
interface StoredUser {
  id: string;
  name?: string | null;
  email: string;
  password: string;
  image?: string | null;
  emailVerified?: string | null;
  role: string;
  username: string | null;
}

// Interface pour l'utilisateur retourné par NextAuth
interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  role: string;
  username: string | null;
}

// Extension des types de session
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: User;
  }
}

// Chemin vers le fichier des utilisateurs
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Fonction pour lire les utilisateurs depuis le fichier
const readUsers = (): StoredUser[] => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data).users || [];
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier users.json:', error);
    return [];
  }
};

// Options de configuration NextAuth
const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const users = readUsers();
        const user = users.find((u) => u.email === credentials.email);

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          return null;
        }

        // Créer un objet utilisateur conforme à l'interface User
        const userData: User = {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role || 'USER',
          username: user.username || null,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image || null
        };

        return userData;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

export { authOptions };

// Fonction pour obtenir l'utilisateur actuel (à utiliser côté serveur)
export const getCurrentUser = async (): Promise<User | null> => {
  const users = readUsers();
  // Dans une implémentation réelle, utilisez getServerSession avec authOptions
  // Pour l'instant, on retourne le premier utilisateur admin trouvé (pour le développement)
  return users.find(user => user.role === 'ADMIN') || users[0] || null;
};
