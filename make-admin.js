const { PrismaClient } = require('@prisma/client');

async function makeAdmin(username) {
  if (!username) {
    console.error('Veuillez spécifier un nom d\'utilisateur');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  
  try {
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        role: 'ADMIN',
        emailVerified: true
      }
    });

    console.log('\n=== UTILISATEUR MIS À JOUR ===');
    console.log(`Nom d'utilisateur: ${updatedUser.username}`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Nouveau rôle: ${updatedUser.role}`);
    console.log('=== FIN ===\n');
    
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`\nERREUR: Aucun utilisateur trouvé avec le nom d'utilisateur "${username}"`);
    } else {
      console.error('\nERREUR lors de la mise à jour de l\'utilisateur :');
      console.error(error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer le nom d'utilisateur depuis les arguments de ligne de commande
const username = process.argv[2];
makeAdmin(username);
