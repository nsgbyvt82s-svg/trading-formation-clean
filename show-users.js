const { PrismaClient } = require('@prisma/client');

async function showUsers() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    console.log('=== UTILISATEURS ===');
    users.forEach(user => {
      console.log('\n---');
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role || 'Non défini'}`);
      console.log(`Email vérifié: ${user.emailVerified ? 'Oui' : 'Non'}`);
      console.log(`Dernière connexion: ${user.lastLogin || 'Jamais'}`);
    });
    console.log('\n===================');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showUsers();
