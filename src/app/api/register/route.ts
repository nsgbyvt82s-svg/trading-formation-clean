import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Chemins des fichiers de données
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// S'assurer que le dossier data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Fonction pour lire les utilisateurs
const readUsers = () => {
  try {
    console.log('Lecture du fichier users.json...');
    
    if (!fs.existsSync(USERS_FILE)) {
      console.log('Le fichier users.json n\'existe pas, création d\'un nouveau fichier vide');
      writeUsers({ users: [] });
      return { users: [] };
    }
    
    let data = fs.readFileSync(USERS_FILE, 'utf-8');
    console.log('Contenu brut du fichier:', data);
    
    // Supprimer le BOM s'il existe
    if (data.charCodeAt(0) === 0xFEFF) {
      console.log('Suppression du BOM...');
      data = data.slice(1);
    }
    
    // Vérifier si le fichier est vide
    if (!data.trim()) {
      console.log('Le fichier est vide, initialisation avec un tableau vide');
      return { users: [] };
    }
    
    console.log('Données à parser:', data);
    const parsed = JSON.parse(data);
    console.log('Données parsées avec succès:', parsed);
    return parsed;
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier users.json:', error);
    // En cas d'erreur, on retourne un tableau vide
    return { users: [] };
  }
};

// Fonction pour écrire les utilisateurs
const writeUsers = (data: any) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
};

export async function POST(request: Request) {
  try {
    const { username, email, password, role = 'USER' } = await request.json();
    
    // Vérifier si l'utilisateur existe déjà
    const data = readUsers();
    const existingUser = data.users.find(
      (user: any) => user.email === email || user.username === username
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà' },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await hash(password, 10);
    const now = new Date().toISOString();

    // Créer le nouvel utilisateur
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      name: username,
      role: role.toUpperCase(),
      status: 'ACTIVE',
      emailVerified: now,
      createdAt: now,
      updatedAt: now
    };

    // Ajouter le nouvel utilisateur
    data.users.push(newUser);
    writeUsers(data);

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword, message: 'Compte créé avec succès' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
