const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Lire le fichier users.json
const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

// Fonction pour mettre à jour le mot de passe d'un utilisateur
function updateUserPassword(userId, newPassword) {
  const user = data.users.find(u => u.id === userId);
  if (!user) {
    console.error(`Utilisateur ${userId} non trouvé`);
    return false;
  }
  
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);
  
  user.password = hashedPassword;
  user.updatedAt = new Date().toISOString();
  
  console.log(`Mot de passe mis à jour pour ${user.email}`);
  return true;
}

// Mettre à jour les mots de passe
try {
  // Mettre à jour le compte FONDATEUR DIAMOND
  updateUserPassword('owner_1', 'xP4$N8L!eQ0&');
  
  // Mettre à jour le compte PROJET 2K26
  updateUserPassword('owner_2', 'A9!qR7m@ZK2#');
  
  // Sauvegarder les modifications
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  console.log('Mots de passe mis à jour avec succès !');
} catch (error) {
  console.error('Erreur lors de la mise à jour des mots de passe:', error);
  process.exit(1);
}
