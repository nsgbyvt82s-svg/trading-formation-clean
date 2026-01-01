const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Lire le fichier users.json
const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));

// Trouver l'utilisateur
const user = data.users.find(u => u.email === '1compris@diamondtrade.com');

if (user) {
  // Générer un nouveau hachage pour le mot de passe
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('xP4$N8L!eQ0&', salt);
  
  // Mettre à jour le mot de passe
  user.password = hashedPassword;
  user.updatedAt = new Date().toISOString();
  
  // Sauvegarder les modifications
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  
  console.log('Mot de passe mis à jour avec succès !');
  console.log('Nouveau hachage :', hashedPassword);
} else {
  console.log('Utilisateur non trouvé');
}
