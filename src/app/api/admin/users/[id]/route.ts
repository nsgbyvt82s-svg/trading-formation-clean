import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Récupérer un utilisateur par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { id } = params;
    const data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    
    // Log for debugging
    console.log('Looking for user with ID:', id);
    console.log('Available users:', data.users.map((u: any) => ({ id: u.id, email: u.email })));
    
    if (!id) {
      console.error('No ID provided for user lookup');
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }
    
    // Try exact match first, then try case-insensitive match
    let user = data.users.find((u: any) => u.id && u.id.toString() === id.toString());
    
    if (!user) {
      // Try case-insensitive match
      user = data.users.find((u: any) => 
        u.id && typeof u.id === 'string' && 
        id && typeof id === 'string' && 
        u.id.toLowerCase() === id.toLowerCase()
      );
    }

    if (!user) {
      console.error(`User with ID ${id} not found in database`);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Mettre à jour un utilisateur
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    // Seul un propriétaire peut modifier les rôles
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = params;
    const updates = await request.json();
    const data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    
    // Log for debugging
    console.log('PUT - Looking for user with ID:', id);
    console.log('PUT - Available users:', data.users.map((u: any) => ({ id: u.id, email: u.email })));
    
    if (!id) {
      console.error('No ID provided for user update');
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }
    
    // Try exact match first, then try case-insensitive match
    let userIndex = data.users.findIndex((u: any) => u.id && u.id.toString() === id.toString());
    
    if (userIndex === -1) {
      // Try case-insensitive match
      userIndex = data.users.findIndex((u: any) => 
        u.id && typeof u.id === 'string' && 
        id && typeof id === 'string' && 
        u.id.toLowerCase() === id.toLowerCase()
      );
    }
    
    if (userIndex === -1) {
      console.error(`PUT - User with ID ${id} not found in database`);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const userToUpdate = data.users[userIndex];
    const isOwner = session.user.role === 'OWNER';
    const isSelf = session.user.id === id;

    // Vérifier les autorisations
    if (!isOwner) {
      // Un admin ne peut pas modifier un autre admin ou propriétaire
      if (['ADMIN', 'OWNER'].includes(userToUpdate.role)) {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à modifier cet utilisateur' },
          { status: 403 }
        );
      }
    }

    // Un propriétaire ne peut pas se rétrograder lui-même
    if (isSelf && isOwner && updates.role && updates.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Un propriétaire ne peut pas se rétrograder' },
        { status: 403 }
      );
    }

    // Mettre à jour l'utilisateur
    data.users[userIndex] = {
      ...userToUpdate,
      ...updates,
      // Garder le rôle actuel si ce n'est pas le propriétaire qui modifie
      role: isOwner && updates.role ? updates.role : userToUpdate.role,
      updatedAt: new Date().toISOString()
    };

    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    const { password, ...userWithoutPassword } = data.users[userIndex];
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// Supprimer un utilisateur
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { id } = params;
    const data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    
    const userIndex = data.users.findIndex((u: any) => u.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Ne pas permettre de se supprimer soi-même
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    const [deletedUser] = data.users.splice(userIndex, 1);
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    const { password, ...userWithoutPassword } = deletedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}
