/**
 * syncUser.ts — Server-side helper
 *
 * Syncs a Supabase auth user into our custom `users` Prisma table.
 * Called from:
 *   1. /auth/callback  (Google OAuth flow)
 *   2. /api/auth/sync  (email signup / login flow)
 *
 * Strategy: upsert on email so it's idempotent — safe to call on every login.
 * The Supabase user ID is stored as our `id` so they match across both systems.
 */

import { prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

export interface SupabaseUserPayload {
  id: string;            // Supabase auth.users.id (UUID)
  email: string;
  fullName?: string;     // from user_metadata.full_name
  role?: UserRole;       // from user_metadata.role
}

/**
 * Upserts the user into the Prisma `users` table.
 * - On first call (signup): creates the record
 * - On subsequent calls (login): updates fullName if it changed, leaves role alone
 *
 * Never throws — errors are caught and logged so the auth flow is never blocked.
 */
export async function syncUserToDB(payload: SupabaseUserPayload): Promise<void> {
  const { id, email, fullName, role } = payload;

  try {
    // Check if this email already exists under a different Supabase ID.
    // This happens when a user first signs up with email+password, then later
    // signs in with Google OAuth using the same email — Supabase creates a new UUID.
    // We transfer the ID so the existing role and data are preserved.
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail && existingByEmail.id !== id) {
      await prisma.user.update({
        where: { email },
        data: { id, ...(fullName ? { fullName } : {}) },
      });
      return;
    }

    await prisma.user.upsert({
      where: { id },
      update: {
        // On login: only update name if provided (role is intentionally NOT changed here)
        ...(fullName ? { fullName } : {}),
      },
      create: {
        id,
        email,
        fullName: fullName || email.split('@')[0],
        role: role || 'BUSINESS_OWNER',
      },
    });
  } catch (err) {
    console.error('[syncUserToDB] Failed to sync user to DB:', err);
  }
}

/**
 * Extracts user fields from a Supabase User object (as returned by getUser()).
 */
export function extractUserPayload(supabaseUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): SupabaseUserPayload | null {
  if (!supabaseUser.email) return null;

  const meta = supabaseUser.user_metadata ?? {};
  const rawRole = meta.role as string | undefined;

  // Map the role string from metadata to our enum
  const role: UserRole =
    rawRole === 'CLUSTER_OWNER' ? 'CLUSTER_OWNER' :
    rawRole === 'ADMIN'         ? 'ADMIN' :
                                  'BUSINESS_OWNER';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    fullName: (meta.full_name as string) || (meta.name as string) || undefined,
    role,
  };
}
