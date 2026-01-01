'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiArrowRight, FiCheck, FiArrowLeft } from 'react-icons/fi';

interface Announcement {
  id: number;
  title: string;
  description: string;
  image: string;
  isLast?: boolean;
}

interface AnnouncementCarouselProps {
  announcements: Announcement[];
  onComplete: () => void;
}

export default function AnnouncementCarousel({ announcements, onComplete }: AnnouncementCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const nextSlide = () => {
    setDirection('right');
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    setDirection('left');
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentAnnouncement = announcements[currentIndex];
  const isLast = currentIndex === announcements.length - 1;

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction === 'right' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'right' ? -100 : 100 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          {/* Contenu de l'annonce */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-900/30 to-blue-600/30 flex items-center justify-center">
                <div className="text-4xl">
                  {currentAnnouncement.image}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {currentAnnouncement.title}
              </h3>
              <p className="text-gray-300 mb-8">
                {currentAnnouncement.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 border-t border-gray-700">
            {/* Points indicateurs */}
            <div className="flex items-center space-x-2">
              {announcements.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-4">
              {/* Bouton Précédent */}
              {currentIndex > 0 && (
                <button
                  onClick={prevSlide}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  <FiArrowLeft className="text-lg" />
                  Précédent
                </button>
              )}
              
              {/* Bouton Suivant/OK */}
              {!isLast ? (
                <button
                  onClick={nextSlide}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                >
                  Suivant
                  <FiArrowRight className="text-lg" />
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                >
                  OK, j'ai compris
                  <FiCheck className="text-lg" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
