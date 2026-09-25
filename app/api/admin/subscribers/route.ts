import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const subscribedOnly = searchParams.get('subscribed') !== 'false';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (subscribedOnly) {
      query = query.eq('subscribed', true);
    }

    const { data: subscribers, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        subscribers: subscribers || [],
        total: count || 0,
        page,
        limit,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching subscribers';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
