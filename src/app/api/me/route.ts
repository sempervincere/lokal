/**
 * GET /api/me
 *
 * Returns the current authenticated user's profile from the Prisma DB.
 * This is the SOURCE OF TRUTH for role-based routing.
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
      { error: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, fullName: true, role: true, walletAddress: true },
  });

  if (!dbUser) {
    return NextResponse.json(
      { error: "USER_NOT_FOUND", message: "User exists in Auth but not in DB. Try logging out and in again." },
      { status: 404 },
    );
  }

  return NextResponse.json({ user: dbUser });
}
