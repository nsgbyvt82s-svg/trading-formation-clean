const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupAdminUser() {
  console.log('=== CONFIGURATION DE L\'ADMINISTRATEUR ===\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Vérifier si la colonne role existe, sinon l'ajouter
    try {
      await prisma.$executeRaw`ALTER TABLE User ADD COLUMN role TEXT DEFAULT 'USER'`;
      console.log('Colonne "role" ajoutée avec succès.');
    } catch (e) {
      console.log('La colonne "role" existe déjà ou une erreur est survenue :', e.message);
    }
    
    // 2. Créer un utilisateur administrateur
    const hashedPassword = '$2b$10$tZP3T5VnXuNEpztNKwn29eaoX.QPgZGuYOx0AhKygOxOgWfTYgNdm'; // 'admin123'
    
    // Supprimer d'abord l'utilisateur admin s'il existe déjà
    await prisma.user.deleteMany({ where: { username: 'admin' } });
    
    // Créer le nouvel utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true
      }
    });

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

setupAdminUser();
