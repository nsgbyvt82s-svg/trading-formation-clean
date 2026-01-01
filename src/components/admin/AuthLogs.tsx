'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface AuthLog {
  type: 'LOGIN' | 'SIGNUP' | 'LOGOUT';
  userId: string;
  email: string;
  provider?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

export default function AuthLogs() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/auth-logs');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des logs');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les logs d\'authentification');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchLogs();
      // Rafraîchir les logs toutes les 30 secondes
      const interval = setInterval(fetchLogs, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800';
      case 'SIGNUP':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="p-4 text-red-500">
        Accès non autorisé. Seuls les administrateurs peuvent voir cette page.
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">Chargement des logs d'authentification...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Logs d'authentification</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun log d'authentification trouvé
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventColor(log.type)}`}>
                        {log.type === 'LOGIN' ? 'Connexion' : log.type === 'SIGNUP' ? 'Inscription' : 'Déconnexion'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.email}</div>
                      <div className="text-sm text-gray-500">ID: {log.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.provider || 'Email'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
