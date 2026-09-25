import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const typeParam = searchParams.get('type');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: { results: [] },
      });
    }

    let req = supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, excerpt, type, published_at, cover_image')
      .eq('status', 'published')
      .is('deleted_at', null)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(20);

    if (typeParam) {
      const types = typeParam.split(',');
      req = req.in('type', types);
    }

    const { data: results, error } = await req;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        results: results || [],
        query,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search error';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
