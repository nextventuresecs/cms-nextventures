import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const industry = searchParams.get('industry');

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, published_at, case_studies(client_name, industry, results, project_duration)', { count: 'exact' })
      .eq('type', 'case_study')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (industry) {
      query = query.eq('case_studies.industry', industry);
    }

    const { data: caseStudies, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        caseStudies: caseStudies || [],
        total: count || 0,
        page,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching case studies';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
