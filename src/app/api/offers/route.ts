import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'offers.json');

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const offers = JSON.parse(data);
    
    // Filtrer uniquement les offres actives
    const activeOffers = offers.filter((offer: any) => offer.isActive !== false);
    
    return NextResponse.json(activeOffers, { headers: corsHeaders });
  } catch (error) {
    console.error('Error reading offers:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les offres' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Gestion des requêtes OPTIONS pour le CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}
