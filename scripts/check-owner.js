const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Liste des emails des propriétaires
const OWNER_EMAILS = [
  '1compris@diamondtrade.com',
  'vexx@diamondtrade.com'
];

// Vérifier si un utilisateur est propriétaire
function isOwner(email) {
  return OWNER_EMAILS.includes(email);
}

// Lire le fichier users.json
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture users.json:', error);
    return { users: [] };
  }
}

// Mettre à jour le rôle d'un utilisateur
function updateUserRole(email, role) {
  const data = readUsers();
  const user = data.users.find(u => u.email === email);
  
  if (user) {
    user.role = role;
    user.updatedAt = new Date().toISOString();
    
    // Sauvegarder les modifications
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    console.log(`Rôle mis à jour pour ${email} : ${role}`);
    return true;
  }
  
  return false;
}

// Vérifier et mettre à jour les propriétaires
function checkAndUpdateOwners() {
  const data = readUsers();
  let updated = false;
  
  data.users.forEach(user => {
    if (isOwner(user.email) && user.role !== 'OWNER') {
      updateUserRole(user.email, 'OWNER');
      updated = true;
    }
  });
  
  if (!updated) {
    console.log('Aucune mise à jour nécessaire');
  }
}

// Exécuter la vérification
checkAndUpdateOwners();
