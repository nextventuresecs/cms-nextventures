-- Migration: 20260922090400_create_email_campaigns_and_events.sql
-- Description: Create email_campaigns and email_events analytics tracking tables

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'newsletter',
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  segment JSONB DEFAULT '{}'::jsonb,
  blog_post_id UUID REFERENCES public.blog_posts(id),
  sent_to_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained')),
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_events_campaign_id ON public.email_events(campaign_id);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
