const { PrismaClient } = require('@prisma/client');

async function updateUserRoles() {
  console.log('=== MISE À JOUR DES RÔLES DES UTILISATEURS ===\n');
  
  const prisma = new PrismaClient();
  
  // Définir les utilisateurs et leurs rôles
  const usersToUpdate = [
    { username: 'owner', role: 'OWNER' },
    { username: 'admin', role: 'ADMIN' },
    { username: 'moderator', role: 'MODERATOR' }
  ];

  try {
    for (const { username, role } of usersToUpdate) {
      // Mettre à jour le rôle avec une requête brute
      const result = await prisma.$executeRaw`
        UPDATE User 
        SET role = ${role}, updatedAt = CURRENT_TIMESTAMP
        WHERE username = ${username}
      `;
      
      if (result > 0) {
        console.log(`✅ Rôle ${role} mis à jour pour l'utilisateur ${username}`);
      } else {
        console.log(`⚠️ Utilisateur non trouvé: ${username}`);
      }
    }
    
    // Afficher les utilisateurs mis à jour
    console.log('\n=== UTILISATEURS MIS À JOUR ===');
    const updatedUsers = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        role: true,
        emailVerified: true
      }
    });
    console.table(updatedUsers);
    
  } catch (error) {
    console.error('\nERREUR lors de la mise à jour des rôles :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRoles();
