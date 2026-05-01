/**
 * GET /api/co/earnings
 *
 * Returns the authenticated Cluster Owner's full earnings history with
 * aggregated totals and their current reputation tier's share rate.
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

  const co = await prisma.clusterOwner.findUnique({
    where: { userId: user.id },
  });

  if (!co) {
    return NextResponse.json(
      { error: "NO_PROFILE", message: "Cluster Owner profile not found" },
      { status: 404 },
    );
  }

  const tier = getCoTier(co.coScore);

  // ── Earnings records ────────────────────────────────────────────────────
  const records = await prisma.coEarning.findMany({
    where: { coId: co.id },
    orderBy: { createdAt: "desc" },
  });

  // ── Aggregates ──────────────────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalAgg, pendingAgg, monthAgg] = await Promise.all([
    prisma.coEarning.aggregate({
      _sum: { amountIdrx: true },
      where: { coId: co.id },
    }),
    prisma.coEarning.aggregate({
      _sum: { amountIdrx: true },
      where: { coId: co.id, isPaid: false },
    }),
    prisma.coEarning.aggregate({
      _sum: { amountIdrx: true },
      where: {
        coId: co.id,
        type: "SESSION_SHARE",
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  return NextResponse.json(
    {
      totalIdrx: Number(totalAgg._sum.amountIdrx ?? 0),
      pendingIdrx: Number(pendingAgg._sum.amountIdrx ?? 0),
      estimatedThisMonthIdrx: Number(monthAgg._sum.amountIdrx ?? 0),
      shareRate: tier.shareRate * 100, // display as percentage (e.g. 10)
      shareRateLabel: `${tier.shareRate * 100}%`,
      perSessionIdrx: tier.shareIdrx,
      tier: {
        tier: tier.tier,
        label: tier.label,
        multiplier: tier.multiplier,
      },
      records: records.map((r) => ({
        id: r.id,
        type: r.type,
        amountIdrx: Number(r.amountIdrx),
        description: r.description,
        createdAt: r.createdAt,
        isPaid: r.isPaid,
        paidAt: r.paidAt,
        sessionId: r.sessionId,
      })),
    },
    {
      headers: {
        "Cache-Control": "private, max-age=5, stale-while-revalidate=30",
      },
    },
  );
}
