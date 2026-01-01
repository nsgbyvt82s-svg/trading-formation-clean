import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/login?error=AuthenticationError', new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000')));
}

export const dynamic = 'force-dynamic';
