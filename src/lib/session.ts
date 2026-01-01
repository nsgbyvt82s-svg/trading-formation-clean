import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        discordId: true,
        discordUsername: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: user.role || 'USER',
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUserRole() {
  const user = await getCurrentUser();
  return user?.role || 'USER';
}
