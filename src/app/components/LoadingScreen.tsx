'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Activer le défilement
    document.body.style.overflow = 'auto';
    
    // Simuler un temps de chargement
    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
    }, 2500); // Durée totale de l'animation (2.5 secondes)
    
    // Marquer comme chargé après un court délai pour l'animation
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(loadTimer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-950 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1],
            }
          }}
        >
          {/* Conteneur principal */}
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
              }
            }}
          >
            {/* Logo avec effet de halo */}
            <div className="relative">
              {/* Halo lumineux */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }}
              />
              
              {/* Logo */}
              <motion.img
                src="/images/Design_sans_titre_19.png"
                alt="DiamondTrade Elite Pro Logo"
                className="relative z-10 h-32 w-auto sm:h-40"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{
                  scale: [0.8, 1.1, 1],
                  rotate: [-10, 5, 0],
                  y: [20, -10, 0],
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              />
            </div>

            {/* Texte avec effet de dégradé animé */}
            <motion.div className="mt-6 overflow-hidden">
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 text-xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.4 }
                }}
              >
                DiamondTrade Elite Pro
              </motion.span>
            </motion.div>
            
            {/* Barre de chargement */}
            <motion.div 
              className="relative w-48 h-1 bg-gray-800 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { delay: 0.3 }
              }}
            >
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ 
                  width: '100%',
                  transition: { 
                    duration: 2,
                    ease: 'easeInOut'
                  }
                }}
              />
            </motion.div>
            
            {/* Texte de chargement */}
            <motion.p 
              className="text-gray-400 text-sm font-medium mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: 0.6,
                  duration: 0.5
                }
              }}
            >
              {isLoaded ? 'Prêt à trader !' : 'Chargement...'}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
