'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{session?.user?.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
        >
          <h2 className="text-2xl font-bold mb-6">Bienvenue, {session?.user?.name || 'cher client'} !</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Carte des formations */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4">Mes formations</h3>
              <p className="text-gray-400">Accédez à vos formations achetées</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                Voir mes formations
              </button>
            </div>

            {/* Carte du profil */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4">Mon profil</h3>
              <p className="text-gray-400">Gérez vos informations personnelles</p>
              <button className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
                Modifier mon profil
              </button>
            </div>

            {/* Carte du support */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <p className="text-gray-400">Besoin d'aide ? Contactez-nous</p>
              <a 
                href="https://discord.gg/votre-lien-discord" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                Rejoindre le Discord
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
