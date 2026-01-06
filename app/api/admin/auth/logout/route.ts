import { supabase } from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST_LOGOUT() {
  try {
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Logout API error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}