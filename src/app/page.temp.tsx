'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers /home qui gère la logique d'authentification
    router.push('/home');
  }, [router]);

  // Afficher un écran de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Chargement...</p>
      </div>
    </div>
  );
}
