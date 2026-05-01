/**
 * GET  /api/co/profile — returns CO profile data
 * PATCH /api/co/profile — updates CO profile fields
 *
 * Auth: Supabase session + role === 'CLUSTER_OWNER'
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getAuthUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "CLUSTER_OWNER") return null;
  return dbUser;
}

export async function GET(request: NextRequest) {
  const dbUser = await getAuthUser(request);
  if (!dbUser) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  return NextResponse.json({
    id: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.fullName,
    username: dbUser.username,
    phoneNumber: dbUser.phoneNumber,
    jobTitle: dbUser.jobTitle,
    referralSource: dbUser.referralSource,
    kycCompleted: dbUser.kycCompleted,
    hasKtp: !!dbUser.ktpHash,
  });
}

export async function PATCH(request: NextRequest) {
  const dbUser = await getAuthUser(request);
  if (!dbUser) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  let body: { username?: string; phoneNumber?: string; jobTitle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const update: Record<string, string | null> = {};

  if (body.username !== undefined) {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(body.username)) {
      return NextResponse.json({ error: "INVALID_USERNAME" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { username: body.username } });
    if (existing && existing.id !== dbUser.id) {
      return NextResponse.json({ error: "USERNAME_TAKEN" }, { status: 409 });
    }
    update.username = body.username;
  }

  if (body.phoneNumber !== undefined) {
    update.phoneNumber = body.phoneNumber || null;
  }

  if (body.jobTitle !== undefined) {
    update.jobTitle = body.jobTitle || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true, message: "Nothing to update" });
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: update,
  });

  return NextResponse.json({ ok: true });
}
