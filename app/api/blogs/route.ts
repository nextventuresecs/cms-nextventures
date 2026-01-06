import { supabase } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform(Number).default(10),
  page: z.string().optional().transform(Number).default(1),
  tag: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const { limit, page, tag } = querySchema.parse({
      limit: searchParams.get('limit'),
      page: searchParams.get('page') ?? undefined,
      tag: searchParams.get('tag') ?? undefined,
    });


    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, published_at, reading_time, seo_meta')
      .eq('status', 'published')
      .eq('type', 'blog')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tag) {
      query = query.eq('blog_tags.name', tag); 
    }

    const { data: blogs, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { blogs, total: count, page, hasMore: offset + limit < (count ?? 0) },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Caught error in /api/blogs:', message);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}