const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

async function updatePasswords() {
  try {
    // Lire le fichier users.json
    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    
    // Mettre à jour le mot de passe pour owner_1
    const fondateur = data.users.find(u => u.id === 'owner_1');
    if (fondateur) {
      console.log('Mise à jour du mot de passe pour FONDATEUR DIAMOND...');
      fondateur.password = await bcrypt.hash('xP4$N8L!eQ0&', 10);
      fondateur.updatedAt = new Date().toISOString();
    }
    
    // Mettre à jour le mot de passe pour owner_2
    const projet2k26 = data.users.find(u => u.id === 'owner_2');
    if (projet2k26) {
      console.log('Mise à jour du mot de passe pour PROJET 2K26...');
      projet2k26.password = await bcrypt.hash('A9!qR7m@ZK2#', 10);
      projet2k26.updatedAt = new Date().toISOString();
    }
    
    // Sauvegarder les modifications
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    console.log('Mots de passe mis à jour avec succès !');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des mots de passe:', error);
  }
}

updatePasswords();
