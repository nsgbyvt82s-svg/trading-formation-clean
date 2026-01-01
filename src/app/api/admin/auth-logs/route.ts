import { NextResponse } from 'next/server';
import { getAuthLogs } from '@/lib/authLogger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../app/api/auth/[...nextauth]/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      console.log('Aucune session utilisateur trouvée');
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER') {
      console.log('Accès refusé - Rôle insuffisant:', session.user.role);
      return NextResponse.json(
        { error: 'Accès non autorisé. Rôle insuffisant.' },
        { status: 403 }
      );
    }

    console.log('Accès autorisé pour:', session.user.email, 'Rôle:', session.user.role);
    
    // Récupérer les logs
    const logs = await getAuthLogs(100);
    return NextResponse.json(logs);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des logs' },
      { status: 500 }
    );
  }
}
