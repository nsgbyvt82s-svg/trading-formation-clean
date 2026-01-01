import NextAuth, { NextAuthOptions, User, Profile, Account } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import { logAuthEvent } from '@/lib/authLogger';

// Types personnalisés
type DiscordProfile = Profile & {
  id: string;
  username: string;
  email: string;
  image_url?: string;
};

type AuthUser = User & {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
  username: string | null;
  emailVerified: string | null;
  discordId?: string | null;
};

// Initialiser la base de données
db.initAdminUser().catch(console.error);

// Fonction utilitaire pour valider les identifiants
const validateCredentials = async (email: string, password: string) => {
  try {
    console.log('Tentative de connexion avec email:', email);
    const user = await db.users.findByEmail(email);
    console.log('Utilisateur trouvé dans la base de données:', user ? 'Oui' : 'Non');
    
    if (!user) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return null;
    }

    console.log('Vérification du mot de passe...');
    const isPasswordValid = await compare(password, user.password);
    console.log('Mot de passe valide:', isPasswordValid);
    
    return isPasswordValid ? user : null;
  } catch (error) {
    console.error('Erreur lors de la validation des identifiants:', error);
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'identify email',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<'email' | 'password', string> | undefined): Promise<AuthUser | null> {
    if (!credentials?.email || !credentials?.password) {
      console.error('Identifiants manquants');
      return null;
    }
        if (!credentials?.email || !credentials?.password) {
          console.error('Identifiants manquants');
          return null;
        }

        try {
          const user = await validateCredentials(credentials.email, credentials.password);
          
          if (!user) {
            console.error('Identifiants invalides pour:', credentials.email);
            return null;
          }

          if (user.status !== 'ACTIVE') {
            console.error('Compte non actif:', user.email);
            return null;
          }

          console.log('Utilisateur authentifié avec succès:', user.email);
          
          // Créer un objet utilisateur conforme au type attendu
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: (user.role as 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER') || 'USER',
            username: user.username || null,
            emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
            discordId: (user as any).discordId || null
          };
          
          return authUser;
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, profile }) {
      // Gérer les événements de connexion
      if (trigger === 'signIn' && user) {
        const request = (token as any).request;
        await logAuthEvent({
          type: 'LOGIN',
          userId: user.id,
          email: user.email || '',
          provider: account?.provider || 'credentials',
          ip: request?.ip || request?.connection?.remoteAddress,
          userAgent: request?.headers?.['user-agent'],
        });
      }
      // Log pour le débogage
      console.log('JWT Callback - Token:', { 
        tokenId: token.sub || token.id, // Utiliser sub comme identifiant principal
        tokenRole: token.role,
        user: user ? { id: user.id, role: (user as any).role } : 'No user',
        accountProvider: account?.provider
      });

      // Initial sync from user object (first sign in)
      if (user) {
        // S'assurer que l'ID de l'utilisateur est défini comme sub (subject)
        token.sub = user.id;
        token.id = user.id;
        token.role = (user as any).role || 'USER';
        token.username = (user as any).username || null;
        token.discordId = (user as any).discordId || null;
      }
      
      // Handle OAuth sign in
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as DiscordProfile;
        
        if (!discordProfile.email) {
          console.error('Email manquant pour la connexion Discord');
          throw new Error('Email requis pour la connexion avec Discord');
        }

        try {
          // Vérifier si l'utilisateur existe déjà par son email
          const existingUser = await db.users.findByEmail(discordProfile.email);
          
          if (existingUser) {
            console.log('Utilisateur existant trouvé:', { id: existingUser.id, role: existingUser.role });
            
            // Mettre à jour l'utilisateur existant avec l'ID Discord si nécessaire
            if (!existingUser.discordId) {
              console.log('Mise à jour de l\'ID Discord pour l\'utilisateur existant');
              await db.users.update(existingUser.id, {
                discordId: discordProfile.id
              } as any);
            }
            
            token.id = existingUser.id;
            token.role = existingUser.role || 'USER';
            token.username = existingUser.username || discordProfile.username;
            token.discordId = discordProfile.id;
          } else {
            console.log('Création d\'un nouvel utilisateur Discord');
            
            // Liste des emails Discord qui doivent avoir le rôle ADMIN
            const adminEmails = [
              'votre.email@exemple.com', // Remplacez par votre email Discord
              'admin@votresite.com'     // Ajoutez d'autres emails admin si nécessaire
            ];
            
            // Vérifier si l'email est dans la liste des administrateurs
            const isAdmin = adminEmails.includes(discordProfile.email.toLowerCase());
            
            // Créer un nouvel utilisateur avec Discord
            const newUser = await db.users.create({
              email: discordProfile.email,
              name: discordProfile.username || discordProfile.name || discordProfile.email.split('@')[0],
              discordId: discordProfile.id,
              role: isAdmin ? 'ADMIN' : 'USER',
              status: 'ACTIVE',
              emailVerified: new Date().toISOString(),
              username: discordProfile.username || null,
              password: '', // Mot de passe vide pour les utilisateurs OAuth
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as any);
            
            console.log('Nouvel utilisateur créé:', { id: newUser.id, role: newUser.role });
            
            token.id = newUser.id;
            token.role = newUser.role || 'USER';
            token.username = discordProfile.username || discordProfile.name || discordProfile.email.split('@')[0];
            token.discordId = discordProfile.id;
          }
        } catch (error) {
          console.error('Erreur lors de la connexion avec Discord:', error);
          throw new Error('Échec de la connexion avec Discord');
        }
      }
      
      console.log('JWT Callback - Token final:', { 
        id: token.id,
        role: token.role,
        username: token.username
      });
      
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Token:', { 
        tokenId: token.sub, // Utiliser token.sub pour l'ID de l'utilisateur
        tokenRole: token.role,
        tokenUsername: token.username
      });
      
      // Créer un nouvel objet utilisateur avec toutes les propriétés nécessaires
      const user = {
        ...session.user,
        id: token.sub || token.id, // Utiliser token.sub comme ID principal
        role: (token.role || 'USER') as 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER',
        username: token.username as string | null,
        discordId: token.discordId as string | null | undefined
      };
      
      console.log('Session Callback - User mis à jour:', { 
        id: user.id,
        role: user.role,
        email: user.email
      });
      
      // Retourner une nouvelle session avec l'utilisateur mis à jour
      return {
        ...session,
        user,
        expires: session.expires
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: true, // Activer le mode debug pour plus d'informations
  events: {
    async signIn(message) {
      if (message.isNewUser) {
        await logAuthEvent({
          type: 'SIGNUP',
          userId: message.user.id,
          email: message.user.email || '',
          provider: message.account?.provider || 'credentials',
          // On ne peut pas accéder à request ici, on utilisera l'IP du token dans le callback JWT
        });
      }
    },
    async signOut({ token }) {
      if (token.sub) {
        await logAuthEvent({
          type: 'LOGOUT',
          userId: token.sub,
          email: token.email || '',
        });
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};
