'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, on active le mode "liaison de compte"
    if (status === 'authenticated' && !isLinking) {
      setIsLinking(true);
    }
  }, [status, isLinking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/paiement',
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        router.push('/paiement');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLinking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-gray-950"></div>
        </div>
        <div className="w-full max-w-md z-10">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
                Lier votre compte Discord
              </h1>
              <p className="text-gray-300 mb-6">
                Connectez-vous avec Discord pour lier votre compte à votre profil existant.
              </p>
              
              <button
                onClick={() => signIn('discord', { callbackUrl: '/paiement' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors mb-4"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M20.3,4.4c-1.2-0.6-2.5-1-3.8-1.2c-0.1,0.2-0.3,0.6-0.4,0.9c-1.4-0.2-2.8-0.2-4.2,0C11.7,4,11.5,3.6,11.4,3.3c-1.3,0.2-2.6,0.6-3.8,1.2c-2.6,3.9-3.3,7.7-2.9,11.5c1.7,1.3,3.3,2.1,4.9,2.6c0.4-0.6,0.8-1.2,1.1-1.8c-0.6-0.2-1.2-0.5-1.7-0.8c0.1-0.1,0.3-0.2,0.4-0.3c3.2,1.5,6.7,1.5,9.9,0c0.1,0.1,0.3,0.2,0.4,0.3c-0.6,0.3-1.1,0.6-1.7,0.8c0.3,0.6,0.7,1.2,1.1,1.8c1.6-0.5,3.2-1.3,4.9-2.6C23.9,15.4,22.5,9.3,20.3,4.4z M8.3,14.9c-0.9,0-1.7-0.8-1.7-1.8c0-1,0.7-1.8,1.7-1.8c0.9,0,1.7,0.8,1.7,1.8C10,14.1,9.2,14.9,8.3,14.9z M16.8,14.9c-0.9,0-1.7-0.8-1.7-1.8c0-1,0.7-1.8,1.7-1.8c0.9,0,1.7,0.8,1.7,1.8C18.5,14.1,17.7,14.9,16.8,14.9z" />
                </svg>
                <span>Se connecter avec Discord</span>
              </button>
              
              <button
                onClick={() => {
                  setIsLinking(false);
                  setError('');
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Retour à la connexion
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 text-red-300 border border-red-800/50 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-gray-950"></div>
      </div>
      <div className="w-full max-w-md z-10">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
                Connexion
              </h1>
              <p className="text-gray-400">Accédez à votre compte</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/30 text-red-300 border border-red-800/50 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Bouton Discord */}
            <div className="mb-6">
              <button
                onClick={() => signIn('discord', { 
                  callbackUrl: '/paiement',
                  scope: 'identify email guilds guilds.members.read'
                })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M20.3,4.4c-1.2-0.6-2.5-1-3.8-1.2c-0.1,0.2-0.3,0.6-0.4,0.9c-1.4-0.2-2.8-0.2-4.2,0C11.7,4,11.5,3.6,11.4,3.3c-1.3,0.2-2.6,0.6-3.8,1.2c-2.6,3.9-3.3,7.7-2.9,11.5c1.7,1.3,3.3,2.1,4.9,2.6c0.4-0.6,0.8-1.2,1.1-1.8c-0.6-0.2-1.2-0.5-1.7-0.8c0.1-0.1,0.3-0.2,0.4-0.3c3.2,1.5,6.7,1.5,9.9,0c0.1,0.1,0.3,0.2,0.4,0.3c-0.6,0.3-1.1,0.6-1.7,0.8c0.3,0.6,0.7,1.2,1.1,1.8c1.6-0.5,3.2-1.3,4.9-2.6C23.9,15.4,22.5,9.3,20.3,4.4z M8.3,14.9c-0.9,0-1.7-0.8-1.7-1.8c0-1,0.7-1.8,1.7-1.8c0.9,0,1.7,0.8,1.7,1.8C10,14.1,9.2,14.9,8.3,14.9z M16.8,14.9c-0.9,0-1.7-0.8-1.7-1.8c0-1,0.7-1.8,1.7-1.8c0.9,0,1.7,0.8,1.7,1.8C18.5,14.1,17.7,14.9,16.8,14.9z" />
                </svg>
                <span>Continuer avec Discord</span>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/80 text-gray-400">ou</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Mot de passe
                  </label>
                  <Link href="/mot-de-passe-oublie" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Se souvenir de moi
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : 'Se connecter'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
