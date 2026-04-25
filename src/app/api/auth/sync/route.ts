/**
 * POST /api/auth/sync
 *
 * Called by the login page after a successful email signup or login.
 * The client can't call Prisma directly (browser), so this thin API
 * route does the DB write on the server.
 *
 * Body: { id, email, fullName?, role? }
 * Returns: { ok: true } or { error: string }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncUserToDB, extractUserPayload } from '@/lib/supabase/syncUser';

export async function POST(request: NextRequest) {
  try {
    // Verify the caller is actually authenticated — never trust client body alone
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build payload from the authenticated Supabase user (server-verified)
    // We intentionally ignore the request body and use server-side user data.
    const payload = extractUserPayload(user);

    if (!payload) {
      return NextResponse.json({ error: 'User email missing' }, { status: 400 });
    }

    await syncUserToDB(payload);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/auth/sync]', err);
    // Return 200 anyway — don't block the UX for a sync failure
    return NextResponse.json({ ok: false, error: 'Sync failed — non-blocking' });
  }
}
