const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function resetAndSetup() {
  console.log('=== RÉINITIALISATION ET CONFIGURATION DE LA BASE DE DONNÉES ===\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Supprimer tous les utilisateurs existants
    console.log('Suppression des utilisateurs existants...');
    await prisma.user.deleteMany({});
    
    // 2. Créer les utilisateurs avec les rôles appropriés
    const users = [
      {
        username: 'owner',
        email: 'owner@example.com',
        password: await bcrypt.hash('owner123', 10),
        role: 'OWNER',
        emailVerified: true
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        emailVerified: true
      },
      {
        username: 'moderator',
        email: 'moderator@example.com',
        password: await bcrypt.hash('moderator123', 10),
        role: 'MODERATOR',
        emailVerified: true
      }
    ];
    
    console.log('Création des nouveaux utilisateurs...');
    for (const user of users) {
      // Créer l'utilisateur avec une requête brute pour s'assurer que le rôle est défini
      await prisma.$executeRaw`
        INSERT INTO User (id, username, email, password, role, emailVerified, createdAt, updatedAt)
        VALUES (
          ${crypto.randomUUID()},
          ${user.username},
          ${user.email},
          ${user.password},
          ${user.role},
          ${user.emailVerified ? 1 : 0},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `;
      console.log(`✅ ${user.role} créé : ${user.username}`);
    }
    
    // 3. Afficher les utilisateurs créés
    console.log('\n=== UTILISATEURS CRÉÉS ===');
    const createdUsers = await prisma.$queryRaw`
      SELECT username, email, role, emailVerified 
      FROM User
    `;
    console.table(createdUsers);
    
    console.log('\n=== INSTRUCTIONS DE CONNEXION ===');
    console.log('1. Arrêtez le serveur avec Ctrl+C');
    console.log('2. Redémarrez le serveur avec: npm run dev');
    console.log('3. Connectez-vous avec l\'un des comptes suivants:');
    console.log('\n   OWNER:');
    console.log('   - URL: http://localhost:3000/connexion');
    console.log('   - Nom d\'utilisateur: owner');
    console.log('   - Mot de passe: owner123');
    console.log('\n   ADMIN:');
    console.log('   - URL: http://localhost:3000/connexion');
    console.log('   - Nom d\'utilisateur: admin');
    console.log('   - Mot de passe: admin123');
    console.log('\n   MODERATOR:');
    console.log('   - URL: http://localhost:3000/connexion');
    console.log('   - Nom d\'utilisateur: moderator');
    console.log('   - Mot de passe: moderator123');
    console.log('\n=== IMPORTANT ===');
    console.log('Changez ces mots de passe après votre première connexion !');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\nERREUR lors de la réinitialisation :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSetup();
