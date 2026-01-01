'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Préparer les identifiants en fonction du mode (connexion/inscription)
      const credentials = isLogin 
        ? { 
            email: formData.email || undefined,
            username: formData.email.includes('@') ? undefined : formData.email,
            password: formData.password 
          }
        : formData;

      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-8">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                {isLogin ? 'Email ou nom d\'utilisateur' : 'Email'}
              </label>
              <input
                id="email"
                name="email"
                type={isLogin ? 'text' : 'email'}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading 
                ? 'Chargement...' 
                : isLogin ? 'Se connecter' : 'Créer un compte'
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-400 hover:underline text-sm"
            >
              {isLogin 
                ? "Vous n'avez pas de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => signIn('discord')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                <span className="sr-only">Se connecter avec Discord</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.3,4.1c-1.5-0.7-3.1-1.2-4.8-1.4c-0.2,0.4-0.4,0.9-0.6,1.3c-1.5-0.2-3-0.2-4.5,0C10.1,3.6,9.9,3.2,9.7,2.8C8,3,6.4,3.4,4.9,4.1C1.5,8.5,0.9,12.7,1.3,16.9c1.8,1.4,3.9,2.4,6.1,3c0.5-0.7,0.9-1.4,1.2-2.2c-0.7-0.3-1.4-0.6-2-1c0.2-0.1,0.4-0.3,0.6-0.5c-1.6-0.6-2.9-1.9-2.9-3.5c0-0.8,0.2-1.5,0.6-2.1c1.1-1.3,3.6-1.4,5.1-1.1c0.2,0,0.4,0.1,0.6,0.1c0.1,0,0.2,0,0.3,0c1.5-0.3,3.9-0.2,5.1,1.1c0.4,0.6,0.6,1.3,0.6,2.1c0,1.7-1.3,3-2.9,3.5c0.2,0.2,0.4,0.4,0.6,0.5c-0.6,0.4-1.3,0.8-2,1c0.3,0.8,0.8,1.5,1.2,2.2c2.2-0.6,4.3-1.6,6.1-3C23.1,16.7,22.5,12.5,20.3,4.1z M8.5,14.4c-0.9,0-1.7-0.8-1.7-1.7c0-0.9,0.8-1.7,1.7-1.7s1.7,0.8,1.7,1.7C10.2,13.6,9.4,14.4,8.5,14.4z M15.5,14.4c-0.9,0-1.7-0.8-1.7-1.7c0-0.9,0.8-1.7,1.7-1.7s1.7,0.8,1.7,1.7C17.2,13.6,16.4,14.4,15.5,14.4z"/>
                </svg>
              </button>
              
              <Link
                href="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                <span className="sr-only">Retour à l'accueil</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
