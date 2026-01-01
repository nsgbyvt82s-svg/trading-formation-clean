const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Initialiser la base de données
function initDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ 
      users: [],
      sessions: []
    }, null, 2));
  }
}

// Lire les données
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur de lecture de la base de données:', error);
    return { users: [], sessions: [] };
  }
}

// Écrire des données
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur d\'écriture dans la base de données:', error);
    return false;
  }
}

const db = {
  // Utilisateurs
  async createUser(userData) {
    const data = readDB();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name || '',
      password: hashedPassword,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.users.push(user);
    writeDB(data);
    return user;
  },

  async findUserByEmail(email) {
    const data = readDB();
    return data.users.find(u => u.email === email) || null;
  },

  async validateUser(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  },

  // Sessions
  createSession(userId) {
    const data = readDB();
    const session = {
      id: require('crypto').randomBytes(32).toString('hex'),
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
      createdAt: new Date().toISOString()
    };

    data.sessions.push(session);
    writeDB(data);
    return session;
  },

  findSession(sessionId) {
    const data = readDB();
    return data.sessions.find(s => s.id === sessionId) || null;
  },

  deleteSession(sessionId) {
    const data = readDB();
    data.sessions = data.sessions.filter(s => s.id !== sessionId);
    writeDB(data);
  }
};

// Initialiser la base de données au démarrage
initDB();

module.exports = db;
