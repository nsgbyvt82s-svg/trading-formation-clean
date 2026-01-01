import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../app/api/auth/[...nextauth]/auth-options';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et a les droits d'administration
    if (!session?.user || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    console.log('Chemin du fichier users.json:', DB_PATH);
    
    try {
      // Vérifier si le dossier data existe, sinon le créer
      const dataDir = path.dirname(DB_PATH);
      if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
        console.log(`Dossier créé : ${dataDir}`);
      }

      // Vérifier si le fichier existe, sinon le créer
      if (!existsSync(DB_PATH)) {
        console.log('Le fichier users.json n\'existe pas encore, création d\'un fichier vide');
        // Créer un fichier vide avec un tableau d'utilisateurs vide
        const initialData = { users: [] };
        writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      }
        
      const fileContent = readFileSync(DB_PATH, 'utf-8');
      console.log('Contenu du fichier:', fileContent);
      
      const data = JSON.parse(fileContent);
      
      // Vérifier si data.users existe
      if (!data.users || !Array.isArray(data.users)) {
        console.error('Format de fichier invalide, data.users n\'est pas un tableau:', data);
        return NextResponse.json(
          { error: 'Format de fichier utilisateur invalide' },
          { status: 500 }
        );
      }
      
      // Ne pas renvoyer les mots de passe
      const usersWithoutPasswords = data.users.map(({ password, ...user }: { password: string; [key: string]: any }) => user);
      return NextResponse.json(usersWithoutPasswords);
    } catch (fileError) {
      console.error('Erreur lors de la lecture du fichier users.json:', fileError);
      throw fileError; // Relancer l'erreur pour la capturer dans le catch principal
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et a les droits d'administration
    if (!session?.user || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const userData = await request.json();
    
    // Lire les utilisateurs existants
    const data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    
    // Vérifier si l'email existe déjà
    if (data.users.some((u: any) => u.email === userData.email)) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }
    
    // Créer un nouvel utilisateur
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      status: 'ACTIVE',
      emailVerified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Ajouter le nouvel utilisateur
    data.users.push(newUser);
    
    // Écrire dans le fichier
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// Route pour récupérer un utilisateur par ID
export async function GET_BY_ID(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const user = data.users.find((u: any) => u.id === id);

    if (!user) {
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

// Route pour mettre à jour un utilisateur
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { id } = params;
    const updates = await request.json();
    const data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    
    const userIndex = data.users.findIndex((u: any) => u.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour l'utilisateur
    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates,
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

// Route pour supprimer un utilisateur
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
