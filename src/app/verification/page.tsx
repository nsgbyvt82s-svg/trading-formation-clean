'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Récupérer l'email depuis les paramètres d'URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Code de vérification invalide');
      }

      // Rediriger vers la page de connexion avec un message de succès
      router.push('/connexion?verified=true');
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Aucune adresse email trouvée');
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Impossible de renvoyer le code');
      }

      setError('');
      alert('Un nouveau code a été envoyé à votre adresse email');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du code:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Vérification de l'email</h1>
          
          <p className="text-gray-300 mb-6 text-center">
            Nous avons envoyé un code de vérification à <span className="font-semibold">{email || 'votre adresse email'}</span>.
            Entrez le code ci-dessous pour vérifier votre compte.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
                Code de vérification
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${isLoading ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            >
              {isLoading ? 'Vérification en cours...' : 'Vérifier le code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Renvoyer le code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
