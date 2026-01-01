'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSettings, FiHome, FiUser, FiLogOut, FiShield } from 'react-icons/fi';

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // Ne pas afficher la navbar sur les pages de connexion et d'inscription
  if (pathname.startsWith('/connexion') || pathname.startsWith('/inscription')) {
    return null;
  }

  // Vérifie si l'utilisateur est administrateur ou propriétaire
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER';
  
  console.log('Session:', session);
  console.log('isAdmin:', isAdmin);
  console.log('User role:', session?.user?.role);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className={`flex items-center space-x-1 hover:text-gray-300 ${isActive('/') ? 'font-bold' : ''}`}
          >
            <FiHome className="w-5 h-5" />
            <span>Accueil</span>
          </Link>
          
          {session?.user && (
            <Link 
              href="/client" 
              className={`flex items-center space-x-1 hover:text-gray-300 ${isActive('/client') ? 'font-bold' : ''}`}
            >
              <FiUser className="w-5 h-5" />
              <span>Mon espace</span>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline">
                {session.user.name || session.user.email}
                {session.user.role && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    session.user.role === 'ADMIN' ? 'bg-blue-600' : 
                    session.user.role === 'MODERATOR' ? 'bg-purple-600' :
                    session.user.role === 'OWNER' ? 'bg-yellow-600' : 'bg-gray-600'
                  }`}>
                    {session.user.role}
                  </span>
                )}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm"
                title="Déconnexion"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <>
              <Link 
                href="/connexion" 
                className={`flex items-center space-x-1 hover:text-gray-300 ${isActive('/connexion') ? 'font-bold' : ''}`}
              >
                <FiLogOut className="w-5 h-5" />
                <span>Connexion</span>
              </Link>
              <Link 
                href="/inscription" 
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm"
              >
                <FiUser className="w-4 h-4" />
                <span>Inscription</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
