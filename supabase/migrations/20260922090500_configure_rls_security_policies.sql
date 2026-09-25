-- Migration: 20260922090500_configure_rls_security_policies.sql
-- Description: Define RLS policies adhering to Supabase security standards (TO anon / TO authenticated, no deprecated auth.role())

-- 1. Public Read Policies for Blog Posts & Case Studies
CREATE POLICY "Public anonymous read access for published blog posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Public anonymous read access for published case studies"
ON public.case_studies
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts bp
    WHERE bp.id = case_studies.blog_post_id
      AND bp.status = 'published'
      AND bp.deleted_at IS NULL
  )
);

CREATE POLICY "Public read tags"
ON public.blog_tags
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read blog post tags"
ON public.blog_post_tags
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Staff Content Management Policies (TO authenticated with ownership or staff check)
CREATE POLICY "Staff CRUD blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
);

CREATE POLICY "Staff CRUD case studies"
ON public.case_studies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
);

-- 3. Public Insert for Lead Generation & Subscriptions
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

CREATE POLICY "Staff read update contacts"
ON public.contacts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
);

CREATE POLICY "Public insert subscribers"
ON public.subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND position('@' in email) > 1
);

CREATE POLICY "Staff management subscribers"
ON public.subscribers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid())
  )
);

-- 4. Email Campaigns (Admin Only)
CREATE POLICY "Staff management campaigns"
ON public.email_campaigns
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid()) AND s.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid()) AND s.role IN ('admin', 'editor')
  )
);
