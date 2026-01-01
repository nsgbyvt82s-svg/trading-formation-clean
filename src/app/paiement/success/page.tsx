'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiDownload, FiMail, FiUsers, FiMessageSquare } from 'react-icons/fi';

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

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') as PlanId | null;
  const sessionId = searchParams.get('session_id');

  if (!planId || !plans[planId]) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-red-500/30 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Erreur</h2>
          <p className="text-gray-300 mb-6">
            Impossible de trouver les détails de votre achat.
          </p>
          <Link
            href="/paiement"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Retour à la page de paiement
          </Link>
        </div>
      </div>
    );
  }

  const plan = plans[planId];
  const orderNumber = sessionId ? `CMD-${sessionId.slice(0, 8).toUpperCase()}` : 'EN ATTENTE';

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Félicitations !
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Votre accès à la {plan.name} a été activé avec succès.
          </p>
          <div className="mt-4 text-blue-400 font-medium">
            N° de commande: {orderNumber}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Prochaines étapes</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <FiMail className="text-blue-400 text-xl" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">1. Vérifiez votre email</h3>
                <p className="text-gray-400">
                  Nous avons envoyé un email de confirmation avec vos accès à l'adresse associée à votre compte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <FiDownload className="text-blue-400 text-xl" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">2. Téléchargez vos ressources</h3>
                <p className="text-gray-400">
                  Accédez à votre espace membre pour télécharger les ressources de la formation.
                </p>
              </div>
            </div>

            {planId === 'diamond' && (
              <div className="flex items-start gap-4">
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <FiUsers className="text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">3. Rejoignez la communauté</h3>
                  <p className="text-gray-400">
                    Vous avez accès au groupe privé. Une invitation vous a été envoyée par email.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Besoin d'aide ?</h2>
          <p className="text-gray-300 mb-6">
            Notre équipe est là pour vous aider à démarrer. N'hésitez pas à nous contacter pour toute question.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/espace-membre"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center transition-colors"
            >
              Accéder à mon espace membre
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-gray-600 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
