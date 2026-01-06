import { supabase } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_FAILED', message: 'Invalid credentials' } },
        { status: 401 }
      );
    }

    // Fetch staff user details
    const { data: staffUser, error: staffError } = await supabase
      .from('staff_users')
      .select('id, email, name, role, avatar_url')
      .eq('id', authData.user.id)
      .single();

    if (staffError || !staffUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized as staff' } },
        { status: 403 }
      );
    }

    // Update last login
    await supabase
      .from('staff_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', staffUser.id);

    return NextResponse.json({
      success: true,
      data: {
        token: authData.session.access_token,
        user: staffUser,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Login API error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
