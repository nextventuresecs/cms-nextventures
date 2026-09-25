import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { getStaffUser } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getStaffUser(request);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: authError || 'Authentication required' } },
        { status: 401 }
      );
    }

    // Fetch contacts count
    const { count: contactsCount, error: contactsErr } = await supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // Fetch subscribers count
    const { count: subscribersCount, error: subsErr } = await supabaseAdmin
      .from('subscribers')
      .select('*', { count: 'exact', head: true });

    // Fetch total blog views
    const { data: blogViewsData, error: viewsErr } = await supabaseAdmin
      .from('blog_posts')
      .select('views')
      .eq('type', 'blog')
      .eq('status', 'published');

    const totalBlogViews = (blogViewsData || []).reduce((acc, curr) => acc + (curr.views || 0), 0);

    // Fetch recent 5 contacts
    const { data: recentContacts, error: recentErr } = await supabaseAdmin
      .from('contacts')
      .select('id, name, email, service_interest, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate mock/actual conversion rate (subscribers / contacts ratio or percentage)
    const contactsTotal = contactsCount || 0;
    const subscribersTotal = subscribersCount || 0;
    const conversionRate = contactsTotal > 0 ? Number(((subscribersTotal / contactsTotal) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        contacts: contactsTotal,
        subscribers: subscribersTotal,
        blogViews: totalBlogViews,
        conversionRate,
      },
      recentContacts: recentContacts || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Dashboard stats API error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
