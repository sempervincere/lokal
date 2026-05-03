/**
 * GET /api/admin/me
 *
 * Returns the authenticated admin user's profile.
 * Used by the admin layout for auth gating.
 *
 * Auth: ADMIN only (TEMPORARILY BYPASSED — see PREVIEW_MODE in layout.tsx)
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 },
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, fullName: true, role: true },
  });

  // TEMPORARY: Still return 403 for non-admins so layout can detect preview mode
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Admin access required", role: dbUser?.role ?? null },
      { status: 403 },
    );
  }

  return NextResponse.json({ user: dbUser, isAdmin: true });
}
