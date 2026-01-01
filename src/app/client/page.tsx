'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Bienvenue dans votre espace client
        </h1>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Vos informations</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Nom d'utilisateur</p>
              <p className="text-lg">{session.user?.name || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-lg">{session.user?.email || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-gray-400">Rôle</p>
              <p className="text-lg capitalize">{session.user?.role?.toLowerCase() || 'utilisateur'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Tableau de bord</h3>
            <p className="text-gray-400">Accédez à votre tableau de bord personnel</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Paramètres</h3>
            <p className="text-gray-400">Gérez vos préférences de compte</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {
              router.push('/');
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
