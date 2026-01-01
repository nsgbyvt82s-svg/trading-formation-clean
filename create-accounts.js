const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAccounts() {
  console.log('=== CRÉATION DES COMPTES ADMIN, MODÉRATEUR ET OWNER ===\n');
  
  const prisma = new PrismaClient();
  
  // Définir les comptes à créer
  const accounts = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN',
      description: 'Compte administrateur avec accès complet au panneau d\'administration.'
    },
    {
      username: 'moderator',
      email: 'moderator@example.com',
      password: 'moderator123',
      role: 'MODERATOR',
      description: 'Compte modérateur avec des droits limités.'
    },
    {
      username: 'owner',
      email: 'owner@example.com',
      password: 'owner123',
      role: 'OWNER',
      description: 'Compte propriétaire avec tous les droits.'
    }
  ];

  try {
    // Supprimer les comptes existants s'ils existent
    console.log('Nettoyage des comptes existants...');
    for (const account of accounts) {
      await prisma.user.deleteMany({ where: { username: account.username } });
    }
    
    // Créer les nouveaux comptes
    console.log('\nCréation des nouveaux comptes...');
    for (const account of accounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      // Créer l'utilisateur avec les champs de base
      const user = await prisma.user.create({
        data: {
          username: account.username,
          email: account.email,
          password: hashedPassword,
          emailVerified: true
        }
      });
      
      // Mettre à jour le rôle avec une requête brute
      await prisma.$executeRaw`UPDATE User SET role = ${account.role} WHERE id = ${user.id}`;
      
      console.log(`\n=== ${account.role} CRÉÉ AVEC SUCCÈS ===`);
      console.log(`Nom d'utilisateur: ${account.username}`);
      console.log(`Mot de passe: ${account.password}`);
      console.log(`Email: ${account.email}`);
      console.log(`Rôle: ${account.role}`);
      console.log(`Description: ${account.description}`);
    }
    
    console.log('\n=== INSTRUCTIONS DE CONNEXION ===');
    console.log('1. Allez sur http://localhost:3000/connexion');
    console.log('2. Connectez-vous avec l\'un des comptes ci-dessus');
    console.log('\n=== IMPORTANT ===');
    console.log('Changez les mots de passe après votre première connexion !');
    console.log('========================================');
    
  } catch (error) {
    console.error('\nERREUR lors de la création des comptes :');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccounts();
