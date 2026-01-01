import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth-options';
import { getActiveSessions } from '@/lib/active-sessions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'OWNER', 'SUPERADMIN'].includes((session.user as any).role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const activeSessions = getActiveSessions();
    console.log('Sessions actives:', activeSessions);
    
    const onlineAdmins = Object.entries(activeSessions)
      .filter(([_, data]) => ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(data.role))
      .map(([userId, data]) => ({
        id: userId,
        ...data,
        isOnline: true,
        lastSeen: new Date(data.lastActive).toISOString()
      }));

    console.log('Administrateurs en ligne:', onlineAdmins);
    return NextResponse.json(onlineAdmins);
  } catch (error) {
    console.error('Erreur dans /api/admin/online:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
