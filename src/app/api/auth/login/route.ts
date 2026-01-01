import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  emailVerified: boolean;
  lastLogin?: Date | null;
  updatedAt: Date;
};

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe par nom d'utilisateur ou email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    }) as User | null;

    if (!user) {
      return NextResponse.json(
        { message: 'Nom d\'utilisateur ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      updatedAt: new Date()
    };

    // Vérifier si lastLogin existe avant de l'ajouter
    if ('lastLogin' in user) {
      updateData.lastLogin = new Date();
    }

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    // Retourner les informations de l'utilisateur
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'USER',
        emailVerified: user.emailVerified
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
