const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier users.json
const usersPath = path.join(__dirname, '../data/users.json');

// Lire le fichier ligne par ligne pour éviter les problèmes de formatage
let fileContent = fs.readFileSync(usersPath, 'utf8');

// Extraire la partie JSON (enlever les lignes vides et les espaces en début de ligne)
const jsonStart = fileContent.indexOf('{');
const jsonContent = fileContent.substring(jsonStart);

// Parser le JSON
const usersData = JSON.parse(jsonContent);

// Trouver l'utilisateur vexx_owner
const userIndex = usersData.users.findIndex(u => u.username === 'vexx_owner');

if (userIndex !== -1) {
    // Générer un nouveau mot de passe sécurisé
    const newPassword = 'VexxSecure123!';
    
    // Générer un sel et hacher le mot de passe
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    
    // Mettre à jour le mot de passe et la date de mise à jour
    usersData.users[userIndex].password = hashedPassword;
    usersData.users[userIndex].updatedAt = new Date().toISOString();
    
    // Reconstruire le contenu du fichier avec la même mise en forme
    const updatedContent = '{\n    "sessions": [' + fileContent.match(/"sessions":\s*\[(\s*\])/s)[1] + '\n    "users": ' + 
        JSON.stringify(usersData.users, null, 4).replace(/^/gm, '    ').trim() + '\n}';
    
    // Sauvegarder les modifications
    fs.writeFileSync(usersPath, updatedContent);
    
    console.log('Compte vexx_owner mis à jour avec succès !');
    console.log('Nouveau mot de passe : VexxSecure123!');
} else {
    console.error('Utilisateur vexx_owner non trouvé');
}
