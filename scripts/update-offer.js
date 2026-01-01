const fs = require('fs');
const path = require('path');

// Chemin vers le fichier des offres
const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');

// Fonction pour lire les offres
function readOffers() {
  const data = fs.readFileSync(OFFERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Fonction pour écrire les offres
function writeOffers(offers) {
  fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2), 'utf-8');
}

// ID de l'offre à mettre à jour
const offerId = '87b09c67-7034-4f21-9418-0872cfbcca31';

// Nouvelles données pour l'offre
const updatedData = {
  title: "Formation Gold Mise à jour",
  description: "Description mise à jour avec de nouvelles fonctionnalités",
  price: 99.99,
  discountPrice: 79.99,
  isActive: true,
  startDate: new Date('2026-01-15').toISOString(),
  endDate: new Date('2026-12-31').toISOString(),
  features: [
    "Accès complet à la formation",
    "Support prioritaire",
    "Mises à jour gratuites",
    "Ressources exclusives"
  ],
  isPopular: true
};

// Lire les offres existantes
const offers = readOffers();

// Trouver l'index de l'offre à mettre à jour
const offerIndex = offers.findIndex(offer => offer.id === offerId);

if (offerIndex === -1) {
  console.error('Erreur: Offre non trouvée');
  process.exit(1);
}

// Mettre à jour l'offre
const updatedOffer = {
  ...offers[offerIndex],
  ...updatedData,
  updatedAt: new Date().toISOString()
};

offers[offerIndex] = updatedOffer;

// Écrire les modifications
writeOffers(offers);

console.log('Offre mise à jour avec succès !');
console.log('Nouveaux détails:');
console.log(`- Titre: ${updatedOffer.title}`);
console.log(`- Prix: ${updatedOffer.price}€ (${updatedOffer.discountPrice}€ en promotion)`);
console.log(`- Statut: ${updatedOffer.isActive ? 'Active' : 'Inactive'}`);
console.log(`- Période: Du ${new Date(updatedOffer.startDate).toLocaleDateString()} au ${new Date(updatedOffer.endDate).toLocaleDateString()}`);
