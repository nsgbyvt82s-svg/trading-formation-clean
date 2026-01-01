import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Clé API pour sécuriser l'endpoint
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  try {
    // Vérifier la clé API
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (token !== API_KEY) {
      return NextResponse.json(
        { error: 'Clé API invalide' },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const { username, password, discordId, role, expiresAt } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { discordId }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec ce nom d\'utilisateur ou ID Discord existe déjà' },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await hash(password, 12);

    // Créer l'utilisateur avec date d'expiration
    const userData: any = {
      username,
      email: `${username}@discord.app`, // Email factice
      password: hashedPassword,
      discordId,
      role: role.toUpperCase(), // Convertir en majuscules pour correspondre au type UserRole
      emailVerified: true, // Marquer comme vérifié car c'est via Discord
      status: 'ACTIVE', // Marquer comme actif immédiatement
    };

    // Ajouter la date d'expiration si elle est fournie
    if (expiresAt) {
      userData.expiresAt = new Date(expiresAt);
    }

    const user = await prisma.user.create({
      data: userData
    });

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword, message: 'Compte créé avec succès' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de la création du compte Discord:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
