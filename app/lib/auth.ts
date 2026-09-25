import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from './supabase';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  avatar_url?: string;
  bio?: string;
}

/**
 * Validates staff authentication and role from request (cookies or Authorization header)
 */
export async function getStaffUser(request: NextRequest): Promise<{ user: StaffUser | null; error: string | null }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    // Check for Authorization header first
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: bearerUser }, error: bearerError } = await supabaseAdmin.auth.getUser(token);
      if (!bearerError && bearerUser) {
        userId = bearerUser.id;
      }
    }

    // If no bearer user, check cookies using @supabase/ssr
    if (!userId) {
      const supabaseServer = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      });

      const { data: { user: cookieUser } } = await supabaseServer.auth.getUser();
      if (cookieUser) {
        userId = cookieUser.id;
      }
    }

    if (!userId) {
      return { user: null, error: 'Unauthorized: No valid session or token found' };
    }

    // Fetch staff user profile
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff_users')
      .select('id, email, name, role, avatar_url, bio')
      .eq('id', userId)
      .single();

    if (staffError || !staff) {
      return { user: null, error: 'Forbidden: User is not authorized as staff' };
    }

    return { user: staff as StaffUser, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Auth verification error';
    return { user: null, error: message };
  }
}

/**
 * Guard function for API routes requiring authenticated staff with specific roles
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles: Array<'admin' | 'editor' | 'author' | 'viewer'> = ['admin', 'editor', 'author']
): Promise<{ user: StaffUser } | NextResponse> {
  const { user, error } = await getStaffUser(request);

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: error || 'Authentication required' } },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: `Role '${user.role}' does not have sufficient permissions` } },
      { status: 403 }
    );
  }

  return { user };
}
