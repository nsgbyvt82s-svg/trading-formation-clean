const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Lire le fichier users.json
const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

// Mettre à jour les rôles des propriétaires
let updated = false;

const ownerEmails = ['1compris@diamondtrade.com', 'vexx@diamondtrade.com'];

data.users = data.users.map(user => {
  if (ownerEmails.includes(user.email) && user.role !== 'OWNER') {
    console.log(`Mise à jour du rôle pour ${user.email} en OWNER`);
    updated = true;
    return { ...user, role: 'OWNER', updatedAt: new Date().toISOString() };
  }
  return user;
});

if (updated) {
  // Sauvegarder les modifications
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  console.log('Mise à jour des propriétaires terminée');
} else {
  console.log('Aucune mise à jour nécessaire');
}
