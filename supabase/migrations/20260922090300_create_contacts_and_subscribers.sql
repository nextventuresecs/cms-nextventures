-- Migration: 20260922090300_create_contacts_and_subscribers.sql
-- Description: Create contacts lead tracking and subscribers audience tables

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization TEXT,
  service_interest TEXT NOT NULL,
  message TEXT,
  subscribed BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
  source TEXT DEFAULT 'website_contact_form',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_to UUID REFERENCES public.staff_users(id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);

-- Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT DEFAULT 'homepage',
  subscribed BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  last_email_sent TIMESTAMPTZ,
  email_open_count INTEGER DEFAULT 0,
  email_click_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
