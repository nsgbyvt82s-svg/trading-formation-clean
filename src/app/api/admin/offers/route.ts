import { NextResponse } from 'next/server';
import { createOffer, getAllOffers, Offer } from '@/lib/offers';

export async function GET() {
  try {
    const offers = await getAllOffers();
    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    
    // Validation des données
    if (!data.title || !data.description || !data.price || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newOffer = await createOffer({
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
