const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

const auth = {
  async register(email, password, name = '') {
    if (!email || !password) {
      throw new AuthError('Email et mot de passe requis');
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      throw new AuthError('Un utilisateur avec cet email existe déjà');
    }

    return await db.createUser({ email, password, name });
  },

  async login(email, password) {
    if (!email || !password) {
      throw new AuthError('Email et mot de passe requis');
    }

    const user = await db.validateUser(email, password);
    if (!user) {
      throw new AuthError('Email ou mot de passe incorrect');
    }

    // Créer une nouvelle session
    return db.createSession(user.id);
  },

  async validateSession(sessionId) {
    if (!sessionId) return null;
    
    const session = db.findSession(sessionId);
    if (!session) return null;

    // Vérifier si la session est expirée
    if (new Date(session.expiresAt) < new Date()) {
      db.deleteSession(sessionId);
      return null;
    }

    return session;
  },

  logout(sessionId) {
    db.deleteSession(sessionId);
  }
};

module.exports = { auth, AuthError };
