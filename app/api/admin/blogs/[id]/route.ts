import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { requireAuth } from '@/app/lib/auth';
import { z } from 'zod';

const updateBlogSchema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10).optional(),
  cover_image: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const { data: blog, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, staff_users(id, name, email), blog_post_tags(blog_tags(name, slug))')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
        { status: 404 }
      );
    }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = updateBlogSchema.parse(body);

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.title) updatePayload.title = validated.title;
    if (validated.slug) updatePayload.slug = slugify(validated.slug);
    if (validated.excerpt !== undefined) updatePayload.excerpt = validated.excerpt;
    if (validated.content) {
      updatePayload.content = validated.content;
      updatePayload.reading_time = calculateReadingTime(validated.content);
    }
    if (validated.cover_image !== undefined) updatePayload.cover_image = validated.cover_image || null;
    if (validated.status) {
      updatePayload.status = validated.status;
      if (validated.status === 'published') {
        updatePayload.published_at = new Date().toISOString();
      }
    }
    if (validated.seo_meta) updatePayload.seo_meta = validated.seo_meta;

    const { data: blog, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Handle tag updates if provided
    if (validated.tags) {
      await supabaseAdmin.from('blog_post_tags').delete().eq('blog_post_id', id);

      for (const tagName of validated.tags) {
        const tagSlug = slugify(tagName);
        const { data: tagData } = await supabaseAdmin
          .from('blog_tags')
          .upsert({ name: tagName, slug: tagSlug }, { onConflict: 'slug' })
          .select()
          .single();

        if (tagData) {
          await supabaseAdmin.from('blog_post_tags').upsert({
            blog_post_id: id,
            tag_id: tagData.id,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: blog,
      message: 'Blog post updated successfully',
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Error updating blog post';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Blog post soft deleted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting blog post';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
