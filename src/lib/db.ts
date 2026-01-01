import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { compare, hash } from 'bcryptjs';

// Chemins des fichiers de données
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialiser les fichiers de données s'ils n'existent pas
const initFile = (filePath: string, defaultContent: any) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
  }
};

initFile(USERS_FILE, { users: [] });
initFile(SESSIONS_FILE, { sessions: [] });

// Types
type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'MODERATOR' | 'OWNER';
  username: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  emailVerified?: string | null;
  discordId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Session = {
  id: string;
  userId: string;
  expires: string;
  sessionToken: string;
  accessToken?: string;
  createdAt: string;
  updatedAt: string;
};

// Fonctions utilitaires
const readData = <T>(filePath: string): T => {
  try {
    console.log(`Lecture du fichier: ${filePath}`);
    let data = fs.readFileSync(filePath, 'utf-8');
    console.log('Contenu brut du fichier:', data);
    
    // Supprimer le BOM s'il existe
    if (data.charCodeAt(0) === 0xFEFF) {
      console.log('Suppression du BOM du fichier');
      data = data.slice(1);
    }
    
    const parsedData = JSON.parse(data);
    console.log('Données parsées:', JSON.stringify(parsedData, null, 2));
    return parsedData;
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    // Retourner un objet vide avec la structure attendue
    console.log('Retour d\'un objet vide en raison d\'une erreur');
    return { users: [] } as unknown as T;
  }
};

const writeData = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const db = {
  // Gestion des utilisateurs
  users: {
    async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
      const data = readData<{ users: User[] }>(USERS_FILE);
      const hashedPassword = userData.password ? await hash(userData.password, 10) : '';
      const now = new Date().toISOString();
      
      const user: User = {
        ...userData,
        id: `user_${uuidv4()}`,
        password: hashedPassword,
        status: userData.status || 'ACTIVE',
        emailVerified: userData.emailVerified || null,
        discordId: userData.discordId || null,
        createdAt: now,
        updatedAt: now,
      };
      
      data.users.push(user);
      writeData(USERS_FILE, data);
      console.log(`✅ Utilisateur créé: ${user.email} (${user.role})`);
      return user;
    },

    async findByEmail(email: string): Promise<User | null> {
      console.log('Recherche de l\'utilisateur avec l\'email:', email);
      const data = readData<{ users: User[] }>(USERS_FILE);
      console.log('Données brutes du fichier users.json:', JSON.stringify(data, null, 2));
      const user = data.users.find(user => user.email === email) || null;
      console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
      if (user) {
        console.log('Détails de l\'utilisateur:', JSON.stringify(user, null, 2));
      }
      return user;
    },

    async findByUsername(username: string): Promise<User | null> {
      const data = readData<{ users: User[] }>(USERS_FILE);
      return data.users.find(user => user.username === username) || null;
    },

    async findById(id: string): Promise<User | null> {
      const data = readData<{ users: User[] }>(USERS_FILE);
      return data.users.find(user => user.id === id) || null;
    },

    async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
      const data = readData<{ users: User[] }>(USERS_FILE);
      const index = data.users.findIndex(user => user.id === id);
      
      if (index === -1) return null;
      
      const updatedUser = {
        ...data.users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      data.users[index] = updatedUser;
      writeData(USERS_FILE, data);
      return updatedUser;
    },

    async validateCredentials(email: string, password: string): Promise<User | null> {
      try {
        console.log('Validation des identifiants pour:', email);
        const user = await this.findByEmail(email);
        
        if (!user) {
          console.log('Aucun utilisateur trouvé avec cet email');
          return null;
        }
        
        console.log('Utilisateur trouvé, vérification du mot de passe...');
        console.log('Mot de passe fourni:', password);
        console.log('Hachage stocké:', user.password);
        
        const isPasswordValid = await compare(password, user.password);
        console.log('Résultat de la comparaison:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log('Mot de passe incorrect');
        }
        
        return isPasswordValid ? user : null;
      } catch (error) {
        console.error('Erreur lors de la validation des identifiants:', error);
        return null;
      }
    },

    async setEmailVerified(userId: string): Promise<boolean> {
      const user = await this.findById(userId);
      if (!user) return false;
      
      await this.update(userId, { emailVerified: new Date().toISOString() });
      return true;
    },
  },

  // Gestion des sessions
  sessions: {
    async create(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
      const data = readData<{ sessions: Session[] }>(SESSIONS_FILE);
      const session: Session = {
        ...sessionData,
        id: `sess_${uuidv4()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      data.sessions.push(session);
      writeData(SESSIONS_FILE, data);
      return session;
    },

    async findByToken(token: string): Promise<Session | null> {
      const data = readData<{ sessions: Session[] }>(SESSIONS_FILE);
      return data.sessions.find(session => session.sessionToken === token) || null;
    },

    async delete(token: string): Promise<boolean> {
      const data = readData<{ sessions: Session[] }>(SESSIONS_FILE);
      const initialLength = data.sessions.length;
      data.sessions = data.sessions.filter(session => session.sessionToken !== token);
      
      if (data.sessions.length < initialLength) {
        writeData(SESSIONS_FILE, data);
        return true;
      }
      return false;
    },

    async deleteAllForUser(userId: string): Promise<number> {
      const data = readData<{ sessions: Session[] }>(SESSIONS_FILE);
      const initialLength = data.sessions.length;
      data.sessions = data.sessions.filter(session => session.userId !== userId);
      
      const deletedCount = initialLength - data.sessions.length;
      if (deletedCount > 0) {
        writeData(SESSIONS_FILE, data);
      }
      return deletedCount;
    },
  },

  // Initialiser la base de données avec un utilisateur admin si nécessaire
  async initAdminUser() {
    const adminEmail = 'admin@example.com';
    const adminUsername = 'admin';
    
    // Vérifier si l'admin existe déjà par email ou par nom d'utilisateur
    const adminByEmail = await this.users.findByEmail(adminEmail);
    const adminByUsername = await this.users.findByUsername(adminUsername);
    
    // Si aucun admin n'existe, en créer un nouveau
    if (!adminByEmail && !adminByUsername) {
      // Hasher le mot de passe
      const hashedPassword = await hash('Admin@123', 12); // Mot de passe fort par défaut
      
      await this.users.create({
        email: adminEmail,
        password: 'Admin@123', // Le mot de passe sera hashé dans la méthode create
        name: 'Administrateur',
        username: adminUsername,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: new Date().toISOString()
      });
      console.log('✅ Compte administrateur créé avec succès');
    } else if (adminByEmail && adminByEmail.role !== 'ADMIN') {
      // Mettre à jour le rôle si l'utilisateur existe mais n'est pas admin
      await this.users.update(adminByEmail.id, {
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      console.log('✅ Rôle administrateur attribué à l\'utilisateur existant');
    } else if (adminByUsername && adminByUsername.role !== 'ADMIN') {
      // Mettre à jour le rôle si l'utilisateur existe mais n'est pas admin
      await this.users.update(adminByUsername.id, {
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      console.log('✅ Rôle administrateur attribué à l\'utilisateur existant');
    } else {
      console.log('ℹ️  Compte administrateur déjà configuré');
    }
  },
};
