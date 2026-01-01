import type { NextAuthOptions, DefaultSession, Profile } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import { compare } from 'bcryptjs';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Types personnalisés pour le profil Discord
interface DiscordGuildMember {
  id: string;
  roles: string[];
  user?: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string | null;
  };
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  permissions_new?: string;
}

interface DiscordGuildMemberResponse {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string | null;
  };
  nick?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
}

interface DiscordProfile extends Profile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  discriminator: string;
  verified: boolean;
  global_name?: string;
  image_url?: string;
  guilds?: DiscordGuild[];
  guild_member?: DiscordGuildMember;
}

// Chemin vers le fichier des utilisateurs
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Interface pour l'utilisateur stocké dans le fichier JSON
interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'OWNER';
  username?: string | null;
  emailVerified: string;
  image?: string;
  discordId?: string;
  status?: string;
}

// Fonction pour vérifier les rôles Discord
async function checkDiscordRoles(discordId: string, accessToken: string): Promise<boolean> {
  const GUILD_ID = '1431260053318406196';
  const OWNER_ROLE_ID = '1443384502490763264';
  
  try {
    // 1. D'abord, vérifions si l'utilisateur est bien sur le serveur
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!guildsResponse.ok) {
      console.error(`Erreur lors de la récupération des serveurs: ${guildsResponse.statusText}`);
      return false;
    }

    const guilds = await guildsResponse.json() as DiscordGuild[];
    const isInGuild = guilds.some(g => g.id === GUILD_ID);
    
    if (!isInGuild) {
      console.log(`[DISCORD] L'utilisateur n'est pas sur le serveur`);
      return false;
    }

    // 2. Récupérer les informations du membre sur le serveur
    const memberResponse = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!memberResponse.ok) {
      console.error(`Erreur API Discord: ${memberResponse.status} ${memberResponse.statusText}`);
      const errorBody = await memberResponse.text();
      console.error('Réponse d\'erreur:', errorBody);
      return false;
    }

    const memberData = await memberResponse.json() as DiscordGuildMemberResponse;
    console.log('[DISCORD] Données du membre:', JSON.stringify(memberData, null, 2));
    
    const hasOwnerRole = memberData.roles?.includes(OWNER_ROLE_ID) || false;
    
    console.log(`[DISCORD] Rôles pour ${discordId}:`, memberData.roles);
    console.log(`[DISCORD] Rôle OWNER (${OWNER_ROLE_ID}) trouvé:`, hasOwnerRole);
    
    return hasOwnerRole;
  } catch (error) {
    console.error('Erreur lors de la vérification des rôles Discord:', error);
    return false;
  }
}

// Fonction pour lire les utilisateurs depuis le fichier
const readUsers = (): StoredUser[] => {
  try {
    const data = readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data).users || [];
  } catch (error) {
    // Si le fichier n'existe pas, le créer avec un tableau vide
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
      return [];
    }
    console.error('Erreur lors de la lecture du fichier users.json:', error);
    return [];
  }
};

// Fonction pour écrire les utilisateurs dans le fichier
const writeUsers = (users: StoredUser[]): void => {
  try {
    writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture du fichier users.json:', error);
    throw error;
  }
};

