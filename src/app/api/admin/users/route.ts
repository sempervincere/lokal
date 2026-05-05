/**
 * GET /api/admin/users
 *
 * Returns all users with their roles and basic stats.
 * Supports filtering by role and search by name/email.
 *
 * Query params:
 * - role: BUSINESS_OWNER | CLUSTER_OWNER | ADMIN (optional)
 * - search: Search by name or email (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (roleFilter && ["BUSINESS_OWNER", "CLUSTER_OWNER", "ADMIN"].includes(roleFilter)) {
      where.role = roleFilter;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { walletAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          walletAddress: true,
          phoneNumber: true,
          companyName: true,
          jobTitle: true,
          kycCompleted: true,
          credits: true,
          isSubs: true,
          subsType: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              messages: true,
            },
          },
          clusterOwner: {
            select: {
              id: true,
              coScore: true,
              trustScore: true,
              isActive: true,
              nftMintAddress: true,
              _count: {
                select: {
                  clusters: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Enrich CO data: paid sessions in their clusters + total earnings (IDRX)
    const coUserIds = users.filter(u => u.clusterOwner).map(u => u.id);
    const coIds = users.filter(u => u.clusterOwner).map(u => u.clusterOwner!.id);

    let coSessionCounts: Record<string, number> = {};
    let coEarningsSums: Record<string, number> = {};
    let userSessionCounts: Record<string, number> = {};

    if (coIds.length > 0) {
      // Get clusters owned by these COs
      const clusters = await prisma.cluster.findMany({
        where: { ownerId: { in: coIds } },
        select: { id: true, ownerId: true },
      });

      const clusterIds = clusters.map(c => c.id);
      const clusterToCoId = Object.fromEntries(clusters.map(c => [c.id, c.ownerId]));

      // Count paid sessions per cluster (not PENDING_PAYMENT)
      if (clusterIds.length > 0) {
        const sessionCounts = await prisma.session.groupBy({
          by: ["clusterId"],
          where: {
            clusterId: { in: clusterIds },
            status: { not: "PENDING_PAYMENT" },
          },
          _count: true,
        });

        for (const sc of sessionCounts) {
          const coId = clusterToCoId[sc.clusterId];
          if (coId) {
            coSessionCounts[coId] = (coSessionCounts[coId] || 0) + sc._count;
          }
        }
      }

      // Sum earnings per CO
      const earningsAgg = await prisma.coEarning.groupBy({
        by: ["coId"],
        where: { coId: { in: coIds } },
        _sum: { amountIdrx: true },
      });

      for (const e of earningsAgg) {
        coEarningsSums[e.coId] = Number(e._sum.amountIdrx) || 0;
      }
    }

    // Count sessions for BUSINESS_OWNER users (their own sessions)
    const boUserIds = users.filter(u => u.role === "BUSINESS_OWNER").map(u => u.id);
    if (boUserIds.length > 0) {
      const boSessions = await prisma.session.groupBy({
        by: ["userId"],
        where: {
          userId: { in: boUserIds },
          status: { not: "PENDING_PAYMENT" },
        },
        _count: true,
      });

      for (const s of boSessions) {
        userSessionCounts[s.userId] = s._count;
      }
    }

    // Map coId -> userId for easy lookup
    const coIdToUserId = Object.fromEntries(
      users.filter(u => u.clusterOwner).map(u => [u.clusterOwner!.id, u.id])
    );

    return NextResponse.json({
      users: users.map(u => {
        const isCO = u.role === "CLUSTER_OWNER";
        const coId = u.clusterOwner?.id;

        // For COs: count paid sessions in their clusters
        // For BOs: count their own paid sessions
        const sessionCount = isCO && coId
          ? (coSessionCounts[coId] || 0)
          : (userSessionCounts[u.id] || 0);

        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          walletAddress: u.walletAddress,
          phoneNumber: u.phoneNumber,
          companyName: u.companyName,
          jobTitle: u.jobTitle,
          kycCompleted: u.kycCompleted,
          credits: u.credits,
          isSubs: u.isSubs,
          subsType: u.subsType,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          stats: {
            sessions: sessionCount,
            messages: u._count.messages,
          },
          clusterOwner: u.clusterOwner ? {
            id: u.clusterOwner.id,
            coScore: u.clusterOwner.coScore,
            trustScore: u.clusterOwner.trustScore,
            isActive: u.clusterOwner.isActive,
            nftMintAddress: u.clusterOwner.nftMintAddress,
            clusters: u.clusterOwner._count.clusters,
            earnings: coId ? (coEarningsSums[coId] || 0) : 0,
          } : null,
        };
      }),
      stats: {
        total,
        roleDistribution: roleDistribution.map(r => ({ role: r.role, count: r._count })),
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/users] Error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
