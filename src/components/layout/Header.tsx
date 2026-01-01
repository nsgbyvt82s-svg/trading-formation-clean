'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiShield } from 'react-icons/fi';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Afficher un indicateur de chargement pendant le chargement de la session
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="h-10 w-10 bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-700 rounded-md animate-pulse"></div>
        </div>
      </header>
    );
  }

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
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/70 rounded-full px-3 py-1.5 transition-colors"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-200">
                    {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Profil'}
                  </span>
                  {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                    <span className="text-xs text-green-400 font-medium">
                      {user?.role === 'OWNER' ? 'Propriétaire' : 'Administrateur'}
                    </span>
                  )}
                </div>
                <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {/* Menu déroulant */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm text-white font-medium">{user?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profil"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiUser className="mr-3 h-5 w-5 text-gray-400" />
                      Mon profil
                    </Link>
                    <Link
                      href="/parametres"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiSettings className="mr-3 h-5 w-5 text-gray-400" />
                      Paramètres
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'SUPERADMIN') && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 hover:text-yellow-300"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiShield className="mr-3 h-5 w-5 text-yellow-400" />
                        Administration
                      </Link>
                    )}
                  </div>
                  <div className="py-1 border-t border-gray-700">
                    <SignOutButton className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-white hover:text-blue-400 transition-colors"
              >
                Se connecter
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
