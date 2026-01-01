'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.2, 0.8],
          opacity: 1,
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.5, 1]
        }}
        className="relative w-32 h-32"
      >
        <Image
          src="/images/Design_sans_titre_19.png"
          alt="TradeElite Pro Logo"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
      
      <motion.div 
        className="mt-8 text-white text-xl font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: [0.5, 1, 0.5],
          y: [10, 0, -10],
        }}
        transition={{ 
          duration: 2.2,
          repeat: Infinity,
          repeatType: 'loop',
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.5, 1]
        }}
      >
        Chargement...
      </motion.div>
    </div>
  );
};

export default Loading;
