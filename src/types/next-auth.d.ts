import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string | null;
    email: string;
    name?: string | null;
    role: 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
    discordId?: string | null;
    emailVerified: string | null;
    status?: string;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      username: string | null;
      email: string;
      name?: string | null;
      role: 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
      discordId?: string | null;
      emailVerified: string | null;
      image?: string | null;
    } | null | undefined;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string | null;
    email: string;
    name?: string | null;
    role: 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
    discordId?: string | null;
    image?: string | null;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      DISCORD_GUILD_ID?: string;
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET: string;
    }
  }
}
