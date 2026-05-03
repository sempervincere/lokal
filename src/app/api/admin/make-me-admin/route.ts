/**
 * POST /api/admin/make-me-admin
 *
 * ONE-TIME UTILITY: Promotes the currently logged-in user to ADMIN.
 * Call this once after logging in, then refresh the admin page.
 *
 * This updates BOTH:
 * 1. Supabase Auth user_metadata.role = "ADMIN"
 * 2. Prisma DB users.role = "ADMIN"
 *
 * After calling this, log out and log back in for the role to take full effect.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "You must be logged in first" },
      { status: 401 },
    );
  }

  // 1. Update Supabase Auth metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: { role: "ADMIN" },
  });

  if (updateError) {
    return NextResponse.json(
      { error: "SUPABASE_ERROR", message: updateError.message },
      { status: 500 },
    );
  }

  // 2. Update Prisma DB
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  return NextResponse.json({
    ok: true,
    message: "You are now an ADMIN. Log out and log back in for full effect.",
    user: {
      id: user.id,
      email: user.email,
      role: "ADMIN",
    },
  });
}
