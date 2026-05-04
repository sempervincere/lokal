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

    // Fetch users with counts
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
              sessions: true,
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
                  coEarnings: true,
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

    return NextResponse.json({
      users: users.map(u => ({
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
          sessions: u._count.sessions,
          messages: u._count.messages,
        },
        clusterOwner: u.clusterOwner ? {
          id: u.clusterOwner.id,
          coScore: u.clusterOwner.coScore,
          trustScore: u.clusterOwner.trustScore,
          isActive: u.clusterOwner.isActive,
          nftMintAddress: u.clusterOwner.nftMintAddress,
          clusters: u.clusterOwner._count.clusters,
          earnings: u.clusterOwner._count.coEarnings,
        } : null,
      })),
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
