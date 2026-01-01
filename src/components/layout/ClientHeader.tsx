'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface ClientHeaderProps {
  isGuest?: boolean;
}

export function ClientHeader({ isGuest = false }: ClientHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <img 
            src="/images/Design_sans_titre_19.png" 
            alt="DiamondTrade Logo" 
            className="h-10 w-10"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            DiamondTrade
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link 
            href="/client" 
            className={`text-sm font-medium ${
              pathname === '/client' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
            } transition-colors`}
          >
            Tableau de bord
          </Link>
          <Link 
            href="/client/formations" 
            className={`text-sm font-medium ${
              pathname?.startsWith('/client/formations') ? 'text-blue-400' : 'text-gray-300 hover:text-white'
            } transition-colors`}
          >
            Mes formations
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 hidden md:inline-block">
                Bonjour, {user?.name || 'cher client'} 👋
              </span>
              <SignOutButton />
            </div>
          ) : isGuest ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 hidden md:inline-block">
                Mode invité
              </span>
              <button
                onClick={() => router.push('/connexion')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href={`/connexion?callbackUrl=${encodeURIComponent(pathname || '/client')}`} 
                className="px-4 py-2 text-sm font-medium text-white hover:text-blue-400 transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/inscription" 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
