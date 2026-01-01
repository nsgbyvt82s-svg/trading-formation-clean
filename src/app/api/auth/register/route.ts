import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Chemin vers le fichier des utilisateurs
const USERS_FILE = path.join(process.cwd(), 'src', 'lib', 'users.json');

// Fonction pour lire les utilisateurs depuis le fichier
const readUsers = () => {
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
};

// Fonction pour écrire les utilisateurs dans le fichier
const writeUsers = (users: any) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf-8');
};

// Désactiver le cache pour cette route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('Début de la requête d\'inscription');
    
    const body = await request.json();
    console.log('Données reçues:', body);
    
    const { username, email, password } = body;
    
    // Validation des champs
    if (!username || !email || !password) {
      console.error('Champs manquants:', { username, email, password: !!password });
      return NextResponse.json(
        { message: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }
    
    console.log('Vérification de l\'existence de l\'utilisateur...');
    
    // Lire les utilisateurs actuels
    const data = readUsers();
    const users = data.users || [];
    
    // Vérifier si l'email existe déjà
    const existingUser = users.find((user: any) => user.email === email);
    if (existingUser) {
      console.log('Email déjà utilisé:', email);
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Vérifier si le nom d'utilisateur est déjà pris
    const existingUsername = users.find((user: any) => user.username === username);
    if (existingUsername) {
      return NextResponse.json(
        { message: 'Ce nom d\'utilisateur est déjà pris' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Mot de passe hashé avec succès');

    // Créer le nouvel utilisateur
    console.log('Création de l\'utilisateur...');
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role: 'USER',
      status: 'active',
      emailVerified: null,
      name: username,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter le nouvel utilisateur au tableau
    users.push(newUser);
    
    // Écrire les modifications dans le fichier
    writeUsers(users);

    console.log('Utilisateur créé avec succès:', { id: newUser.id, email: newUser.email });

    return NextResponse.json(
      { 
        message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription :', error);
    
    let errorMessage = 'Une erreur est survenue lors de l\'inscription';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
