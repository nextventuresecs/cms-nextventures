import { supabase } from '@/app/lib/supabase';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform(Number).default(10),
  page: z.string().optional().transform(Number).default(1),
  tag: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED' } });

  try {
    const { limit, page, tag } = querySchema.parse(req.query);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, published_at, reading_time, seo_meta', { count: 'exact' })
      .eq('status', 'published')
      .eq('type', 'blog')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tag) {
      query = query.eq('blog_tags.name', tag);  // Join with tags if needed
    }

    const { data: blogs, error, count } = await query;
    if (error) throw error;

    res.status(200).json({
      success: true,
      data: { blogs, total: count ?? 0, page, hasMore: offset + limit < (count ?? 0) },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
}