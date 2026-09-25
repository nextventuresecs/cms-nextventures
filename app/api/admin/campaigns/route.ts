import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { requireAuth } from '@/app/lib/auth';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_12345678901234567890123456789012');

const campaignSchema = z.object({
  subject: z.string().min(2, 'Subject required'),
  content: z.string().min(10, 'Content required'),
  type: z.enum(['newsletter', 'blog_announce', 'custom']).default('newsletter'),
  segment: z.record(z.string(), z.any()).optional(),
  blog_post_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { data: campaigns, error } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: campaigns || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching campaigns';
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
    const validated = campaignSchema.parse(body);

    const { data: campaign, error } = await supabaseAdmin
      .from('email_campaigns')
      .insert({
        subject: validated.subject,
        content: validated.content,
        type: validated.type,
        segment: validated.segment || {},
        blog_post_id: validated.blog_post_id || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Async batch execution: fetch active subscribers
    const { data: subscribers } = await supabaseAdmin
      .from('subscribers')
      .select('email')
      .eq('subscribed', true);

    const recipientEmails = (subscribers || []).map((s) => s.email);

    if (recipientEmails.length > 0 && process.env.RESEND_API_KEY) {
      // Chunk sending in batches of 50
      const batchSize = 50;
      for (let i = 0; i < recipientEmails.length; i += batchSize) {
        const batch = recipientEmails.slice(i, i + batchSize);
        resend.batch.send(
          batch.map((email) => ({
            from: 'NextVentures <newsletter@nextventures.in>',
            to: email,
            subject: validated.subject,
            html: validated.content,
          }))
        ).catch((err) => console.error('Batch email send error:', err));
      }

      await supabaseAdmin
        .from('email_campaigns')
        .update({
          sent_to_count: recipientEmails.length,
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaign.id);
    }

    return NextResponse.json({
      success: true,
      data: { campaign_id: campaign.id, recipients_count: recipientEmails.length },
      message: 'Campaign created and sent successfully',
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Error creating campaign';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
