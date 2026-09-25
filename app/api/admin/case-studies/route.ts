import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { requireAuth } from '@/app/lib/auth';
import { z } from 'zod';

const caseStudySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  client_name: z.string().optional(),
  industry: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  results: z.record(z.string(), z.any()).optional(),
  testimonial: z.string().optional(),
  testimonial_author: z.string().optional(),
  project_duration: z.string().optional(),
  cover_image: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const industry = searchParams.get('industry');

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('blog_posts')
      .select('*, case_studies(*)', { count: 'exact' })
      .eq('type', 'case_study')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
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
        limit,
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

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = caseStudySchema.parse(body);

    const slug = validated.slug ? slugify(validated.slug) : slugify(validated.title);

    // Create base blog_post with type='case_study'
    const { data: blogPost, error: blogErr } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title: validated.title,
        slug,
        excerpt: validated.excerpt || validated.title,
        content: `${validated.challenge || ''}\n\n${validated.solution || ''}`,
        type: 'case_study',
        cover_image: validated.cover_image || null,
        author_id: user.id,
        status: validated.status,
        published_at: validated.status === 'published' ? new Date().toISOString() : null,
        seo_meta: { description: validated.excerpt || validated.title },
      })
      .select()
      .single();

    if (blogErr) throw blogErr;

    // Create case_studies table extension record if present
    const { data: csRecord, error: csErr } = await supabaseAdmin
      .from('case_studies')
      .insert({
        blog_post_id: blogPost.id,
        client_name: validated.client_name || null,
        industry: validated.industry || null,
        challenge: validated.challenge || null,
        solution: validated.solution || null,
        results: validated.results || {},
        testimonial: validated.testimonial || null,
        testimonial_author: validated.testimonial_author || null,
        project_duration: validated.project_duration || null,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      data: { id: blogPost.id, slug: blogPost.slug, case_study_id: csRecord?.id },
      message: 'Case study created successfully',
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Error creating case study';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
