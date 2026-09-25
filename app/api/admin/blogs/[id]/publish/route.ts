import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { requireAuth } from '@/app/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const { data: blog, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found or update failed' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { blog_id: blog.id, status: 'published', published_at: blog.published_at },
      message: 'Blog post published successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Publish error occurred';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
