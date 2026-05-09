/**
 * POST /api/waitlist
 *
 * Lightweight, idempotent waitlist signup — no auth required.
 * Uses raw SQL to avoid Prisma client regeneration requirement.
 * Role selection: BUSINESS_OWNER or CLUSTER_OWNER.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_ROLES = ['BUSINESS_OWNER', 'CLUSTER_OWNER'] as const;
type WaitlistRole = (typeof VALID_ROLES)[number];

// Simple but solid email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, role } = body as { email?: string; role?: string };

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'INVALID_EMAIL', message: 'Format email tidak valid.' },
        { status: 400 }
      );
    }
    if (!role || !VALID_ROLES.includes(role as WaitlistRole)) {
      return NextResponse.json(
        { error: 'INVALID_ROLE', message: 'Pilih peran: Business Owner atau Cluster Owner.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Raw SQL upsert — bypasses Prisma client regeneration requirement.
    // ON CONFLICT on the unique email column is idempotent and safe.
    await prisma.$executeRaw`
      INSERT INTO waitlist_submissions (id, email, role, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${normalizedEmail},
        ${role}::"WaitlistRole",
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        role       = EXCLUDED.role,
        updated_at = NOW()
    `;

    return NextResponse.json(
      { ok: true, message: 'Berhasil masuk daftar tunggu!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/waitlist]', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 }
    );
  }
}
