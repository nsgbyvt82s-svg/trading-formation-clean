import { NextResponse } from 'next/server';
import { getOffer, updateOffer, deleteOffer, readOffers } from '@/lib/offers';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const offer = await getOffer(context.params.id);
    
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer l'ID de manière synchrone
    const offerId = params.id;
    console.log('=== DÉBUT PATCH ===');
    console.log('ID de l\'offre:', offerId);
    
    const data = await request.json();
    console.log('Données reçues:', JSON.stringify(data, null, 2));
    
    // Vérifier si l'offre existe avant la mise à jour
    const existingOffer = await getOffer(offerId);
    console.log('Offre existante:', existingOffer ? 'trouvée' : 'non trouvée');
    
    if (!existingOffer) {
      console.log('Erreur: Offre non trouvée');
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }
    
    console.log('Mise à jour de l\'offre...');
    const updatedOffer = await updateOffer(offerId, data);
    
    if (!updatedOffer) {
      console.log('Erreur lors de la mise à jour de l\'offre');
      return NextResponse.json(
        { error: 'Failed to update offer' },
        { status: 500 }
      );
    }
    
    console.log('Offre mise à jour avec succès:', updatedOffer);
    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteOffer(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
