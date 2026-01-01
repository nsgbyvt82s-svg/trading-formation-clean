const { hash } = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

async function addTestUser() {
  try {
    // Lire le fichier users.json
    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = data.users.some(user => user.email === 't.monseur@hotmail.com');
    
    if (userExists) {
      console.log('Un utilisateur avec cet email existe déjà');
      return;
    }

    // Hacher le mot de passe
    const hashedPassword = await hash('votre_mot_de_passe', 10);
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: `user_${Date.now()}`,
      email: 't.monseur@hotmail.com',
      password: hashedPassword,
      name: 'Test User',
      username: 'testuser',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Ajouter le nouvel utilisateur
    data.users.push(newUser);
    
    // Écrire dans le fichier
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    
    console.log('Utilisateur créé avec succès !');
    console.log('Email: t.monseur@hotmail.com');
    console.log('Mot de passe: votre_mot_de_passe');
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
  }
}

addTestUser();
