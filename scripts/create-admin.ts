import fileAuth from '../src/lib/file-auth';
import { hash } from 'bcryptjs';

// Définition des comptes administrateurs
const adminAccounts = [
  {
    email: '1compris@diamondtrade.com',
    password: 'xP4$N8L!eQ0&',
    name: 'Administrateur 1',
    username: '1compris'
  },
  {
    email: 'vexx@diamondtrade.com',
    password: 'A9!qR7m@ZK2#',
    name: 'Administrateur Vexx',
    username: 'vexx'
  }
];

async function createAdminUser() {
  
  try {
    for (const account of adminAccounts) {
      // Vérifier si l'admin existe déjà
      const existingUser = await fileAuth.findUserByEmail(account.email);
      
      if (existingUser) {
        console.log(`ℹ️  Un administrateur existe déjà avec l'email : ${account.email}`);
        continue;
      }
      
      // Hasher le mot de passe
      const hashedPassword = await hash(account.password, 10);
      
      // Créer l'utilisateur admin
      // fileAuth.createUser s'attend à un type Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'>
      // donc on ne doit pas inclure ces champs
      await fileAuth.createUser({
        email: account.email,
        password: hashedPassword,
        name: account.name,
        role: 'OWNER',
        username: account.username,
        emailVerified: new Date()
      });
      
      console.log('✅ Compte administrateur créé avec succès !');
      console.log('Email:', account.email);
      console.log('Mot de passe:', account.password);
      console.log('----------------------------------------');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur :', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Exécuter le script
createAdminUser();
