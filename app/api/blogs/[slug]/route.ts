import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const { data: blog, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, staff_users(id, name, avatar_url, bio), blog_post_tags(blog_tags(name, slug))')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('type', 'blog')
      .is('deleted_at', null)
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
        { status: 404 }
      );
    }

    // Increment view counter asynchronously
    supabaseAdmin
      .from('blog_posts')
      .update({ views: (blog.views || 0) + 1 })
      .eq('id', blog.id)
      .then();

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching blog post';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
