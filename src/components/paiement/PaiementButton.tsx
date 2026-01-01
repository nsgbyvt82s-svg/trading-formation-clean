'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FiCreditCard, FiCheck, FiArrowRight, FiZap, FiAward, FiStar, FiLock, FiClock, FiUserCheck, FiBarChart2, FiLoader } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

import type { Variants, Transition } from 'framer-motion';

// Types
type Plan = {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  features: string[];
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
};

// Animation variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    } as Transition
  },
  hover: {
    y: -10,
    scale: 1.02,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 15,
    } as Transition
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    } as Transition
  })
};

const pulse = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: [0.4, 0, 0.2, 1] as any,
    repeatType: 'reverse' as const
  }
};

// Charger les offres depuis l'API
const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const response = await fetch('/api/offers');
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des offres');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};


interface PaiementButtonProps {
  onPaymentClick: () => Promise<void>;
}

export default function PaiementButton({ onPaymentClick }: PaiementButtonProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controls = useAnimation();

  // Charger les offres au montage du composant
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const fetchedPlans = await fetchPlans();
        setPlans(fetchedPlans);
      } catch (err) {
        setError('Impossible de charger les offres. Veuillez réessayer plus tard.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    controls.start('show');
  }, [controls]);

  const handlePayment = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    
    try {
      // Animation de chargement
      await controls.start({
        scale: 0.98,
        transition: { duration: 0.2 }
      });
      
      // Appeler la fonction de paiement du parent
      await onPaymentClick();
      
      // Si onPaymentClick ne redirige pas, on redirige vers la page de confirmation
      router.push(`/paiement/confirmation?plan=${planId}`);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-300">Chargement des offres...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Aucune offre disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={cardItem}
            className={`relative rounded-2xl p-6 border-2 ${
              plan.isPopular 
                ? 'border-blue-500 bg-gradient-to-br from-blue-900/30 to-blue-800/20' 
                : 'border-gray-700/50 bg-gray-800/30'
            } backdrop-blur-sm`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                Le plus populaire
              </div>
            )}
            
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">
                      {plan.price}€
                    </span>
                    {plan.discountPrice && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {plan.discountPrice}€
                      </span>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start"
                      custom={i}
                      variants={fadeInUp}
                      initial="hidden"
                      animate="show"
                    >
                      <FiCheck className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePayment(plan.id)}
                className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30'
                    : 'bg-gray-700/50 text-gray-200 border border-gray-600/50 hover:bg-gray-700/70 hover:border-gray-500/50'
                }`}
                disabled={!plan.isActive || isLoading}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-2" />
                    Traitement...
                  </div>
                ) : plan.isActive ? (
                  `Choisir ${plan.title}`
                ) : (
                  'Bientôt disponible'
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Bannière de confiance */}
      <motion.div 
        className="md:col-span-2 mt-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="inline-flex items-center gap-6 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <FiBarChart2 className="text-blue-400" />
            <span>+500 traders formés</span>
          </div>
          <div className="h-5 w-px bg-gray-700"></div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <FiUserCheck className="text-green-400" />
            <span>97% de satisfaction</span>
          </div>
          <div className="h-5 w-px bg-gray-700"></div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <FiClock className="text-yellow-400" />
            <span>Support 7j/7</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
