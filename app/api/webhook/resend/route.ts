import { supabase } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('resend-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const payload = await request.text();

    // Verify signature
    if (signature && !verifySignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const { type, data } = event;

    console.log('Received Resend webhook:', type, data);

    // Extract email and metadata
    const email = data.to?.[0] || data.email;
    const campaignId = data.tags?.campaign_id;

    // Find subscriber
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (!subscriber) {
      console.warn('Subscriber not found for email:', email);
      return NextResponse.json({ received: true });
    }

    // Handle different event types
    switch (type) {
      case 'email.sent':
      case 'email.delivered':
        await supabase.from('email_events').insert({
          campaign_id: campaignId,
          subscriber_id: subscriber.id,
          event_type: 'sent',
          metadata: data,
        });
        break;

      case 'email.opened':
        await supabase.from('email_events').insert({
          campaign_id: campaignId,
          subscriber_id: subscriber.id,
          event_type: 'opened',
          metadata: data,
        });

        // Update subscriber stats
        await supabase.rpc('increment_email_open_count', { 
          subscriber_id: subscriber.id 
        });
        break;

      case 'email.clicked':
        await supabase.from('email_events').insert({
          campaign_id: campaignId,
          subscriber_id: subscriber.id,
          event_type: 'clicked',
          link_url: data.link,
          metadata: data,
        });

        // Update subscriber stats
        await supabase.rpc('increment_email_click_count', { 
          subscriber_id: subscriber.id 
        });
        break;

      case 'email.bounced':
        await supabase.from('email_events').insert({
          campaign_id: campaignId,
          subscriber_id: subscriber.id,
          event_type: 'bounced',
          metadata: data,
        });

        // Mark as unsubscribed if hard bounce
        if (data.bounce_type === 'hard') {
          await supabase
            .from('subscribers')
            .update({ 
              subscribed: false,
              unsubscribed_at: new Date().toISOString(),
            })
            .eq('id', subscriber.id);
        }
        break;

      case 'email.complained':
        await supabase.from('email_events').insert({
          campaign_id: campaignId,
          subscriber_id: subscriber.id,
          event_type: 'unsubscribed',
          metadata: data,
        });

        // Unsubscribe user
        await supabase
          .from('subscribers')
          .update({ 
            subscribed: false,
            unsubscribed_at: new Date().toISOString(),
          })
          .eq('id', subscriber.id);
        break;

      default:
        console.log('Unhandled webhook event type:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Webhook processing error:', message);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}