// Configuration de l'authentification
export const authOptions: NextAuthOptions = {
  // Configuration de la session
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  // Configuration des pages personnalisées
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'votre-secret-tres-securise',
  debug: true,  // Toujours activer le mode debug
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'identify email guilds guilds.members.read',
        },
      },
      profile(profile: DiscordProfile) {
        console.log(`[DEBUG] Profil Discord chargé pour ${profile.id}`);
        
        // Par défaut, l'utilisateur a le rôle USER
        let userRole: 'USER' | 'ADMIN' | 'MODERATOR' | 'OWNER' = 'USER';
        
        // Votre ID Discord aura automatiquement le rôle OWNER
        if (profile.id === '1443384502490763264') {
          userRole = 'OWNER';
          console.log(`[DEBUG] Compte propriétaire détecté`);
        }
        
        return {
          id: profile.id,
          name: profile.username || profile.name || profile.email?.split('@')[0] || 'Utilisateur Discord',
          email: profile.email || `${profile.id}@discord.app`,
          image: profile.image_url || (profile.avatar 
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator) % 5}.png`
          ),
          role: userRole,
          discordId: profile.id,
          emailVerified: new Date().toISOString(),
        };
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        console.log('Tentative de connexion avec email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Email ou mot de passe manquant');
          return null;
        }

        const users = readUsers();
        console.log('Utilisateurs chargés:', users.length);
        
        const user = users.find((u) => u.email === credentials.email);
        console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');

        if (!user) {
          console.log('Aucun utilisateur trouvé avec cet email');
          return null;
        }

        console.log('Comparaison des mots de passe...');
        console.log('Mot de passe fourni:', credentials.password);
        console.log('Hachage stocké:', user.password);
        
        const isPasswordValid = await compare(credentials.password, user.password);
        console.log('Résultat de la comparaison:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log('Mot de passe incorrect');
          return null;
        }
        
        console.log('Authentification réussie pour:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: (user.role as 'USER' | 'ADMIN' | 'MODERATOR' | 'OWNER') || 'USER',
          username: user.username || null,
          emailVerified: user.emailVerified ? user.emailVerified : null,
          image: user.image || null
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Si c'est une connexion avec Discord
      if (account?.provider === 'discord' && profile && account.access_token) {
        const discordProfile = profile as DiscordProfile;
        console.log('[AUTH] Connexion avec Discord ID:', discordProfile.id);
        
        // Par défaut, on met USER
        user.role = 'USER';
        
        // Vérifier les rôles Discord
        console.log('[AUTH] Vérification des rôles Discord...');
        console.log('[AUTH] Token d\'accès:', account.access_token.substring(0, 10) + '...');
        
        try {
          const isOwner = await checkDiscordRoles(discordProfile.id, account.access_token);
          
          if (isOwner) {
            console.log('[AUTH] ✅ Rôle OWNER confirmé via Discord');
            user.role = 'OWNER';
          } else {
            console.log('[AUTH] ❌ Aucun rôle OWNER détecté sur Discord');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la vérification des rôles Discord:', error);
          // En cas d'erreur, on laisse le rôle USER par défaut
        }
        
        // Vérifier si l'utilisateur a un email (obligatoire)
        if (!discordProfile.email) {
          console.error('Aucun email associé au compte Discord');
          return false;
        }

        try {
          const users = readUsers();
          const existingUser = users.find(u => u.id === discordProfile.id);
          
          // Vérifier si c'est un administrateur
          const isAdmin = discordProfile.id === '1443384502490763264';
          const userRole = isAdmin ? 'OWNER' : 'USER';

          if (existingUser) {
            // Mettre à jour les informations existantes
            existingUser.name = discordProfile.username || existingUser.name;
            existingUser.email = discordProfile.email;
            existingUser.role = isAdmin ? 'ADMIN' : existingUser.role;
            existingUser.image = discordProfile.image_url || existingUser.image;
            existingUser.discordId = discordProfile.id;
          } else {
            // Créer un nouvel utilisateur
            const newUser: StoredUser = {
              id: discordProfile.id,
              email: discordProfile.email,
              name: discordProfile.username || discordProfile.name || 'Utilisateur Discord',
              password: '',
              role: userRole,
              username: discordProfile.username || null,
              emailVerified: new Date().toISOString(),
              discordId: discordProfile.id,
              image: discordProfile.image_url || (discordProfile.avatar 
                ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                : undefined)
            };
            users.push(newUser);
          }
          
          writeUsers(users);
          return true;
          
        } catch (error) {
          console.error('Erreur lors de la connexion Discord:', error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        // Forcer le rôle admin pour votre compte
        if (user.id === '1443384502490763264') {
          token.role = 'OWNER';
          console.log('[JWT] Définition du rôle OWNER pour', user.id);
        } else {
          token.role = (user as any).role || 'USER';
        }
        
        token.username = user.username || null;
        token.email = user.email || '';
        token.discordId = (user as any).discordId || null;
      }
      
      // S'assurer que le rôle est toujours défini
      if (!token.role) {
        token.role = 'USER';
      }
      
      // Vérification finale du rôle (pas de vérification Discord ici car on a besoin du token d'accès)
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Ne plus forcer le rôle OWNER, il est déjà défini lors de la connexion
        
        session.user.role = token.role as 'USER' | 'ADMIN' | 'MODERATOR' | 'OWNER';
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        
        // Ajouter l'ID Discord à la session si disponible
        if (token.discordId) {
          (session.user as any).discordId = token.discordId;
        }
        
        // Définir isAdmin à true pour OWNERS et ADMIN
        (session.user as any).isAdmin = token.role === 'ADMIN' || token.role === 'OWNER';
        (session.user as any).isOwner = token.role === 'OWNER';
                                      
        console.log('[SESSION] Utilisateur connecté:', {
          id: token.discordId,
          role: session.user.role,
          isAdmin: (session.user as any).isAdmin
        });
      }
      return session;
    },
  },
  events: {
    async signIn(message) {
      console.log('Sign in:', message);
    },
    async signOut() {
      console.log('User signed out');
    },
  },
  logger: {
    error(code, metadata) {
      console.error('🔴 ERREUR AUTH:', code, metadata);
    },
    warn(code) {
      console.warn('⚠️ AVERTISSEMENT AUTH:', code);
    },
    debug(code, metadata) {
      console.log('🐛 DEBUG AUTH:', code, metadata);
    },
  },
};

// Les types sont maintenant définis dans src/types/next-auth.d.ts
