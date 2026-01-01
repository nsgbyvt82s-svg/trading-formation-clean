const { PrismaClient } = require('@prisma/client');

async function addRoleColumn() {
  console.log('=== AJOUT DE LA COLONNE ROLE ===\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Ajouter la colonne role si elle n'existe pas
    console.log('Ajout de la colonne role...');
    await prisma.$executeRaw`ALTER TABLE User ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER'`;
    console.log('Colonne role ajoutée avec succès !');
    
    // Mettre à jour le rôle de l'utilisateur admin
    console.log('\nMise à jour du rôle administrateur...');
    await prisma.$executeRaw`UPDATE User SET role = 'ADMIN' WHERE username = 'admin'`;
    console.log('Rôle administrateur défini avec succès !');
    
    // Afficher les utilisateurs
    const users = await prisma.user.findMany();
    console.log('\n=== LISTE DES UTILISATEURS ===');
    console.table(users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role || 'USER',
      emailVerified: u.emailVerified ? 'Oui' : 'Non'
    })));
    
  } catch (error) {
    console.error('\nERREUR lors de la mise à jour de la base de données :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

addRoleColumn();
