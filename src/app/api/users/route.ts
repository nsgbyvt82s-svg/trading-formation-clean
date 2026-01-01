import { NextResponse } from 'next/server';
import { userDB } from '@/lib/user-db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    
    // Vérifier les droits d'administration
    if (!session?.user || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer tous les utilisateurs
    const users = await userDB.findAll();
    
    // Ne pas renvoyer les mots de passe
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Vérifier les droits d'administration
    if (!session?.user || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const userData = await request.json();
    
    try {
      const newUser = await userDB.create({
        ...userData,
        // Valeurs par défaut
        status: 'ACTIVE',
        twoFactorEnabled: false,
        role: userData.role || 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Ne pas renvoyer le mot de passe
      const { password, ...userWithoutPassword } = newUser;
      
      return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
