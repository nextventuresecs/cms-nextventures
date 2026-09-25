import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const { data: caseStudy, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, case_studies(*), staff_users(name, avatar_url)')
      .eq('slug', slug)
      .eq('type', 'case_study')
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (error || !caseStudy) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Case study not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: caseStudy,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching case study details';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
