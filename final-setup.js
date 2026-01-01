const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  console.log('=== CONFIGURATION DE L\'ADMINISTRATEUR ===\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Supprimer tous les utilisateurs existants
    console.log('Nettoyage de la base de données...');
    await prisma.user.deleteMany({});
    
    // 2. Créer un nouvel utilisateur administrateur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Créer l'utilisateur avec les champs de base
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        emailVerified: true
      }
    });
    
    // Mettre à jour le rôle avec une requête brute
    await prisma.$executeRaw`UPDATE User SET role = 'ADMIN' WHERE id = ${adminUser.id}`;
    
    console.log('\n=== ADMINISTRATEUR CRÉÉ AVEC SUCCÈS ===');
    console.log('Nom d\'utilisateur: admin');
    console.log('Mot de passe: admin123');
    console.log('Email: admin@example.com');
    console.log('Rôle: ADMIN');
    console.log('Email vérifié: Oui');
    
    console.log('\n=== INSTRUCTIONS DE CONNEXION ===');
    console.log('1. Allez sur http://localhost:3000/connexion');
    console.log('2. Connectez-vous avec:');
    console.log('   - Nom d\'utilisateur: admin');
    console.log('   - Mot de passe: admin123');
    console.log('\n=== IMPORTANT ===');
    console.log('Changez ce mot de passe après votre première connexion !');
    console.log('=================\n');
    
  } catch (error) {
    console.error('\nERREUR lors de la configuration de l\'administrateur :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
