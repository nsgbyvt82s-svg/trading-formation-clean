import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'Admin@1234';
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('\x1b[33m%s\x1b[0m', '⚠️  Un administrateur avec cet email existe déjà');
      return;
    }

    // Créer l'administrateur
    const hashedPassword = await hash(password, 12);
    
    const admin = await prisma.user.create({
      data: {
        email,
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: true
      }
    });

    console.log('\x1b[32m%s\x1b[0m', '✅ Compte administrateur créé avec succès !');
    console.log('Email: admin@example.com');
    console.log('Mot de passe: Admin@1234');
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Changez ce mot de passe après votre première connexion !');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Erreur lors de la création du compte administrateur:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
