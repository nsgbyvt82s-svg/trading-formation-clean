'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { FiTrendingUp, FiUser, FiClock, FiAward, FiArrowRight, FiCheck, FiStar, FiBarChart2, FiDollarSign, FiShield } from 'react-icons/fi';
import { Header } from '@/components/layout/Header';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { useInView } from 'react-intersection-observer';
import Loading from '@/components/ui/Loading';

interface Course {
  title: string;
  description: string;
  icon: string;
  color: string;
}

// Les types utilisateur sont déjà définis dans next-auth

interface Advantage {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Vérifier l'authentification uniquement côté client
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const session = await getServerSession();
        if (isMounted) {
          setSession(session);
          setIsAuthenticated(!!session?.user);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        if (isMounted) {
          setSession(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
          setIsLoading(false);
        }
      }
    };
    
    // Vérifier si nous sommes côté navigateur
    if (typeof window !== 'undefined') {
      checkAuth();
    } else {
      setIsLoading(false);
      setAuthChecked(true);
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  const user = session?.user;

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* HEADER */}
      <header className="fixed w-full z-50 bg-gray-950/80 backdrop-blur-md">
        <Header />
      </header>

      {/* MAIN */}
      <main className="pt-24 flex-grow">
        {/* HERO SECTION */}
        <motion.section 
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-gray-950"></div>
          </div>
          
          <motion.div 
            className="container mx-auto px-4 z-10 text-center"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div 
              className="inline-block mb-6 px-6 py-2 bg-blue-900/30 border border-blue-700/50 rounded-full text-blue-300 text-sm font-medium backdrop-blur-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              🚀 Formation Trading Professionnel
            </motion.div>
            
            <div className="overflow-hidden">
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {isAuthenticated && user?.name 
                  ? `Bonjour, ${user.name}` 
                  : 'Maîtriser le trading avec 1compris'}
              </motion.h1>
            </div>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Maîtrisez les marchés financiers avec notre formation complète en trading. 
              Développez des stratégies gagnantes et atteignez la liberté financière.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link 
                href="/paiement" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Commencer maintenant <FiArrowRight />
              </Link>
              <Link 
                href="#formations" 
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Découvrir les formations
              </Link>
            </motion.div>
            
