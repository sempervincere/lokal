/**
 * POST /api/admin/setup-accounts
 * 
 * Sets up demo accounts for the hackathon:
 * - BO: business@lokal.id
 * - New CO: rizky_setiawan@lokal.id (for Jalan Margonda)
 * - Transfers Margonda cluster to rizky_setiawan
 * - Keeps dylansius.putra@gmail.com as CO for BSD Serpong
 * 
 * Auth: ADMIN or PREVIEW_MODE
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
    }

    const results: string[] = [];

    // ── 1. BO user ────────────────────────────────────────────────────
    const boUser = await prisma.user.upsert({
      where: { email: 'business@lokal.id' },
      update: { role: 'BUSINESS_OWNER' },
      create: {
        email: 'business@lokal.id',
        fullName: 'Budi Santoso',
        role: 'BUSINESS_OWNER',
        companyName: 'Kopi Nusantara',
      },
    });
    results.push(`✓ BO: ${boUser.email} (${boUser.role})`);

    // ── 2. New CO user for Margonda ────────────────────────────────────
    const rizkyUser = await prisma.user.upsert({
      where: { email: 'rizky_setiawan@lokal.id' },
      update: {
        fullName: 'Rizky Setiawan',
        role: 'CLUSTER_OWNER',
        kycCompleted: true,
        username: 'rizky_setiawan',
      },
      create: {
        email: 'rizky_setiawan@lokal.id',
        fullName: 'Rizky Setiawan',
        role: 'CLUSTER_OWNER',
        kycCompleted: true,
        username: 'rizky_setiawan',
        referralSource: 'Campus',
      },
    });
    results.push(`✓ New CO: ${rizkyUser.email}`);

    // ── 3. ClusterOwner profile for Rizky ─────────────────────────────
    const rizkyCo = await prisma.clusterOwner.upsert({
      where: { userId: rizkyUser.id },
      update: { coScore: 85, trustScore: 85, isActive: true },
      create: {
        userId: rizkyUser.id,
        coScore: 85,
        trustScore: 85,
        isActive: true,
      },
    });
    results.push(`✓ CO profile: score=${rizkyCo.coScore}`);

    // ── 4. Transfer Margonda to Rizky ──────────────────────────────────
    await prisma.cluster.update({
      where: { slug: 'depok-margonda-001' },
      data: { ownerId: rizkyCo.id },
    });
    results.push(`✓ Margonda → Rizky`);

    // ── 5. Transfer BSD Serpong to Dylansius ───────────────────────────
    const dylansiusUser = await prisma.user.findUnique({
      where: { email: 'dylansius.putra@gmail.com' },
    });
    if (dylansiusUser) {
      const dylansiusCo = await prisma.clusterOwner.upsert({
        where: { userId: dylansiusUser.id },
        update: {},
        create: {
          userId: dylansiusUser.id,
          coScore: 85,
          trustScore: 85,
          isActive: true,
        },
      });
      await prisma.cluster.update({
        where: { slug: 'tangerang-bsd-serpong-001' },
        data: { ownerId: dylansiusCo.id },
      });
      results.push(`✓ BSD Serpong → Dylansius`);
    }

    return NextResponse.json({
      ok: true,
      message: "Demo accounts setup complete",
      results,
      accounts: {
        admin: "admin@lokal.id / adminlokal123",
        bo: "business@lokal.id",
        co_margonda: "rizky_setiawan@lokal.id",
        co_bsd: "dylansius.putra@gmail.com",
      },
      nextSteps: [
        "Sign in as admin@lokal.id or dylansius.putra@gmail.com via Google OAuth",
        "business@lokal.id needs to sign in via Google OAuth in Supabase",
        "Run POST /api/admin/mint-nft to mint soulbound NFT for Rizky",
      ],
    });
  } catch (error) {
    console.error("[Setup Accounts] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to setup accounts" },
      { status: 500 }
    );
  }
}
