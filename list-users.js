const { PrismaClient } = require('@prisma/client');

async function listUsers() {
  const prisma = new PrismaClient();
  try {
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany();
    
    console.log('\n=== UTILISATEURS DANS LA BASE DE DONNÉES ===');
    users.forEach(user => {
      console.log('\n---');
      console.log(`ID: ${user.id}`);
      console.log(`Nom d'utilisateur: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rôle: ${user.role || 'Non défini'}`);
      console.log(`Email vérifié: ${user.emailVerified ? 'Oui' : 'Non'}`);
      console.log(`Dernière connexion: ${user.lastLogin || 'Jamais'}`);
      console.log(`Créé le: ${user.createdAt}`);
    });
    console.log('\n=== FIN DE LA LISTE ===\n');
    
  } catch (error) {
    console.error('\nERREUR lors de la récupération des utilisateurs :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
