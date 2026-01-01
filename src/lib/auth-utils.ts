import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Types
type UserRole = 'USER' | 'ADMIN' | 'ACCOUNTANT';
type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';

interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// Fonction utilitaire pour hacher les mots de passe
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

// Fonction utilitaire pour vérifier les mots de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Générer un token JWT
export function generateToken(user: UserPayload): string {
  return sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Vérifier un token JWT
export function verifyToken(token: string): UserPayload | null {
  try {
    return verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

// Récupérer l'utilisateur à partir du token d'authentification
export async function getUserFromToken(token: string | undefined) {
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;

  return await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      emailVerified: true,
    },
  });
}

// Vérifier si l'utilisateur est authentifié
export async function isAuthenticated(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const user = await getUserFromToken(token);
  return !!user && user.status === 'ACTIVE';
}

// Vérifier si l'utilisateur a un rôle spécifique
export async function hasRole(token: string | undefined, role: UserRole): Promise<boolean> {
  if (!token) return false;
  const user = await getUserFromToken(token);
  return !!user && user.role === role && user.status === 'ACTIVE';
}

// Vérifier si l'utilisateur a l'un des rôles spécifiés
export async function hasAnyRole(token: string | undefined, roles: UserRole[]): Promise<boolean> {
  if (!token) return false;
  const user = await getUserFromToken(token);
  return !!user && roles.includes(user.role as UserRole) && user.status === 'ACTIVE';
}

// Gestion des erreurs d'authentification
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Récupérer le token depuis la requête
export function getTokenFromRequest(req: NextRequest): string | undefined {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return req.cookies.get('auth-token')?.value;
}

// Générateur de token aléatoire
export function generateRandomToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// Enregistrer une tentative de connexion
export async function logLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string | null,
  success: boolean,
  userId?: string
) {
  await prisma.loginAttempt.create({
    data: {
      email,
      ipAddress,
      userAgent: userAgent || undefined,
      success,
      userId,
    },
  });

  // Si l'échec est dû à un mot de passe incorrect, incrémenter le compteur d'échecs
  if (!success) {
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: { increment: 1 },
          lastFailedLogin: new Date(),
        },
      });
    }
  } else if (userId) {
    // Réinitialiser le compteur d'échecs en cas de succès
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastLogin: new Date(),
      },
    });
  }
}

// Vérifier si l'utilisateur est bloqué en raison de trop de tentatives échouées
export async function isUserLockedOut(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true, lastFailedLogin: true },
  });

  if (!user) return true;

  // Bloquer après 5 tentatives échouées pendant 15 minutes
  if (user.failedLoginAttempts >= 5) {
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    if ((user.lastFailedLogin || new Date(0)) > fifteenMinutesAgo) {
      return true;
    } else {
      // Réinitialiser le compteur si la période de blocage est écoulée
      await prisma.user.update({
        where: { id: userId },
        data: { failedLoginAttempts: 0 },
      });
    }
  }

  return false;
}
