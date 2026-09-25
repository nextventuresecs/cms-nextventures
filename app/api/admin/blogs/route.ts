import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { requireAuth } from '@/app/lib/auth';
import { z } from 'zod';

const blogPostSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().optional(),
  excerpt: z.string().max(300, 'Excerpt must be under 300 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  cover_image: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).optional().default([]),
  seo_meta: z.object({
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }).optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('blog_posts')
      .select('*, staff_users(id, name, email)', { count: 'exact' })
      .eq('type', 'blog')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: blogs, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        blogs: blogs || [],
        total: count || 0,
        page,
        limit,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch blogs';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = blogPostSchema.parse(body);

    const slug = validated.slug ? slugify(validated.slug) : slugify(validated.title);
    const readingTime = calculateReadingTime(validated.content);

    const { data: blog, error: insertError } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title: validated.title,
        slug,
        excerpt: validated.excerpt || validated.title,
        content: validated.content,
        type: 'blog',
        cover_image: validated.cover_image || null,
        author_id: user.id,
        status: validated.status,
        published_at: validated.status === 'published' ? new Date().toISOString() : null,
        reading_time: readingTime,
        seo_meta: validated.seo_meta || { description: validated.excerpt || validated.title },
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_SLUG', message: `Blog post with slug '${slug}' already exists` } },
          { status: 400 }
        );
      }
      throw insertError;
    }

    // Handle tags insertion if present
    if (validated.tags && validated.tags.length > 0) {
      for (const tagName of validated.tags) {
        const tagSlug = slugify(tagName);
        // Upsert tag
        const { data: tagData } = await supabaseAdmin
          .from('blog_tags')
          .upsert({ name: tagName, slug: tagSlug }, { onConflict: 'slug' })
          .select()
          .single();

        if (tagData) {
          await supabaseAdmin.from('blog_post_tags').upsert({
            blog_post_id: blog.id,
            tag_id: tagData.id,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { blog_id: blog.id, slug: blog.slug },
      message: 'Blog post created successfully',
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to create blog post';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
