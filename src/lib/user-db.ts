import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { User, UserWithoutPassword, UserRole, UserStatus, UserPreferences, UserAddress } from '@/types/user';

const DB_PATH = path.join(process.cwd(), 'data', 'user-accounts.json');

interface DatabaseSchema {
  users: User[];
}

class UserDB {
  private async readDB(): Promise<DatabaseSchema> {
    try {
      await this.ensureDBExists();
      const data = await fs.readFile(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading user database:', error);
      return { users: [] };
    }
  }

  private async writeDB(data: DatabaseSchema): Promise<void> {
    try {
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to user database:', error);
      throw new Error('Failed to update user database');
    }
  }

  public async ensureDBExists(): Promise<void> {
    try {
      await fs.access(DB_PATH);
    } catch {
      await this.writeDB({ users: [] });
    }
  }

  // CRUD Operations
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'twoFactorEnabled' | 'emailVerified'> & { 
    emailVerified?: string | null 
  }): Promise<User> {
    const db = await this.readDB();
    
    // Check if email already exists
    if (db.users.some(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      ...userData,
      id: uuidv4(),
      status: 'ACTIVE',
      emailVerified: userData.emailVerified || null,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await this.writeDB(db);
    return newUser;
  }

  async findById(id: string): Promise<User | undefined> {
    const db = await this.readDB();
    return db.users.find(user => user.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const db = await this.readDB();
    return db.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async findAll(filter: Partial<User> = {}): Promise<User[]> {
    const db = await this.readDB();
    return db.users.filter(user => {
      return Object.entries(filter).every(([key, value]) => {
        return user[key as keyof User] === value;
      });
    });
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'email'>>): Promise<User | undefined> {
    const db = await this.readDB();
    const userIndex = db.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return undefined;

    const updatedUser = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    db.users[userIndex] = updatedUser;
    await this.writeDB(db);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const db = await this.readDB();
    const initialLength = db.users.length;
    db.users = db.users.filter(user => user.id !== id);
    
    if (db.users.length !== initialLength) {
      await this.writeDB(db);
      return true;
    }
    return false;
  }

  // Additional utility methods
  async count(): Promise<number> {
    const db = await this.readDB();
    return db.users.length;
  }

  async exists(email: string): Promise<boolean> {
    const db = await this.readDB();
    return db.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Authentication methods
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    // In a real app, you would verify the password hash here
    if (user.password !== password) return null;
    
    return user;
  }

  // Statistics
  async getStats() {
    const db = await this.readDB();
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    return {
      total: db.users.length,
      active: db.users.filter(u => u.status === 'ACTIVE').length,
      inactive: db.users.filter(u => u.status === 'INACTIVE').length,
      suspended: db.users.filter(u => u.status === 'SUSPENDED').length,
      admins: db.users.filter(u => u.role === 'ADMIN' || u.role === 'OWNER').length,
      regularUsers: db.users.filter(u => u.role === 'USER').length,
      newThisMonth: db.users.filter(u => {
        const createdAt = new Date(u.createdAt);
        return createdAt >= oneMonthAgo;
      }).length,
    };
  }
}

export const userDB = new UserDB();

// Initialize the database file if it doesn't exist
userDB.ensureDBExists().catch(console.error);
