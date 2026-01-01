const { PrismaClient } = require('@prisma/client');

async function checkTableStructure() {
  const prisma = new PrismaClient();
  try {
    // Afficher la structure de la table User
    const tableInfo = await prisma.$queryRaw`PRAGMA table_info(User)`;
    console.log('Structure de la table User :');
    console.table(tableInfo);
    
    // Afficher les valeurs uniques de la colonne role si elle existe
    try {
      const roles = await prisma.$queryRaw`SELECT DISTINCT role FROM User`;
      console.log('\nValeurs uniques de la colonne role :');
      console.table(roles);
    } catch (e) {
      console.log('\nLa colonne role n\'existe pas ou n\'est pas accessible');
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la structure de la table :', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableStructure();
