const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
  console.log('=== RÉINITIALISATION DE LA BASE DE DONNÉES ===\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Supprimer toutes les données existantes
    console.log('Suppression des données existantes...');
    await prisma.$executeRaw`DELETE FROM User`;
    
    // 2. Créer un nouvel utilisateur administrateur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true
      }
    });

    console.log('\n=== NOUVEL ADMINISTRATEUR CRÉÉ ===');
    console.log('Nom d\'utilisateur: admin');
    console.log('Mot de passe: admin123');
    console.log('Email: admin@example.com');
    console.log('Rôle: ADMIN');
    console.log('Email vérifié: Oui');
    console.log('\n=== CONNEXION ===');
    console.log('1. Allez sur http://localhost:3000/connexion');
    console.log('2. Connectez-vous avec:');
    console.log('   - Nom d\'utilisateur: admin');
    console.log('   - Mot de passe: admin123');
    console.log('\n=== IMPORTANT ===');
    console.log('Changez ce mot de passe après votre première connexion !');
    console.log('=================\n');
    
  } catch (error) {
    console.error('\nERREUR lors de la réinitialisation de la base de données :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
