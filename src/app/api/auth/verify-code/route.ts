import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email et code sont requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur avec ce code de vérification
    const user = await prisma.user.findFirst({
      where: {
        email,
        emailToken: code,
        emailTokenExpires: {
          gt: new Date() // Vérifie que le code n'a pas expiré
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Code de vérification invalide ou expiré' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailToken: null,
        emailTokenExpires: null
      }
    });

    return NextResponse.json(
      { message: 'Email vérifié avec succès' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
