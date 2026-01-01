import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier users.json
const usersPath = path.join(process.cwd(), 'data', 'users.json');

export async function GET() {
  try {
    // Lire le fichier users.json
    const data = fs.readFileSync(usersPath, 'utf8');
    const { users } = JSON.parse(data);

    // Calculer les statistiques
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = users.length;
    const activeUsers = users.filter((user: any) => user.status === 'ACTIVE').length;
    const newUsers = users.filter((user: any) => {
      const userDate = new Date(user.createdAt);
      return userDate >= thirtyDaysAgo;
    }).length;

    // Pour l'exemple, on utilise des valeurs fixes pour les données manquantes
    // Vous devrez ajouter la logique pour calculer ces valeurs en fonction de votre application
    const pendingActions = 12; // À remplacer par la logique réelle
    const completedTasks = 87; // À remplacer par la logique réelle
    const revenue = 12543.75; // À remplacer par la logique réelle

    const stats = {
      totalUsers,
      activeUsers,
      newUsers,
      pendingActions,
      completedTasks,
      revenue
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
