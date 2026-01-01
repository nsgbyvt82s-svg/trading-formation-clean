'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import AnnouncementCarousel from './AnnouncementCarousel';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromoModal({ isOpen, onClose }: PromoModalProps) {
  // Données des annonces
  const announcements = [
    {
      id: 1,
      title: 'Bienvenue sur DiamondTrade !',
      description: 'Découvrez notre plateforme de formation au trading avec des experts certifiés et des stratégies éprouvées.',
      image: '🚀',
    },
    {
      id: 2,
      title: 'Formation Complète à -50%',
      description: 'Profitez de 50% de réduction sur notre formation complète avec le code DIAMOND50',
      image: '🎁',
    },
    {
      id: 3,
      title: 'Accès Immédiat',
      description: 'Accédez à toutes nos ressources dès maintenant et commencez à trader comme un pro !',
      image: '⚡',
      isLast: true
    }
  ];

  // Empêcher le défilement du corps lorsque la modale est ouverte
  const [isVisible, setIsVisible] = useState(false);

  // Gestion de la touche Échap pour fermer la modale
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (typeof window !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    }
  }

  const handleComplete = () => {
    onClose();
    // Redirection vers la page client après la fermeture de la modale
    window.location.href = '/client';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Contenu de la modale */}
            <motion.div 
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative border border-blue-500/30 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnnouncementCarousel 
                announcements={announcements} 
                onComplete={handleComplete} 
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
