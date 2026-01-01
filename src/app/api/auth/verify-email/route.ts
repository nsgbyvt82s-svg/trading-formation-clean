import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token manquant' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur avec ce token
    const user = await prisma.user.findFirst({
      where: {
        emailToken: token,
        emailTokenExpires: {
          gt: new Date() // Vérifie que le token n'a pas expiré
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailToken: null,
        emailTokenExpires: null
      }
    });

    return NextResponse.redirect(new URL('/connexion?verified=true', request.url));

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email :', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la vérification de l\'email' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
