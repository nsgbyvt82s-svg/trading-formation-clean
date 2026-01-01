const fs = require('fs');
const path = require('path');
const { hash } = require('bcryptjs');

const USERS_FILE = path.join(process.cwd(), 'src', 'lib', 'users.json');
const PASSWORD = 'xP4$N8L!eQ0&';

async function updatePassword() {
  try {
    // Lire le fichier users.json
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const usersData = JSON.parse(data);
    
    // Trouver l'utilisateur
    const user = usersData.users.find(u => u.email === '1compris@diamondtrade.com');
    
    if (!user) {
      console.error('Utilisateur non trouvé');
      return;
    }
    
    // Générer un nouveau hachage
    console.log('Ancien hachage:', user.password);
    const hashedPassword = await hash(PASSWORD, 10);
    console.log('Nouveau hachage:', hashedPassword);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    
    // Sauvegarder les modifications
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
    
    console.log('Mot de passe mis à jour avec succès!');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
  }
}

updatePassword();
