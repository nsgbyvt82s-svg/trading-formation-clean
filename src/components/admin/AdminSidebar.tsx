'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiLogOut, 
  FiUserCheck,
  FiShield,
  FiActivity,
  FiDollarSign,
  FiTag
} from 'react-icons/fi';
import { signOut } from 'next-auth/react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path 
      ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-500' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50';
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Administration
        </p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/dashboard"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/dashboard')} transition-colors`}
            >
              <FiHome className="mr-3 h-5 w-5" />
              Tableau de bord
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/users"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/users')} transition-colors`}
            >
              <FiUsers className="mr-3 h-5 w-5" />
              Utilisateurs
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/offers"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/offers')} transition-colors`}
            >
              <FiTag className="mr-3 h-5 w-5" />
              Gestion des offres
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/verifications"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/verifications')} transition-colors`}
            >
              <FiUserCheck className="mr-3 h-5 w-5" />
              Vérifications
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/roles"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/roles')} transition-colors`}
            >
              <FiShield className="mr-3 h-5 w-5" />
              Rôles
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/activity"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/activity')} transition-colors`}
            >
              <FiActivity className="mr-3 h-5 w-5" />
              Activité
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/subscriptions"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/subscriptions')} transition-colors`}
            >
              <FiDollarSign className="mr-3 h-5 w-5" />
              Abonnements
            </Link>
          </li>
          
          <li className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/settings"
              className={`flex items-center px-4 py-2 rounded-lg ${isActive('/admin/settings')} transition-colors`}
            >
              <FiSettings className="mr-3 h-5 w-5" />
              Paramètres
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <FiLogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
