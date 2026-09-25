import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_12345678901234567890123456789012');

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.enum(['homepage', 'blog', 'contact_form']).default('homepage'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source } = subscribeSchema.parse(body);

    const { data: subscriber, error } = await supabaseAdmin
      .from('subscribers')
      .upsert(
        {
          email,
          name: name || null,
          source,
          subscribed: true,
          unsubscribed_at: null,
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (error) throw error;

    // Send asynchronous welcome email
    if (process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: 'NextVentures <noreply@nextventures.in>',
        to: email,
        subject: 'Welcome to NextVentures Newsletter!',
        html: `<p>Hi ${name || 'there'},</p><p>Thank you for subscribing to NextVentures insights!</p>`,
      }).catch(err => console.error('Welcome email failed:', err));
    }

    return NextResponse.json({
      success: true,
      data: { subscriber_id: subscriber.id },
      message: 'Subscribed successfully',
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Subscription error';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
