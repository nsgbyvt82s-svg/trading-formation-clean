'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { 
  FiCheck, FiArrowRight, FiZap, FiAward, FiClock, 
  FiUsers, FiBarChart2, FiTrendingUp, FiDollarSign, 
  FiShield, FiChevronDown, FiUser, FiLogIn, FiMenu, FiX,
  FiStar, FiMessageSquare, FiHeadphones, FiBookOpen, FiDollarSign as FiDollar,
  FiCreditCard, FiLock, FiHelpCircle, FiMail, FiFacebook, FiTwitter, FiInstagram, 
  FiLinkedin, FiRefreshCw, FiSearch, FiChevronUp, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

// Types pour les composants
interface FaqItemProps {
  question: string;
  answer: string;
}

interface RatingProps {
  value: number;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  cta: string;
  popular: boolean;
  badge?: string;
  featured?: boolean;
}

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  date: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Stat {
  value: string;
  label: string;
}

// Composants
const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 pb-4">
      <button
        className="flex justify-between items-center w-full text-left py-4 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <FiChevronDown
          className={`h-5 w-5 text-blue-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-gray-300">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Rating: React.FC<RatingProps> = ({ value }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`h-5 w-5 ${
            star <= value ? 'text-yellow-400 fill-current' : 'text-gray-600'
          }`}
        />
      ))}
    </div>
  );
};

// Données
const pricingPlans: PricingPlan[] = [
  {
    name: 'Débutant',
    price: '49',
    period: '€/mois',
    description: 'Parfait pour les nouveaux traders',
    icon: <FiZap className="h-6 w-6" />,
    features: [
      'Accès aux cours de base',
      'Support par email',
      '1 webinaire par mois',
      'Accès à la communauté'
    ],
    cta: 'Commencer',
    popular: false
  },
  {
    name: 'Intermédiaire',
    price: '99',
    period: '€/mois',
    description: 'Pour les traders qui veulent progresser',
    icon: <FiBarChart2 className="h-6 w-6" />,
    features: [
      'Tout dans Débutant',
      'Analyses de marché hebdomadaires',
      '3 webinaires par mois',
      'Support prioritaire',
      'Accès aux stratégies avancées'
    ],
    cta: 'Essai gratuit',
    popular: true,
    badge: 'POPULAIRE'
  },
  {
    name: 'Expert',
    price: '199',
    period: '€/mois',
    description: 'Pour les traders sérieux',
    icon: <FiTrendingUp className="h-6 w-6" />,
    features: [
      'Tout dans Intermédiaire',
      'Accès illimité à tous les cours',
      'Support 24/7',
      'Sessions de trading en direct',
      'Analyse de portefeuille personnalisée',
      'Accès aux signaux de trading'
    ],
    cta: 'Devenir Expert',
    popular: false,
    featured: true
  }
];

const features: Feature[] = [
  {
    name: 'Formation Complète',
    description: 'Des bases aux stratégies avancées, tout ce dont vous avez besoin pour réussir',
    icon: <FiBookOpen className="h-6 w-6 text-blue-400" />
  },
  {
    name: 'Support Expert',
    description: "Une équipe d'experts à votre écoute pour répondre à toutes vos questions",
    icon: <FiHeadphones className="h-6 w-6 text-blue-400" />
  },
  {
    name: 'Rentabilité',
    description: 'Stratégies éprouvées pour maximiser vos gains en bourse',
    icon: <FiDollar className="h-6 w-6 text-blue-400" />
  },
  {
    name: 'Sécurité',
    description: 'Paiements sécurisés et protection de vos données personnelles',
    icon: <FiShield className="h-6 w-6 text-blue-400" />
  },
  {
    name: 'Communauté Active',
    description: 'Rejoignez une communauté de traders passionnés et échangez vos idées',
    icon: <FiUsers className="h-6 w-6 text-blue-400" />
  },
  {
    name: 'Mises à Jour',
    description: 'Contenu régulièrement mis à jour selon les évolutions des marchés',
    icon: <FiRefreshCw className="h-6 w-6 text-blue-400" />
  }
];

const testimonials: Testimonial[] = [
  {
    name: 'Thomas D.',
    role: 'Trader indépendant',
    content: "Grâce à la formation Pro, j'ai pu multiplier mon capital par 3 en 6 mois. Les stratégies enseignées sont claires et efficaces.",
    rating: 5,
    date: 'Il y a 2 semaines'
  },
  {
    name: 'Sophie M.',
    role: 'Débutante en trading',
    content: "En tant que débutante, j'ai apprécié la pédagogie des formateurs. J'ai pu comprendre les bases rapidement et passer à l'action en confiance.",
    rating: 5,
    date: 'Il y a 1 mois'
  },
  {
    name: 'Marc L.',
    role: 'Investisseur expérimenté',
    content: "La qualité des analyses et le suivi personnalisé m'ont permis d'optimiser ma stratégie de trading. Je recommande vivement !",
    rating: 5,
    date: 'Il y a 3 semaines'
  }
];

const faqs: FAQ[] = [
  {
    question: "Comment fonctionne l'accès aux formations ?",
    answer: "Après votre inscription, vous recevrez un accès immédiat à votre espace membre. Tous les cours sont disponibles en ligne et accessibles 24/7 sur ordinateur, tablette ou smartphone."
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace membre. L'accès aux formations restera actif jusqu'à la fin de la période payée."
  },
  {
    question: "Y a-t-il une garantie satisfait ou remboursé ?",
    answer: "Oui, nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n'êtes pas satisfait de votre formation, contactez-nous pour un remboursement intégral."
  },
  {
    question: "Les formations sont-elles adaptées aux débutants ?",
    answer: "Absolument ! Nos formations sont conçues pour tous les niveaux, y compris les débutants complets. Nous commençons par les bases avant d'aborder des concepts plus avancés."
  },
  {
    question: "Quelle est la fréquence des mises à jour ?",
    answer: "Nous mettons à jour régulièrement le contenu pour refléter les dernières évolutions des marchés. Tous les abonnés bénéficient automatiquement des mises à jour."
  }
];

const stats: Stat[] = [
  { value: '10,000+', label: 'Étudiants formés' },
  { value: '95%', label: 'Taux de satisfaction' },
  { value: '24/7', label: 'Support disponible' },
  { value: '30j', label: 'Garantie satisfait' }
];

// Composant principal
const ClientPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">TradeMaster</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#formations" className="text-gray-300 hover:text-white px-3 py-2">Formations</a>
              <a href="#pourquoi-nous" className="text-gray-300 hover:text-white px-3 py-2">Pourquoi nous ?</a>
              <a href="#temoignages" className="text-gray-300 hover:text-white px-3 py-2">Témoignages</a>
              <a href="#faq" className="text-gray-300 hover:text-white px-3 py-2">FAQ</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">Bonjour, {user?.name || 'Utilisateur'}</span>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Tableau de bord
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/login')}
                    className="text-gray-300 hover:text-white px-3 py-2"
                  >
                    Connexion
                  </button>
                  <button 
                    onClick={() => router.push('/register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                {isMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-800 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a
                  href="#formations"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Formations
                </a>
                <a
                  href="#pourquoi-nous"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pourquoi nous ?
                </a>
                <a
                  href="#temoignages"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Témoignages
                </a>
                <a
                  href="#faq"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </a>
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => {
                        router.push('/login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => {
                        router.push('/register');
                        setIsMenuOpen(false);
                      }}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-center"
                    >
                      S'inscrire
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-blue-800/50 text-blue-200 text-sm font-medium rounded-full">
            🚀 Formation en ligne disponible 24/7
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Devenez un trader rentable
          </h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto text-blue-100">
            Maîtrisez les marchés financiers avec nos formations complètes, accessibles aux débutants comme aux traders expérimentés.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => document.getElementById('formations')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Découvrir les formations
            </button>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-100 hover:bg-blue-900/30 font-medium rounded-lg transition-colors"
            >
              Voir une démo gratuite
            </button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm font-medium text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bandeau promotionnel */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center">
          <p className="text-sm font-medium text-gray-900">
            🎉 Offre spéciale : -30% sur votre première formation avec le code <span className="font-bold">TRADER30</span> • Valable 24h seulement !
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Tarification */}
        <section id="formations" className="py-16 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Nos Formations Complètes
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Choisissez la formule qui correspond à vos objectifs et à votre niveau d'expérience.
            </p>
            
            {/* Toggle Période */}
            <div className="mt-8 inline-flex items-center bg-gray-800 p-1 rounded-full">
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'monthly' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Paiement mensuel
              </button>
              <button
                onClick={() => setActiveTab('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'yearly' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Paiement annuel (-20%)
              </button>
            </div>
            
            <p className="mt-3 text-sm text-blue-300">
              {activeTab === 'yearly' 
                ? 'Économisez 20% avec un engagement annuel !' 
                : 'Flexibilité maximale avec un engagement mensuel'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? 'shadow-2xl transform -translate-y-2 border-2 border-blue-500' 
                    : 'border border-gray-700 hover:border-blue-400 bg-gray-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 transform translate-x-2 -translate-y-2 rotate-12">
                    POPULAIRE
                  </div>
                )}
                
                <div className={`p-8 h-full flex flex-col ${plan.popular ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gray-800'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${
                        plan.popular ? 'bg-blue-600 text-white' : 'bg-blue-900/30 text-blue-400'
                      }`}>
                        {plan.icon}
                      </div>
                      <h3 className={`ml-4 text-2xl font-bold ${
                        plan.popular ? 'text-white' : 'text-white'
                      }`}>
                        {plan.name}
                      </h3>
                    </div>
                    {plan.badge && (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-300'}`}>
                    {plan.description}
                  </p>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-white">
                        {activeTab === 'yearly' 
                          ? Math.round(parseInt(plan.price) * 0.8)
                          : plan.price}
                      </span>
                      <span className="ml-1 text-xl font-medium text-gray-300">
                        {activeTab === 'yearly' ? '€/an' : plan.period}
                      </span>
                      {activeTab === 'yearly' && (
                        <span className="ml-2 text-sm text-green-400">
                          Économisez 20%
                        </span>
                      )}
                    </div>
                    {activeTab === 'yearly' && (
                      <p className="mt-1 text-sm text-gray-400 line-through">
                        {plan.price} {plan.period}
                      </p>
                    )}
                  </div>
                  
                  <button
                    className={`mt-8 w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-colors ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-0.5 transition-transform`}
                  >
                    {plan.cta}
                  </button>
                  
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Ce forfait inclut :
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheck className={`h-5 w-5 flex-shrink-0 ${
                            plan.popular ? 'text-blue-300' : 'text-blue-400'
                          }`} />
                          <span className={`ml-3 ${
                            plan.popular ? 'text-blue-100' : 'text-gray-300'
                          }`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <p className="text-sm text-center text-gray-400">
                      Paiement sécurisé • Support 7j/7 • Garantie 30 jours
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Besoin d'aide pour choisir ?{' '}
              <button className="text-blue-400 hover:text-blue-300 font-medium">
                Contactez notre équipe
              </button>
            </p>
          </div>
        </section>

        {/* Pourquoi nous choisir */}
        <section id="pourquoi-nous" className="py-16 scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Pourquoi choisir nos formations ?
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Une approche pédagogique unique pour des résultats concrets
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-white">{feature.name}</h3>
                <p className="mt-2 text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Bandeau de confiance */}
          <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h3 className="text-2xl font-bold text-white">Prêt à transformer votre trading ?</h3>
                  <p className="mt-2 text-gray-300">Rejoignez plus de 10 000 traders qui ont déjà choisi notre formation.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Commencer maintenant
                  </button>
                  <button className="px-6 py-3 bg-transparent border-2 border-gray-600 hover:border-blue-500 text-white font-medium rounded-lg transition-colors">
                    Voir le programme détaillé
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section id="temoignages" className="py-16 scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ils nous font confiance
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez ce que disent nos étudiants satisfaits
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Rating value={testimonial.rating} />
                  <p className="mt-3 text-gray-300 italic">"{testimonial.content}"</p>
                  <p className="mt-3 text-sm text-gray-400">{testimonial.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
              Voir plus d'avis sur Trustpilot
              <FiArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 scroll-mt-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Questions fréquentes
              </h2>
              <p className="mt-4 text-xl text-gray-300">
                Trouvez les réponses aux questions les plus posées
              </p>
            </div>
            
            <div className="mt-12 space-y-4">
              {faqs.map((faq, index) => (
                <FaqItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-400">
                Vous avez d'autres questions ?{' '}
                <button className="text-blue-400 hover:text-blue-300 font-medium">
                  Contactez notre support
                </button>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16">
          <div className="bg-gradient-to-r from-blue-900 to-[#0f172a] rounded-2xl p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Prêt à transformer votre avenir financier ?
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              Rejoignez notre communauté de traders et commencez votre parcours vers la liberté financière dès aujourd'hui.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => router.push('/inscription')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
              >
                Commencer maintenant
              </button>
              <button
                onClick={() => document.getElementById('formations')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-100 hover:bg-blue-900/30 font-medium rounded-lg transition-colors"
              >
                Voir les formations
              </button>
            </div>
            <p className="mt-4 text-sm text-blue-200">
              Essai gratuit de 7 jours • Paiement sécurisé • Support 24/7
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 pt-12 pb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-medium mb-4">Formations</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Débutant</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Intermédiaire</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Avancé</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Formations certifiantes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Ressources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Guides gratuits</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Webinaires</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Entreprise</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">À propos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Équipe</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Carrières</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Mentions légales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">CGU</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Conditions de remboursement</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <FiFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiLinkedin className="h-6 w-6" />
              </a>
            </div>
            <p className="mt-4 md:mt-0 text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} TradeMaster. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientPage;
