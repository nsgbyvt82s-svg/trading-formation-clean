const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const OFFERS_FILE = path.join(__dirname, '..', 'data', 'offers.json');
const PLANS = [
  {
    id: 'gold',
    name: 'Formation Gold',
    price: 80,
    features: [
      'Accès complet à la formation',
      'Support prioritaire par email',
      'Accès à vie aux mises à jour',
      'Ressources téléchargeables',
      'Accès à la communauté privée',
      'Certification incluse'
    ]
  },
  {
    id: 'diamond',
    name: 'Formation Diamond',
    price: 150,
    popular: true,
    features: [
      'Tous les avantages Gold',
      'Accès au groupe VIP privé',
      '4 sessions de coaching en direct/mois',
      'Analyse personnalisée de votre trading',
      'Accès prioritaire 24/7 au support',
      'Accès anticipé aux nouvelles fonctionnalités'
    ]
  }
];

// Convertir les plans en format de base de données
const offers = PLANS.map(plan => ({
  id: uuidv4(),
  title: plan.name,
  description: plan.features.join('\n'),
  price: plan.price,
  isActive: true,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an plus tard
  features: plan.features,
  isPopular: plan.popular || false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

// Écrire dans le fichier
fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2));
console.log(`✅ ${offers.length} offres ont été migrées avec succès !`);
console.log('Fichier des offres mis à jour :', OFFERS_FILE);
