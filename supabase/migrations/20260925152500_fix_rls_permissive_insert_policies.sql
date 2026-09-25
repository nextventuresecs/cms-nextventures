-- Migration: 20260925152500_fix_rls_permissive_insert_policies.sql
-- Description: Fix Supabase linter warning rls_policy_always_true by replacing WITH CHECK (true) with explicit input validation predicates

-- 1. Update contacts INSERT RLS policy
DROP POLICY IF EXISTS "Public insert contacts" ON public.contacts;

CREATE POLICY "Public insert contacts"
ON public.contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(trim(name)) >= 2 AND
  email IS NOT NULL AND position('@' in email) > 1 AND
  phone IS NOT NULL AND length(trim(phone)) >= 10 AND
  service_interest IS NOT NULL AND length(trim(service_interest)) >= 1
);

-- 2. Update subscribers INSERT RLS policy
DROP POLICY IF EXISTS "Public insert subscribers" ON public.subscribers;

CREATE POLICY "Public insert subscribers"
ON public.subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND position('@' in email) > 1
);
