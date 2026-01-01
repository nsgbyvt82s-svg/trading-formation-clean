import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json();

    // Validation des données
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Email invalide' },
        { status: 400 }
      );
    }

    if (!username || username.length < 3) {
      return NextResponse.json(
        { message: 'Nom d\'utilisateur invalide (minimum 3 caractères)' },
        { status: 400 }
      );
    }

    // Vérifier si l'email ou le nom d'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { username: username.trim() }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          message: existingUser.email === email.toLowerCase() 
            ? 'Un compte avec cet email existe déjà' 
            : 'Ce nom d\'utilisateur est déjà pris'
        },
        { status: 400 }
      );
    }

    // Créer un mot de passe aléatoire sécurisé
    const password = Math.random().toString(36).slice(-12);
    const hashedPassword = await hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password: hashedPassword,
        name: username.trim(),
        role: 'USER',
        accountType: 'CREDENTIALS',
        status: 'ACTIVE',
        discordRoles: JSON.stringify([]),
        emailVerified: new Date(),
        lastLogin: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        accountType: true,
        emailVerified: true
      }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Compte créé avec succès',
        user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { 
        message: 'Une erreur est survenue lors de la création du compte',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
