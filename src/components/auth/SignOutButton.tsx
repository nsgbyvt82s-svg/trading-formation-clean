'use client';

import { signOut } from 'next-auth/react';
import { FiLogOut } from 'react-icons/fi';

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className = '' }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/paiement' })}
      className={`px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${className}`}
    >
      <span className="flex items-center">
        <FiLogOut className="mr-2" />
        Déconnexion
      </span>
    </button>
  );
}
