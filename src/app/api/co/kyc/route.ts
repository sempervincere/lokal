/**
 * PUT /api/co/kyc
 *
 * Submits the KYC form for a Cluster Owner. Sets kycCompleted=true
 * and stores the hashed KTP + referral source + username.
 *
 * Auth: Supabase session + role === 'CLUSTER_OWNER'
 * Body: { ktpHash, username, phoneNumber?, referralSource }
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "CLUSTER_OWNER") {
    return NextResponse.json({ error: "CLUSTER_OWNER_REQUIRED" }, { status: 403 });
  }

  let body: { ktpHash?: string; username?: string; phoneNumber?: string; referralSource?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { ktpHash, username, phoneNumber, referralSource } = body;

  if (!ktpHash || !username || !referralSource) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", message: "ktpHash, username, and referralSource are required" },
      { status: 400 },
    );
  }

  // Validate username format
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return NextResponse.json(
      { error: "INVALID_USERNAME", message: "Username must be 3–30 chars, letters/numbers/underscores/hyphens only" },
      { status: 400 },
    );
  }

  // Check username uniqueness
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json(
      { error: "USERNAME_TAKEN", message: "Username already taken" },
      { status: 409 },
    );
  }

  // Validate referral source
  const validSources = ["Instagram", "X", "TikTok", "Friends", "Other"];
  const validSource = validSources.includes(referralSource) || referralSource.startsWith("Other:");
  if (!validSource) {
    return NextResponse.json(
      { error: "INVALID_REFERRAL", message: "Invalid referral source" },
      { status: 400 },
    );
  }

  // Check KTP uniqueness (1 KTP = 1 account)
  const existingKtp = await prisma.user.findFirst({
    where: { ktpHash, id: { not: user.id } },
  });
  if (existingKtp) {
    return NextResponse.json(
      { error: "KTP_ALREADY_USED", message: "Nomor KTP ini sudah digunakan oleh akun lain" },
      { status: 409 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ktpHash,
      username,
      phoneNumber: phoneNumber || dbUser.phoneNumber,
      referralSource,
      kycCompleted: true,
    },
  });

  return NextResponse.json({ ok: true });
}
