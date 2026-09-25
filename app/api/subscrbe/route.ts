import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = new URL('/api/subscribe', request.url);
  return NextResponse.redirect(url, 307);
}
