const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function checkAndFixDatabase() {
  console.log('=== VÉRIFICATION ET RÉPARATION DE LA BASE DE DONNÉES ===\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Vérifier si la colonne 'role' existe
    console.log('Vérification de la colonne "role"...');
    const tableInfo = await prisma.$queryRaw`
      SELECT name FROM pragma_table_info('User') 
      WHERE name = 'role'
    `;
    
    if (tableInfo.length === 0) {
      console.log('La colonne "role" n\'existe pas, création en cours...');
      await prisma.$executeRaw`ALTER TABLE User ADD COLUMN role TEXT DEFAULT 'USER'`;
      console.log('Colonne "role" créée avec succès.');
    } else {
      console.log('La colonne "role" existe déjà.');
    }
    
    // 2. Mettre à jour les rôles des utilisateurs
    console.log('\nMise à jour des rôles des utilisateurs...');
    
    const users = await prisma.user.findMany();
    const updates = users.map(user => {
      let role = 'USER';
      
      if (user.username === 'owner') role = 'OWNER';
      else if (user.username === 'admin') role = 'ADMIN';
      else if (user.username === 'moderator') role = 'MODERATOR';
      
      return prisma.$executeRaw`
        UPDATE User 
        SET role = ${role}, 
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `;
    });
    
    await Promise.all(updates);
    console.log('Rôles mis à jour avec succès !');
    
    // 3. Afficher les utilisateurs mis à jour
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
    
    // 4. Forcer la régénération du client Prisma
    console.log('\nRégénération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Client Prisma régénéré avec succès !');
    
  } catch (error) {
    console.error('\nERREUR lors de la vérification/réparation :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixDatabase();
