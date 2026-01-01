import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Désactiver le cache pour cette route
export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { username, email } = await request.json();

    // Validation des données
    if (!username || !email) {
      return NextResponse.json(
        { message: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Cet email est déjà utilisé par un autre compte' },
          { status: 400 }
        );
      }
    }

    // Vérifier si le nom d'utilisateur est déjà pris
    if (username !== session.user.username) {
      const existingUsername = await prisma.user.findFirst({
        where: { 
          username,
          email: { not: session.user.email }
        }
      });

      if (existingUsername) {
        return NextResponse.json(
          { message: 'Ce nom d\'utilisateur est déjà pris' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        username,
        email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
