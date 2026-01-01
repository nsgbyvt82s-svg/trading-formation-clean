// scripts/add-admin.js
const { db } = require('../lib/db');
const { hash } = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const adminEmail = 'admin@example.com';
    const adminUsername = 'admin';
    
    const adminByEmail = await db.users.findByEmail(adminEmail);
    const adminByUsername = await db.users.findByUsername(adminUsername);
    
    if (adminByEmail || adminByUsername) {
      console.log('❌ Un administrateur existe déjà avec cet email ou ce nom d\'utilisateur');
      return;
    }

    // Créer l'administrateur
    const admin = await db.users.create({
      email: adminEmail,
      password: 'Admin@123', // Le mot de passe sera hashé dans la méthode create
      name: 'Administrateur',
      username: adminUsername,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date().toISOString()
    });

    console.log('✅ Compte administrateur créé avec succès');
    console.log('Email: admin@example.com');
    console.log('Mot de passe: Admin@123');
    console.log('⚠️ Changez ce mot de passe après la première connexion !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  }
}

createAdmin();
