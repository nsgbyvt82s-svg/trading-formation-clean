const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Chemins des fichiers de données
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialiser le fichier users.json s'il n'existe pas
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
}

// Configuration de l'admin
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';
const ADMIN_USERNAME = 'admin';

// Fonction pour lire les utilisateurs
const readUsers = () => {
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data).users;
};

// Fonction pour écrire les utilisateurs
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

async function fixAdmin() {
  try {
    console.log('🔍 Vérification de la configuration admin...');
    
    // Lire les utilisateurs existants
    const users = readUsers();
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = users.find(user => user.email === ADMIN_EMAIL || user.username === ADMIN_USERNAME);
    
    if (existingAdmin) {
      console.log('✅ Admin existe déjà:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      return;
    }

    // Créer un nouvel admin
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const now = new Date().toISOString();
    
    const newAdmin = {
      id: uuidv4(),
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      username: ADMIN_USERNAME,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: now,
      createdAt: now,
      updatedAt: now
    };
    
    // Ajouter le nouvel admin
    users.push(newAdmin);
    writeUsers(users);
    
    console.log('✅ Admin créé avec succès:', {
      id: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
fixAdmin()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'exécution du script:');
    console.error(error);
    process.exit(1);
  });
