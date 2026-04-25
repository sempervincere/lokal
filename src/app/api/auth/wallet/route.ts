/**
 * PATCH /api/auth/wallet
 *
 * Saves (or clears) the connected wallet address for the authenticated user.
 * Called by useWalletSync whenever the wallet connects or disconnects.
 *
 * Body: { walletAddress: string | null }
 * Returns: { ok: true } or { error: string }
 *
 * Auth: Supabase session cookie (server-verified — never trust body alone).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    // 1. Verify caller is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse body
    const body = await request.json() as { walletAddress?: string | null };
    const walletAddress = body.walletAddress ?? null;

    // Basic validation: Solana addresses are 32-44 base58 chars, or null to clear
    if (walletAddress !== null && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // 3. Update in Prisma (upsert by email — id comes from Supabase UUID)
    await prisma.user.updateMany({
      where: { email: user.email! },
      data: { walletAddress },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/auth/wallet]', err);
    // Return 200 — don't break UI for a non-critical sync failure
    return NextResponse.json({ ok: false, error: 'Wallet sync failed — non-blocking' });
  }
}
