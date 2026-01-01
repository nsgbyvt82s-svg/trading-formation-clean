const { PrismaClient } = require('@prisma/client');

async function updateUserToAdmin(username) {
  if (!username) {
    console.error('Veuillez spécifier un nom d\'utilisateur');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  
  try {
    // Vérifier d'abord si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.error(`\nERREUR: Aucun utilisateur trouvé avec le nom d'utilisateur "${username}"`);
      return;
    }

    // Mise à jour directe avec une requête brute
    await prisma.$executeRaw`UPDATE User SET role = 'ADMIN', emailVerified = 1 WHERE username = ${username}`;
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await prisma.user.findUnique({
      where: { username }
    });

    console.log('\n=== UTILISATEUR MIS À JOUR AVEC SUCCÈS ===');
    console.log(`Nom d'utilisateur: ${updatedUser.username}`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Rôle: ${updatedUser.role}`);
    console.log(`Email vérifié: ${updatedUser.emailVerified ? 'Oui' : 'Non'}`);
    console.log('=== FIN ===\n');
    
  } catch (error) {
    console.error('\nERREUR lors de la mise à jour de l\'utilisateur :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer le nom d'utilisateur depuis les arguments de ligne de commande
const username = process.argv[2];
if (!username) {
  console.error('Veuillez spécifier un nom d\'utilisateur');
  console.log('Utilisation: node update-to-admin.js <nom_utilisateur>');
  process.exit(1);
}

updateUserToAdmin(username);
