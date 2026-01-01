'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSettings, FiBell, FiLock, FiMoon, FiSun, FiGlobe, FiUser, FiMail, FiSave, FiArrowLeft } from 'react-icons/fi';

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    theme: 'dark',
    language: 'fr',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Charger les paramètres de l'utilisateur
  useEffect(() => {
    if (status === 'authenticated') {
      loadSettings();
    } else if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/parametres');
    }
  }, [status, router]);

  const loadSettings = async () => {
    try {
      // Ici, vous pourriez charger les paramètres depuis votre API
      // const response = await fetch('/api/user/settings');
      // const data = await response.json();
      // if (response.ok) {
      //   setSettings(data.settings);
      // }
      
      // Pour l'instant, on utilise les valeurs par défaut
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès' });
      
      // Mettre à jour le thème si nécessaire
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // Système
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde des paramètres' });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // La redirection est gérée par le useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-blue-400 hover:text-blue-300 mr-4"
          >
            <FiArrowLeft className="mr-2" /> Retour
          </button>
          <h1 className="text-3xl font-bold flex items-center">
            <FiSettings className="mr-3" /> Paramètres
          </h1>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 border border-green-800' : 'bg-red-900/50 border border-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Menu latéral */}
          <div className="md:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <nav className="space-y-1">
                <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-900/30 rounded-lg">
                  <FiUser className="mr-3 text-blue-400" />
                  Compte
                </button>
                <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiBell className="mr-3 text-blue-400" />
                  Notifications
                </button>
                <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiLock className="mr-3 text-blue-400" />
                  Sécurité
                </button>
                <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiMoon className="mr-3 text-blue-400" />
                  Apparence
                </button>
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="md:col-span-2 space-y-8">
            {/* Section Compte */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiUser className="mr-2 text-blue-400" />
                Informations du compte
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom d'utilisateur
                  </label>
                  <div className="mt-1">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-sm">
                        trading-formation.com/
                      </span>
                      <input
                        type="text"
                        name="username"
                        value={session?.user?.username || ''}
                        disabled
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-gray-600 bg-gray-700/50 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Votre nom d'utilisateur public. Contactez le support pour le modifier.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Adresse email
                  </label>
                  <div className="mt-1">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={session?.user?.email || ''}
                        disabled
                        className="bg-gray-700/50 border border-gray-600 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Votre adresse email. Contactez le support pour la modifier.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Notifications */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiBell className="mr-2 text-blue-400" />
                Préférences de notification
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Notifications par email</h3>
                    <p className="text-sm text-gray-400">Recevoir des mises à jour par email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Notifications push</h3>
                    <p className="text-sm text-gray-400">Recevoir des notifications sur cet appareil</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="pushNotifications"
                      checked={settings.pushNotifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Section Apparence */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiMoon className="mr-2 text-blue-400" />
                Apparence
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Thème
                  </label>
                  <select
                    name="theme"
                    value={settings.theme}
                    onChange={handleInputChange}
                    className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="dark">Sombre</option>
                    <option value="light">Clair</option>
                    <option value="system">Système</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Langue
                  </label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleInputChange}
                    className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fuseau horaire
                  </label>
                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleInputChange}
                    className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="Europe/Paris">Paris (GMT+1)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                    <option value="Australia/Sydney">Sydney (GMT+11)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
