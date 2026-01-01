'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // Rediriger vers la page de connexion après 5 secondes
    const timer = setTimeout(() => {
      router.push('/connexion');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Identifiants incorrects. Veuillez réessayer.';
      case 'AccessDenied':
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
      case 'OAuthAccountNotLinked':
      case 'EmailSignin':
      case 'Configuration':
      default:
        return 'Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Erreur de connexion</h1>
        <p className="text-gray-300 mb-6">{getErrorMessage()}</p>
        <p className="text-gray-400 text-sm mb-6">
          Vous serez redirigé vers la page de connexion dans quelques secondes...
        </p>
        <button
          onClick={() => router.push('/connexion')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}
