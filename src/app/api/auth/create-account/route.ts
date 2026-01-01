// src/app/api/auth/create-account/route.ts
import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

// Fonction pour lire les utilisateurs
const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2))
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')).users
}

// Fonction pour écrire les utilisateurs
const writeUsers = (users: any[]) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2))
}

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json()

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Email invalide' }, { status: 400 })
    }
    if (!username || username.length < 3) {
      return NextResponse.json({ message: "Nom d'utilisateur invalide" }, { status: 400 })
    }

    const users = readUsers()

    // Vérifier doublons
    const existingUser = users.find(
      (u: any) => u.email === email.toLowerCase() || u.username === username
    )
    if (existingUser) {
      return NextResponse.json(
        {
          message:
            existingUser.email === email.toLowerCase()
              ? "Un compte avec cet email existe déjà"
              : "Ce nom d'utilisateur est déjà pris",
        },
        { status: 400 }
      )
    }

    // Créer un mot de passe aléatoire et le hasher
    const password = Math.random().toString(36).slice(-12)
    const hashedPassword = await hash(password, 12)

    // Créer l'utilisateur
    const newUser = {
      id: (users.length + 1).toString(),
      email: email.toLowerCase(),
      username,
      name: username,
      role: 'USER',
      password: hashedPassword,
      accountType: 'CREDENTIALS',
      status: 'ACTIVE',
      discordRoles: [],
      emailVerified: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    users.push(newUser)
    writeUsers(users)

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        success: true,
        message: 'Compte créé avec succès',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création du compte', error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
