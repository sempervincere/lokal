import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { syncUserToDB, extractUserPayload } from '@/lib/supabase/syncUser';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // role param is set by handleGoogle() on the login page
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
        // If Google OAuth user has no role in metadata yet, stamp the one chosen on the login page
        if (roleParam && !user.user_metadata?.role) {
          await supabase.auth.updateUser({ data: { role: roleParam } });
        }

        // Re-fetch user so payload has the freshly stamped role
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        const payload = extractUserPayload(freshUser ?? user);
        if (payload) {
          await syncUserToDB(payload);
        }

        // Route to the correct dashboard based on role
        const finalRole = freshUser?.user_metadata?.role ?? roleParam;
        const dest = finalRole === 'CLUSTER_OWNER' ? '/co/dashboard' : '/dashboard';
        return NextResponse.redirect(`${origin}${dest}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
