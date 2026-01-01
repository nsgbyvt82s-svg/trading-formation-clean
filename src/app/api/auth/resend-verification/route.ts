import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

function generateVerificationToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email est requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Aucun compte trouvé avec cet email' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Votre email est déjà vérifié' },
        { status: 400 }
      );
    }

    // Générer un nouveau token
    const emailToken = generateVerificationToken();
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Mettre à jour l'utilisateur avec le nouveau token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailToken,
        emailTokenExpires
      }
    });

    // Envoyer l'email de vérification
    const emailSent = await sendVerificationEmail(email, emailToken);

    if (!emailSent) {
      throw new Error("Échec de l'envoi de l'email de vérification");
    }

    return NextResponse.json(
      { message: 'Un nouveau code de vérification a été envoyé à votre adresse email' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors du renvoi du code de vérification:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
