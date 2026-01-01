import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_FILE = path.join(process.cwd(), 'data', 'offers.json');

// Assurez-vous que le répertoire data existe
const ensureDataDirectory = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
};

// Lire les offres depuis le fichier
export const readOffers = (): Offer[] => {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading offers:', error);
    return [];
  }
};

// Écrire les offres dans le fichier
const writeOffers = (offers: Offer[]) => {
  console.log('=== DÉBUT writeOffers ===');
  console.log('Chemin du fichier:', DATA_FILE);
  console.log('Nombre d\'offres à écrire:', offers.length);
  
  ensureDataDirectory();
  
  try {
    const data = JSON.stringify(offers, null, 2);
    console.log('Données à écrire (premiers 200 caractères):', data.substring(0, 200));
    
    fs.writeFileSync(DATA_FILE, data, 'utf-8');
    
    // Vérifier que le fichier a bien été écrit
    const stats = fs.statSync(DATA_FILE);
    console.log('Taille du fichier après écriture:', stats.size, 'octets');
    
    // Lire le fichier pour vérification
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    console.log('Contenu du fichier après écriture (premiers 200 caractères):', fileContent.substring(0, 200));
    
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de l\'écriture du fichier:', error);
    
    if (error instanceof Error) {
      const nodeError = error as NodeJS.ErrnoException;
      console.error('Détails de l\'erreur:', {
        code: nodeError.code,
        message: nodeError.message,
        path: nodeError.path,
        syscall: nodeError.syscall,
        errno: nodeError.errno
      });
    } else {
      console.error('Erreur inconnue:', error);
    }
    
    throw error; // Propager l'erreur pour qu'elle soit gérée par l'appelant
  }
};

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  features: string[];
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export const createOffer = async (data: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> => {
  const offers = readOffers();
  const newOffer: Offer = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  offers.push(newOffer);
  writeOffers(offers);
  return newOffer;
};

export const updateOffer = async (id: string, data: Partial<Omit<Offer, 'id' | 'createdAt'>>): Promise<Offer | null> => {
  console.log('=== DÉBUT updateOffer ===');
  console.log('ID à mettre à jour:', id);
  console.log('Données de mise à jour:', JSON.stringify(data, null, 2));
  
  const offers = readOffers();
  console.log('Nombre d\'offres chargées:', offers.length);
  
  const index = offers.findIndex(offer => {
    console.log(`Vérification offre ID: ${offer.id} (recherche: ${id})`);
    return offer.id === id;
  });
  
  console.log('Index trouvé:', index);
  
  if (index === -1) {
    console.log('Aucune offre trouvée avec cet ID');
    return null;
  }
  
  const existingOffer = offers[index];
  console.log('Anciennes données:', JSON.stringify(existingOffer, null, 2));
  
  // Préserver les champs existants non inclus dans la mise à jour
  const updatedOffer: Offer = {
    ...existingOffer,
    ...data,
    // S'assurer que les champs obligatoires sont toujours définis
    title: data.title !== undefined ? data.title : existingOffer.title,
    description: data.description !== undefined ? data.description : existingOffer.description,
    price: data.price !== undefined ? data.price : existingOffer.price,
    isActive: data.isActive !== undefined ? data.isActive : existingOffer.isActive,
    startDate: data.startDate || existingOffer.startDate,
    endDate: data.endDate || existingOffer.endDate,
    // Préserver les fonctionnalités existantes si non fournies
    features: data.features !== undefined ? data.features : existingOffer.features,
    isPopular: data.isPopular !== undefined ? data.isPopular : existingOffer.isPopular,
    // Mettre à jour la date de mise à jour
    updatedAt: new Date().toISOString(),
  };
  
  console.log('Nouvelles données:', JSON.stringify(updatedOffer, null, 2));
  
  // Mettre à jour l'offre dans le tableau
  offers[index] = updatedOffer;
  
  try {
    // Écrire les modifications dans le fichier
    writeOffers(offers);
    console.log('Offre mise à jour avec succès');
    return updatedOffer;
  } catch (error) {
    console.error('Erreur lors de l\'écriture du fichier:', error);
    return null;
  }
};

export const deleteOffer = async (id: string): Promise<boolean> => {
  const offers = readOffers();
  const newOffers = offers.filter(offer => offer.id !== id);
  
  if (newOffers.length === offers.length) return false;
  
  writeOffers(newOffers);
  return true;
};

export const getOffer = async (id: string): Promise<Offer | null> => {
  const offers = readOffers();
  return offers.find(offer => offer.id === id) || null;
};

export const getAllOffers = async (filters: { isActive?: boolean } = {}): Promise<Offer[]> => {
  let offers = readOffers();
  
  if (filters.isActive !== undefined) {
    offers = offers.filter(offer => offer.isActive === filters.isActive);
  }
  
  return offers.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