            <motion.div 
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate={controls}
              ref={ref}
            >
              {[
                { value: '10,000+', label: 'Étudiants formés' },
                { value: '98%', label: 'Satisfaction' },
                { value: '24/7', label: 'Support' },
                { value: '100%', label: 'Pratique' }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center"
                  variants={fadeInUp}
                  whileHover={{ y: -5, scale: 1.03, boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* AVANTAGES SECTION */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('/images/grid.svg')]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Maîtriser le trading avec <span className="text-blue-400">1compris</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Découvrez ce qui fait de nous le partenaire idéal pour votre réussite en trading
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <FiTrendingUp className="text-4xl" />,
                  title: "Résultats Concrets",
                  description: "Stratégies éprouvées avec des résultats vérifiables et des performances mesurables"
                },
                {
                  icon: <FiUser className="text-4xl" />,
                  title: "Mentorat Personnalisé",
                  description: "Accompagnement sur mesure par des traders professionnels expérimentés"
                },
                {
                  icon: <FiBarChart2 className="text-4xl" />,
                  title: "Analyse Technique",
                  description: "Maîtrisez les indicateurs techniques et les graphiques avancés"
                },
                {
                  icon: <FiShield className="text-4xl" />,
                  title: "Gestion des Risques",
                  description: "Apprenez à protéger votre capital et à maximiser vos gains"
                }
              ].map((advantage, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300 h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -10, boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.3)' }}
                >
                  <div className="w-16 h-16 rounded-xl bg-blue-900/30 flex items-center justify-center mb-6 mx-auto">
                    {advantage.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{advantage.title}</h3>
                  <p className="text-gray-400">{advantage.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FORMATIONS SECTION */}
        <section id="formations" className="py-20 bg-gray-900 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Nos Formations <span className="text-blue-400">Élite</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Découvrez nos programmes conçus pour vous amener du niveau débutant à expert
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  title: "Trading Débutant",
                  description: "Maîtrisez les fondamentaux du trading et développez une stratégie solide",
                  icon: "📊",
                  features: [
                    "Bases du marché financier",
                    "Ouvrir et gérer un compte",
                    "Analyse des tendances",
                    "Ressources pratiques"
                  ]
                },
                {
                  title: "Analyse Technique",
                  description: "Maîtrisez les graphiques et les indicateurs techniques avancés",
                  icon: "📈",
                  features: [
                    "Chandeliers japonais",
                    "Indicateurs techniques",
                    "Niveaux de support/résistance",
                    "Stratégies de trading"
                  ]
                },
                {
                  title: "Gestion du Risque",
                  description: "Protégez votre capital et maximisez vos performances",
                  icon: "🛡️",
                  features: [
                    "Gestion de capital",
                    "Ratio risque/rendement",
                    "Stratégies de gestion",
                    "Études de cas"
                  ]
                }
              ].map((course, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
                  whileHover={{ y: -10, boxShadow: '0 20px 40px -10px rgba(30, 58, 138, 0.3)' }}
                >
                  <div className="p-8">
                    <div className="text-5xl mb-6">{course.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-3">{course.title}</h3>
                    <p className="text-gray-300 mb-6">{course.description}</p>
                    <ul className="space-y-3 mb-8">
                      {course.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-gray-300">
                          <FiCheck className="text-green-400 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-8 pb-8">
                    <Link 
                      href="/auth/register"
                      className="w-full block text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
                    >
                      Commencer la formation
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="py-20 bg-gray-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('/images/grid.svg')]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ce que disent nos <span className="text-blue-400">étudiants</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Découvrez les témoignages de nos étudiants qui ont transformé leur vie grâce au trading
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Thomas D.",
                  role: "Trader indépendant",
                  content: "Grâce à TradeElite Pro, j'ai pu quitter mon emploi pour me consacrer entièrement au trading. Les formations sont claires et les stratégies vraiment efficaces.",
                  rating: 5
                },
                {
                  name: "Sophie M.",
                  role: "Investisseuse débutante",
                  content: "En tant que débutante, j'appréhendais beaucoup. Mais l'approche pédagogique m'a permis de progresser rapidement et en confiance.",
                  rating: 5
                },
                {
                  name: "Alexandre P.",
                  role: "Trader expérimenté",
                  content: "Même avec de l'expérience, j'ai appris énormément. Les techniques avancées m'ont permis d'optimiser mes performances.",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'} w-5 h-5`} 
                        fill={i < testimonial.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center text-xl font-bold text-blue-300 mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-r from-blue-900/30 to-blue-800/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/images/grid.svg')]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Prêt à transformer votre avenir financier ?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Rejoignez des milliers d'étudiants qui ont déjà commencé leur voyage vers la liberté financière.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/auth/register"
                  className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-100 transition-colors duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  Commencer maintenant <FiArrowRight />
                </Link>
                <Link 
                  href="#formations"
                  className="px-8 py-4 bg-transparent border-2 border-white/20 text-white font-medium rounded-xl hover:bg-white/10 transition-colors duration-300"
                >
                  En savoir plus
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-950 border-t border-gray-800 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  TradeElite Pro
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                Formation professionnelle en trading pour les investisseurs sérieux.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-colors duration-300"
                    aria-label={social}
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Liens rapides</h3>
              <ul className="space-y-3">
                {['Accueil', 'Formations', 'À propos', 'Contact'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Ressources</h3>
              <ul className="space-y-3">
                {['Blog', 'Guides', 'FAQ', 'Support'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contact@tradeelitepro.com
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2025 TradeElite Pro. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
              {['Mentions légales', 'Confidentialité', 'CGU', 'Cookies'].map((item, i) => (
                <a key={i} href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
