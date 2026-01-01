import { PrismaClient } from '@prisma/client';

// Vérification si on est côté serveur (Node.js)
const isServer = typeof window === 'undefined';

// Création d'un type pour l'objet global avec Prisma
type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

// Initialisation du client Prisma uniquement côté serveur
let prisma: PrismaClient;

if (!isServer) {
  // Côté navigateur, on ne fait rien
  prisma = {} as PrismaClient;
} else {
  // Côté serveur, on initialise Prisma normalement
  const globalForPrisma = globalThis as GlobalWithPrisma;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });
    
    // Gestion propre de la fermeture de l'application
    const gracefulShutdown = async () => {
      try {
        await globalForPrisma.prisma?.$disconnect();
        console.log('Prisma Client has been gracefully disconnected');
      } catch (error) {
        console.error('Error during Prisma Client disconnection:', error);
        process.exit(1);
      }
    };

    // Gestion des signaux de fermeture
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    process.on('beforeExit', gracefulShutdown);
  }
  
  prisma = globalForPrisma.prisma;
}

// Exportation du client Prisma
export { prisma };
export default prisma;
