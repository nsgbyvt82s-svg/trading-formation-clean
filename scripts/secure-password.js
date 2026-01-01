const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Fonction pour générer un mot de passe sécurisé
function generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
    let password = '';
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
        password += charset[values[i] % charset.length];
    }
    return password;
}

async function updateUserPassword(username, newPassword) {
    const usersPath = path.join(__dirname, '../data/users.json');
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    const user = usersData.users.find(u => u.username === username);
    if (!user) {
        console.error(`Utilisateur ${username} non trouvé`);
        return null;
    }
    
    // Générer un sel et hacher le mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    user.updatedAt = new Date().toISOString();
    
    // Sauvegarder les modifications
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    
    return newPassword;
}

// Exemple d'utilisation
const username = 'admin'; // ou 'vexx_owner' pour l'autre compte
const newPassword = generateSecurePassword();

updateUserPassword(username, newPassword)
    .then(password => {
        console.log(`Mot de passe mis à jour pour ${username}`);
        console.log(`Nouveau mot de passe : ${password}`);
        console.log('IMPORTANT : Notez ce mot de passe dans un endroit sûr !');
    })
    .catch(err => {
        console.error('Erreur lors de la mise à jour du mot de passe :', err);
    });
