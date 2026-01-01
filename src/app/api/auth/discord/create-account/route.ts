import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

// Clé secrète pour sécuriser l'API
const DISCORD_API_SECRET = process.env.DISCORD_API_SECRET;

export async function POST(req: Request) {
  try {
    const { 
      email, 
      password, 
      discordId, 
      discordRoles = [],
      discordAvatar,
      username
    } = await req.json();

    // Vérification de la clé API
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${DISCORD_API_SECRET}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier si l'email ou le discordId existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { discordId }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email ou ce compte Discord existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12);

    // Déterminer le rôle en fonction des rôles Discord
    let userRole = 'USER';
    if (discordRoles.includes('1443384502490763264')) { // Owner
      userRole = 'ADMIN';
    } else if (discordRoles.includes('1452844583347027981')) { // Admin
      userRole = 'ADMIN';
    } else if (discordRoles.includes('1452844554536489144')) { // Modo
      userRole = 'MODERATOR';
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        discordId,
        discordAvatar,
        role: userRole,
        emailVerified: true, // On fait confiance à Discord pour la vérification d'email
        discordRoles: {
          set: discordRoles
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      userId: user.id,
      role: user.role
    });

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
}
