const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Lire le fichier users.json
const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

// Trouver l'utilisateur owner_1
const owner = data.users.find(user => user.id === 'owner_1');

if (owner) {
  // Mettre à jour le mot de passe avec un nouveau hachage
  const newPassword = 'xP4$N8L!eQ0&';
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);
  
  // Mettre à jour le mot de passe et la date de mise à jour
  owner.password = hashedPassword;
  owner.updatedAt = new Date().toISOString();
  
  // Sauvegarder les modifications
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  
  console.log('Mot de passe mis à jour avec succès pour owner_1');
  console.log('Nouveau hachage:', hashedPassword);
} else {
  console.error('Utilisateur owner_1 non trouvé');
}
