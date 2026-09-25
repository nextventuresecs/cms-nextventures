-- Migration: 20260922090200_create_case_studies.sql
-- Description: Create case_studies extension table

CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID UNIQUE REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  client_name TEXT,
  industry TEXT,
  challenge TEXT,
  solution TEXT,
  results JSONB DEFAULT '{}'::jsonb,
  testimonial TEXT,
  testimonial_author TEXT,
  project_duration TEXT,
  services_used TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON public.case_studies(industry);

-- Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
