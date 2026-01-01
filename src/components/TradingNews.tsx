'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const newsItems = [
  {
    id: 1,
    title: 'Bitcoin atteint un nouveau plus haut',
    change: '+3.5%',
    isPositive: true,
    time: 'Il y a 5 min'
  },
  {
    id: 2,
    title: 'Nouvelle réglementation sur les cryptomonnaies',
    change: 'Nouveau',
    isPositive: null,
    time: 'Il y a 1h'
  },
  {
    id: 3,
    title: 'Chute des marchés asiatiques',
    change: '-1.2%',
    isPositive: false,
    time: 'Il y a 2h'
  },
  {
    id: 4,
    title: 'Le pétrole en hausse après accord OPEC+',
    change: '+2.1%',
    isPositive: true,
    time: 'Il y a 3h'
  },
  {
    id: 5,
    title: 'Nouvelle stratégie de trading IA',
    change: 'Trending',
    isPositive: null,
    time: 'Aujourd\'hui'
  }
];

export default function TradingNews({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // Afficher pendant 5 secondes

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-gray-900 text-white z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Actualités du Trading
          </motion.h2>
          <motion.p 
            className="text-blue-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Dernières mises à jour des marchés
          </motion.p>
        </div>

        <div className="space-y-4">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-colors"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.time}</p>
                </div>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.isPositive === true 
                      ? 'bg-green-900/30 text-green-400' 
                      : item.isPositive === false 
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-blue-900/30 text-blue-400'
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-8 text-center text-blue-300 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Chargement de votre espace de trading...
        </motion.div>
      </div>
    </motion.div>
  );
}
