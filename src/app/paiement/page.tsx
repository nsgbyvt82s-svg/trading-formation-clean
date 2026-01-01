'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import PaiementButton from '@/components/paiement/PaiementButton';
import { FiLock, FiZap, FiCheckCircle, FiClock, FiLoader, FiUserCheck, FiShield } from 'react-icons/fi';

import type { Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const FeatureItem = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <motion.div 
    variants={fadeIn}
    className="flex items-center gap-3 text-gray-300 group"
  >
    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-700/30 to-blue-900/30">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <span className="group-hover:text-white transition-colors">{text}</span>
  </motion.div>
);

export default function PagePaiement() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Debug: Afficher les infos de session
  useEffect(() => {
    if (session?.user) {
      console.log('Session user:', session.user);
      console.log('User email:', session.user.email);
      console.log('User role:', session.user.role);
      console.log('Should show admin button:', 
        session.user.email === 'vexx@diamondtrade.com' || 
        session.user.email === '1compris@diamondtrade.com'
      );
    }
  }, [session]);

  // Gestion de l'état de chargement initial
  useEffect(() => {
    // Nettoyer l'URL si nécessaire
    const params = new URLSearchParams(window.location.search);
    if (params.has('callbackUrl')) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
    setIsLoading(false);
  }, []);

  // Gestion du clic sur le bouton de paiement
  const handlePaymentClick = async () => {
    if (status !== 'authenticated') {
      // Rediriger vers la page de connexion avec un callback vers la page de paiement
      const callbackUrl = encodeURIComponent('/paiement');
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    
    // Logique de paiement ici
    // Exemple : router.push('/checkout');
  };

  // État de chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-300">Chargement de la page de paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-12 md:py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <motion.div variants={fadeIn} className="mb-2">
            <span className="inline-block bg-gradient-to-r from-blue-700 to-blue-800 text-white text-sm font-medium px-4 py-1 rounded-full mb-4">
              Formations Premium
            </span>
          </motion.div>
          
          {/* Afficher un message si l'utilisateur n'est pas connecté */}
          {status !== 'authenticated' && (
            <motion.div 
              variants={fadeIn}
              className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4 mb-8 text-left"
            >
              <h3 className="text-blue-200 font-medium mb-2">
                <FiUserCheck className="inline-block mr-2" />
                Pas encore connecté
              </h3>
              <p className="text-blue-100 text-sm">
                Vous pouvez consulter nos offres ci-dessous. Une connexion sera nécessaire uniquement au moment du paiement.
              </p>
            </motion.div>
          )}
          
          <motion.h1 
            variants={fadeIn}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Maîtrisez le Trading avec <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">1Compris</span>
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Rejoignez notre communauté de traders qui ont déjà transformé leur approche du marché avec nos formations complètes et accessibles.
          </motion.p>
          
          {/* Fonctionnalités clés */}
          <motion.div 
            variants={fadeIn}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
          >
            <FeatureItem icon={FiZap} text="Accès immédiat après paiement" />
            <FeatureItem icon={FiCheckCircle} text="Garantie satisfait ou remboursé 30j" />
            <FeatureItem icon={FiClock} text="Support réactif 7j/7" />
          </motion.div>
        </motion.div>
        
        {/* Section des offres */}
        <motion.div 
          variants={fadeIn}
          className="relative z-10"
        >
          <div className="mt-16 space-y-4">
            <PaiementButton onPaymentClick={handlePaymentClick} />
            {isLoading ? null : (session?.user?.email === 'vexx@diamondtrade.com' || session?.user?.email === '1compris@diamondtrade.com') && (
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-indigo-300 bg-indigo-900/20 border border-indigo-800/50 rounded-lg hover:bg-indigo-900/30 transition-colors"
              >
                <FiShield className="w-4 h-4" />
                Accéder au panneau d'administration
              </button>
            )}
          </div>
        </motion.div>
        
        {/* Sécurité et garanties */}
        <motion.div 
          variants={fadeIn}
          className="mt-16 pt-8 border-t border-gray-800/50 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gray-800/30 backdrop-blur-sm rounded-full">
            <FiLock className="text-blue-400" />
            <span className="text-sm text-gray-300">Paiement 100% sécurisé avec Stripe</span>
            <span className="text-gray-600 mx-1">•</span>
            <span className="text-sm text-gray-400">256-bit SSL</span>
          </div>
        </motion.div>
      </div>
      
      {/* Effet de fond subtil */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-blue-800/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-30"></div>
      </div>
    </motion.div>
  );
}
