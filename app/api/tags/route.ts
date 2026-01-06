
import { supabase } from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: tags, error } = await supabase
      .from('blog_tags')
      .select('id, name, slug, count')
      .order('count', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Tags API error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}