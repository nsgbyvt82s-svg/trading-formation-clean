import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Configuration
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;
const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Types
type UserRole = 'USER' | 'ADMIN' | 'ACCOUNTANT' | 'OWNER';
type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';

interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  emailVerified?: Date | null;
  username?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  lastIp?: string | null;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
}

// Initialiser la base de données
function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], sessions: [] }, null, 2));
  }
}

// Lire les données
function readDB(): { users: User[]; sessions: Session[] } {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const jsonData = JSON.parse(data);
    // S'assurer que la structure de retour est correcte
    return {
      users: jsonData.users || [],
      sessions: [] // Nous n'utilisons pas encore les sessions
    };
  } catch (error) {
    console.error('Erreur de lecture de la base de données:', error);
    return { users: [], sessions: [] };
  }
}

// Écrire des données
function writeDB(data: { users: User[]; sessions: Session[] }): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur d\'écriture dans la base de données:', error);
    return false;
  }
}

// Fonctions d'authentification
export const fileAuth = {
  // Utilisateurs
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<User> {
    const data = readDB();
    const hashedPassword = await hash(userData.password, SALT_ROUNDS);
    
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      password: hashedPassword,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: userData.role || 'USER',
    };

    data.users.push(user);
    writeDB(data);
    return user;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const data = readDB();
    return data.users.find(u => u.email === email) || null;
  },

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log('Tentative de validation pour l\'email:', email);
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return null;
    }
    
    console.log('Utilisateur trouvé:', { id: user.id, email: user.email, role: user.role });
    
    try {
      const isValid = await compare(password, user.password);
      console.log('Validation du mot de passe:', isValid ? 'réussie' : 'échouée');
      return isValid ? user : null;
    } catch (error) {
      console.error('Erreur lors de la comparaison des mots de passe:', error);
      return null;
    }
  },

  // Sessions
  createSession(userId: string, userAgent?: string, ipAddress?: string): Session {
    const data = readDB();
    const session: Session = {
      id: randomBytes(32).toString('hex'),
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
      createdAt: new Date().toISOString(),
      userAgent,
      ipAddress,
    };

    data.sessions.push(session);
    writeDB(data);
    return session;
  },

  findSession(sessionId: string): Session | null {
    const data = readDB();
    return data.sessions.find(s => s.id === sessionId) || null;
  },

  deleteSession(sessionId: string): void {
    const data = readDB();
    data.sessions = data.sessions.filter(s => s.id !== sessionId);
    writeDB(data);
  },

  // JWT
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      username: user.username,
    };

    return sign(payload, JWT_SECRET, { expiresIn: '30d' });
  },

  verifyToken(token: string): any {
    try {
      return verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return null;
    }
  },

  // Méthodes utilitaires
  async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Mettre à jour la dernière connexion
    this.updateUser(user.id, {
      lastLogin: new Date().toISOString(),
      lastIp: ipAddress,
    });

    // Créer une session
    return this.createSession(user.id, userAgent, ipAddress);
  },

  updateUser(userId: string, updates: Partial<User>): User | null {
    const data = readDB();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return null;

    const updatedUser = {
      ...data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    data.users[userIndex] = updatedUser;
    writeDB(data);
    return updatedUser;
  }
};

// Initialiser la base de données au démarrage
initDB();

// Exportation ES modules
export default fileAuth;
