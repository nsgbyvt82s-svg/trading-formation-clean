'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de connexion après 5 secondes
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'Ce compte est déjà lié à un autre utilisateur. Veuillez vous connecter avec la méthode originale.';
      case 'CredentialsSignin':
        return 'Email ou mot de passe incorrect. Veuillez réessayer.';
      case 'AccessDenied':
        return 'Vous n\'avez pas les droits nécessaires pour accéder à cette page.';
      case 'Configuration':
        return 'Un problème de configuration du serveur est survenu. Veuillez contacter le support.';
      case 'Verification':
        return 'Le lien de vérification a expiré ou est invalide. Veuillez réessayer.';
      default:
        return 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
            <svg 
              className="h-8 w-8 text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-white">Erreur de connexion</h2>
          <p className="mt-4 text-gray-300">
            {getErrorMessage(error)}
          </p>
          <div className="mt-8">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                    Redirection en cours...
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-red-500">
                    5s
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                <div 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
