/**
 * GET /api/co/me
 *
 * Returns the authenticated Cluster Owner's profile, cluster, earnings summary,
 * session count, and recent activity. Used by CO dashboard + cluster + layout.
 *
 * Auto-creates ClusterOwner record on first access.
 * Returns partial data when no cluster exists (new COs).
 *
 * Auth: Supabase session + role === 'CLUSTER_OWNER'
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCoTier } from "@/lib/constants/pricing";

export async function GET(request: NextRequest) {
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

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "CLUSTER_OWNER") {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Cluster Owner access required" },
      { status: 403 },
    );
  }

  // Auto-create ClusterOwner record if missing (first access after signup)
  let co = await prisma.clusterOwner.findUnique({
    where: { userId: user.id },
    include: {
      clusters: {
        select: {
          id: true, slug: true, name: true, anchorLabel: true, status: true,
          confidenceScore: true, dataCompleteness: true, totalValidatedFields: true,
          anchorLat: true, anchorLng: true, radiusKm: true, updatedAt: true,
        },
        take: 1,
      },
    },
  });

  if (!co) {
    co = await prisma.clusterOwner.create({
      data: { userId: user.id, coScore: 0, trustScore: 60, isActive: true },
      include: {
        clusters: {
          select: {
            id: true, slug: true, name: true, anchorLabel: true, status: true,
            confidenceScore: true, dataCompleteness: true, totalValidatedFields: true,
            anchorLat: true, anchorLng: true, radiusKm: true, updatedAt: true,
          },
          take: 1,
        },
      },
    });
  }

  const tier = getCoTier(co.coScore);
  const cluster = co.clusters[0] ?? null;

  // ── Build CO profile ────────────────────────────────────────────────────
  const coData = {
    id: co.id,
    fullName: dbUser.fullName,
    email: dbUser.email,
    coScore: co.coScore,
        trustScore: co.trustScore ?? 60,
    nftMintAddress: co.nftMintAddress,
    nftTxSignature: co.nftTxSignature,
    isActive: co.isActive,
    kycCompleted: dbUser.kycCompleted,
    username: dbUser.username,
    tier: {
      tier: tier.tier,
      label: tier.label,
      shareRate: tier.shareRate * 100,
      shareIdrx: tier.shareIdrx,
      multiplier: tier.multiplier,
    },
  };

  // ── No cluster yet ──────────────────────────────────────────────────────
  if (!cluster) {
    return NextResponse.json({
      co: coData,
      cluster: null,
      earningsOverview: { totalIdrx: 0, pendingIdrx: 0 },
      sessionsThisMonth: 0,
      revenueShareThisMonth: 0,
      recentActivity: [],
    });
  }

  // ── Has cluster — full data ─────────────────────────────────────────────
  const [earningsAgg, pendingAgg] = await Promise.all([
    prisma.coEarning.aggregate({ _sum: { amountIdrx: true }, where: { coId: co.id } }),
    prisma.coEarning.aggregate({ _sum: { amountIdrx: true }, where: { coId: co.id, isPaid: false } }),
  ]);

  const totalIdrx = Number(earningsAgg._sum.amountIdrx ?? 0);
  const pendingIdrx = Number(pendingAgg._sum.amountIdrx ?? 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sessionsThisMonth = await prisma.session.count({
    where: {
      clusterId: cluster.id,
      status: { in: ["ACTIVE", "EXPIRED"] },
      activatedAt: { gte: startOfMonth },
    },
  });

  const revenueShareThisMonth = sessionsThisMonth * tier.shareIdrx;

  const recentEarnings = await prisma.coEarning.findMany({
    where: { coId: co.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, type: true, amountIdrx: true, description: true, createdAt: true, isPaid: true },
  });

  const [validatedCount, pendingCount] = await Promise.all([
    prisma.clusterFieldValue.count({ where: { clusterId: cluster.id, status: "VALIDATED" } }),
    prisma.clusterFieldValue.count({ where: { clusterId: cluster.id, status: "PENDING" } }),
  ]);

  return NextResponse.json({
    co: coData,
    cluster: {
      id: cluster.id,
      slug: cluster.slug,
      name: cluster.name,
      anchorLabel: cluster.anchorLabel,
      anchorLat: cluster.anchorLat,
      anchorLng: cluster.anchorLng,
      radiusKm: cluster.radiusKm,
      status: cluster.status,
      confidenceScore: cluster.confidenceScore,
      dataCompleteness: cluster.dataCompleteness,
      totalValidatedFields: cluster.totalValidatedFields,
      totalFields: 20,
      validatedCount,
      pendingCount,
      updatedAt: cluster.updatedAt,
    },
    earningsOverview: { totalIdrx, pendingIdrx },
    sessionsThisMonth,
    revenueShareThisMonth,
    recentActivity: recentEarnings.map(e => ({
      id: e.id,
      type: e.type,
      amountIdrx: Number(e.amountIdrx),
      description: e.description,
      createdAt: e.createdAt,
      isPaid: e.isPaid,
    })),
  });
}
