'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(session?.user);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    setIsAuthenticated(!!session?.user);
    setUser(session?.user);
  }, [session, status]);

  return {
    user,
    isAuthenticated,
    isLoading,
    update,
  };
}
