import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';

const prisma = new PrismaClient();

// Clé API pour sécuriser les appels (à stocker dans .env)
const API_KEY = process.env.ADMIN_API_KEY;

export async function POST(request: Request) {
  try {
    // Vérifier la clé API
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${API_KEY}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { email, username, password, role } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà' },
        { status: 400 }
      );
    }

    // Créer le compte avec le rôle spécifié
    const hashedPassword = await hash(password, 12);
    
    const userData: any = {
      email,
      username,
      password: hashedPassword,
      emailVerified: true,
    };

    // Ajouter le rôle uniquement s'il est valide
    const validRoles = ['USER', 'MODERATOR', 'ADMIN', 'OWNER'];
    if (role && validRoles.includes(role)) {
      userData.role = role;
    }
    
    const user = await prisma.user.create({
      data: userData,
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
    });

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}

// Désactiver le cache pour cette route
export const dynamic = 'force-dynamic';
