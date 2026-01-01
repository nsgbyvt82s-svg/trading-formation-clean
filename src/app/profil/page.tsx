'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiEdit2, FiSave, FiLogOut, FiArrowLeft, FiSettings } from 'react-icons/fi';

interface UserData {
  username: string;
  email: string;
  role: string;
  name?: string;
  image?: string;
  createdAt?: string;
  lastLogin?: string;
  id?: string;
  status?: string;
}

export default function ProfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Mettre à jour les données utilisateur quand la session change
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profil');
    } else if (status === 'authenticated' && session?.user) {
      // Utiliser directement les données de la session
      const userData = {
        username: session.user.username || session.user.name || 'Utilisateur',
        email: session.user.email || 'Non défini',
        role: session.user.role || 'USER',
        ...(session.user as any).createdAt && { createdAt: (session.user as any).createdAt },
        lastLogin: new Date().toISOString()
      };
      
      setUserData(userData);
      setFormData({
        username: userData.username,
        email: userData.email
      });
      setIsLoading(false);
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      // Mettre à jour les données de session localement
      const updatedUser = {
        ...session?.user,
        username: formData.username,
        email: formData.email,
        name: formData.username // Mettre à jour le nom avec le nom d'utilisateur
      };

      // Mettre à jour la session
      await update({
        ...session,
        user: updatedUser
      });

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      setIsEditing(false);
      
      // Forcer un rechargement des données utilisateur
      window.location.reload();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
      console.error('Erreur:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }

    try {
      // Désactiver temporairement la fonctionnalité de changement de mot de passe
      // car elle nécessite une API fonctionnelle
      setMessage({ 
        type: 'error', 
        text: 'La fonctionnalité de changement de mot de passe est temporairement désactivée' 
      });
      
      // Réinitialiser les champs de mot de passe
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
      console.error('Erreur:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
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
          <h1 className="text-3xl font-bold">Mon Profil</h1>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 border border-green-800' : 'bg-red-900/50 border border-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section de profil */}
          <div className="md:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Informations du compte</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-blue-400 hover:text-blue-300"
                >
                  <FiEdit2 className="mr-2" /> Modifier
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Réinitialiser le formulaire avec les données actuelles
                    if (userData) {
                      setFormData({
                        username: userData.username,
                        email: userData.email
                      });
                    }
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Nom d'utilisateur
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                      <FiSave className="mr-2" /> Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                    <FiUser className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Nom d'utilisateur</p>
                    <p className="font-medium">{userData?.username || 'Non défini'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-4 text-blue-400">
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Adresse email</p>
                    <p className="font-medium">{userData?.email || 'Non défini'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-4 text-blue-400">
                    <FiUser className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Rôle</p>
                    <p className="font-medium capitalize">
                      {userData?.role?.toLowerCase() || 'utilisateur'}
                    </p>
                  </div>
                </div>
                {userData?.createdAt && (
                  <div className="pt-2 text-sm text-gray-400">
                    Membre depuis le {new Date(userData.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section de sécurité */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4">Sécurité</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                >
                  <FiSave className="mr-2" /> Changer le mot de passe
                </button>
              </form>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4">Déconnexion</h2>
              <p className="text-sm text-gray-400 mb-4">
                Vous pouvez vous déconnecter de votre compte en cliquant sur le bouton ci-dessous.
              </p>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <FiLogOut className="mr-2" /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
