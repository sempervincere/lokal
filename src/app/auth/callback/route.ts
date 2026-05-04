import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { syncUserToDB, extractUserPayload } from '@/lib/supabase/syncUser';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // role param is set by handleGoogle() on the login page — used for FIRST-TIME stamp only
  const roleParam = searchParams.get('role');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Stamp role for first-time Google OAuth users
        if (roleParam && !user.user_metadata?.role) {
          await supabase.auth.updateUser({ data: { role: roleParam } });
        }

        const { data: { user: freshUser } } = await supabase.auth.getUser();
        const payload = extractUserPayload(freshUser ?? user);
        if (payload) {
          await syncUserToDB(payload);
        }

        // Route based on ACTUAL DB role — source of truth
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        const dbRole = dbUser?.role ?? roleParam;
        let dest: string;
        if (dbRole === 'CLUSTER_OWNER') {
          dest = '/co/kyc';
        } else if (dbRole === 'ADMIN') {
          dest = '/admin';
        } else {
          dest = '/dashboard';
        }
        return NextResponse.redirect(`${origin}${dest}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
