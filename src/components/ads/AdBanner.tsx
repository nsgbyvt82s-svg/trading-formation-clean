'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiTag, FiGift, FiZap } from 'react-icons/fi';

interface AdBannerProps {
  ads: Array<{
    id: string;
    title: string;
    description: string;
    type: 'discount' | 'new' | 'promo';
    code?: string;
    link?: string;
    image?: string;
  }>;
  autoRotate?: boolean;
  rotationInterval?: number;
}

export default function AdBanner({ 
  ads = [], 
  autoRotate = true, 
  rotationInterval = 5000 
}: AdBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Rotation automatique des publicités
  useEffect(() => {
    if (!autoRotate || ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [ads.length, autoRotate, rotationInterval]);

  const currentAd = ads[currentAdIndex];
  if (!currentAd || !isVisible) return null;

  const getIcon = () => {
    switch (currentAd.type) {
      case 'discount':
        return <FiTag className="text-yellow-400" />;
      case 'new':
        return <FiZap className="text-blue-400" />;
      case 'promo':
      default:
        return <FiGift className="text-pink-400" />;
    }
  };

  const getTypeColor = () => {
    switch (currentAd.type) {
      case 'discount':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'new':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'promo':
      default:
        return 'bg-pink-500/10 border-pink-500/30';
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border p-4 mb-6 ${getTypeColor()}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Bouton de fermeture */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Fermer la bannière"
      >
        <FiX />
      </button>

      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4 text-2xl">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{currentAd.title}</h3>
          <p className="text-sm text-gray-300">{currentAd.description}</p>
          {currentAd.code && (
            <div className="mt-2">
              <span className="inline-block bg-black/20 px-2 py-1 rounded text-xs font-mono">
                {currentAd.code}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contrôles de navigation */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full ${currentAdIndex === index ? 'bg-white' : 'bg-white/30'}`}
              aria-label={`Aller à la publicité ${index + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
