import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: tags, error } = await supabaseAdmin
      .from('blog_tags')
      .select('id, name, slug, count')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: tags || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching tags';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
