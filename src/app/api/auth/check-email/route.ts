import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true }
    });

    return NextResponse.json(
      { 
        exists: !!user,
        message: user ? 'Utilisateur trouvé' : 'Utilisateur non trouvé'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return NextResponse.json(
      { 
        message: 'Une erreur est survenue lors de la vérification de l\'email',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
