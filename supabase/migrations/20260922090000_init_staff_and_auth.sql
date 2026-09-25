-- Migration: 20260922090000_init_staff_and_auth.sql
-- Description: Initialize staff_users table synced with auth.users and RLS policies

CREATE TABLE IF NOT EXISTS public.staff_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'author', 'viewer')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Policies for staff_users
CREATE POLICY "Staff profiles are readable by authenticated staff"
ON public.staff_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert staff users"
ON public.staff_users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid()) AND s.role = 'admin'
  )
);

CREATE POLICY "Admins and user can update staff profile"
ON public.staff_users
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = id OR EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid()) AND s.role = 'admin'
  )
)
WITH CHECK (
  (SELECT auth.uid()) = id OR EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.id = (SELECT auth.uid()) AND s.role = 'admin'
  )
);
