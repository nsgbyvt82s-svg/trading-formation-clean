'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const plans = {
  gold: {
    name: 'Formation Gold',
    price: 80,
    features: [
      'Accès à la formation complète',
      'Support par email',
      'Accès à vie',
      'Ressources téléchargeables'
    ]
  },
  diamond: {
    name: 'Formation Diamond',
    price: 150,
    features: [
      'Tout le contenu Gold',
      'Accès au groupe privé',
      'Sessions de coaching en direct',
      'Analyse personnalisée',
      'Accès prioritaire au support'
    ]
  }
} as const;

type PlanId = keyof typeof plans;

export default function ConfirmationPaiement() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') as PlanId | null;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId || !plans[planId]) {
      setStatus('error');
      setError('Plan de formation invalide');
      return;
    }

    // Simulation de traitement du paiement
    const processPayment = async () => {
      try {
        // Ici, vous intégrerez avec votre solution de paiement (Stripe, etc.)
        // Ceci est une simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simuler une erreur aléatoire (à supprimer en production)
        if (Math.random() < 0.1) { // 10% de chance d'erreur pour les tests
          throw new Error('Échec du traitement du paiement');
        }
        
        setStatus('success');
      } catch (err) {
        console.error('Erreur de paiement:', err);
        setStatus('error');
        setError('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.');
      }
    };

    processPayment();
  }, [planId]);

  if (!planId || !plans[planId]) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-red-500/30 max-w-md w-full text-center">
          <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Plan non trouvé</h2>
          <p className="text-gray-300 mb-6">
            Le plan sélectionné n'existe pas ou n'est plus disponible.
          </p>
          <a
            href="/paiement"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Retour à la sélection
          </a>
        </div>
      </div>
    );
  }

  const plan = plans[planId];

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          {/* En-tête */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Finalisez votre inscription
            </h1>
            <p className="text-gray-400">
              Vous êtes sur le point de vous inscrire à la {plan.name} pour {plan.price}€
            </p>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {status === 'loading' && (
              <div className="text-center py-12">
                <FiLoader className="animate-spin text-blue-500 text-5xl mx-auto mb-6" />
                <p className="text-gray-300">Traitement de votre paiement...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ne fermez pas cette page pendant le traitement.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Paiement réussi !</h2>
                <p className="text-gray-300 mb-8">
                  Merci pour votre achat ! Votre accès à la {plan.name} a été activé.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 text-left mb-8">
                  <h3 className="font-medium text-white mb-2">Récapitulatif de votre achat :</h3>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Formation :</span> {plan.name}<br />
                    <span className="text-gray-400">Montant :</span> {plan.price}€ TTC<br />
                    <span className="text-gray-400">Accès :</span> Immédiat
                  </p>
                </div>
                <a
                  href="/espace-membre"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Accéder à ma formation
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <FiXCircle className="text-red-500 text-6xl mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Erreur de paiement</h2>
                <p className="text-gray-300 mb-8">
                  {error || 'Une erreur est survenue lors du traitement de votre paiement.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <a
                    href="/paiement"
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Réessayer
                  </a>
                  <a
                    href="/contact"
                    className="px-6 py-3 border border-gray-600 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Contacter le support
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="p-4 bg-gray-900/50 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              Paiement sécurisé - 256-bit SSL - Vos données sont protégées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
