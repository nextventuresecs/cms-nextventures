// lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabase';

export async function authMiddleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.redirect(new URL('/admin/login', req.url));

  // Check if user is admin (e.g., via a role in user metadata or a separate table)
  // For now, assume all logged-in users are admins; add role checks later.

  return NextResponse.next();
}