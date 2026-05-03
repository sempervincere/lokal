/**
 * GET /api/vault
 * 
 * Get vault balance and claims for a respondent wallet across all clusters.
 * 
 * Query params:
 * - wallet: Respondent's wallet address (required)
 * - clusterSlug: Filter by specific cluster (optional)
 * 
 * Auth: None required (public endpoint, wallet-based)
 */

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { VAULT_MIN_WITHDRAWAL_IDRX } from "@/lib/constants/pricing";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const clusterSlug = searchParams.get("clusterSlug");

    if (!wallet) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "wallet parameter is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { respondentWallet: wallet };
    
    if (clusterSlug) {
      const cluster = await prisma.cluster.findUnique({
        where: { slug: clusterSlug },
        select: { id: true },
      });
      
      if (!cluster) {
        return NextResponse.json(
          { error: "NOT_FOUND", message: "Cluster not found" },
          { status: 404 }
        );
      }
      
      where.vault = { clusterId: cluster.id };
    }

    // Get all vault claims for this wallet
    const claims = await prisma.vaultClaim.findMany({
      where,
      include: {
        vault: {
          include: {
            cluster: {
              select: {
                id: true,
                slug: true,
                name: true,
                anchorLabel: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const totalEarned = claims.reduce((sum, claim) => sum + Number(claim.amount), 0);
    const totalDistributed = claims
      .filter(c => c.status === "DISTRIBUTED")
      .reduce((sum, claim) => sum + Number(claim.amount), 0);
    const totalPending = claims
      .filter(c => c.status === "PENDING")
      .reduce((sum, claim) => sum + Number(claim.amount), 0);

    // Group by cluster
    const byCluster: Record<string, {
      cluster: any;
      claims: any[];
      totalEarned: number;
      totalDistributed: number;
      totalPending: number;
    }> = {};

    for (const claim of claims) {
      const clusterId = claim.vault.clusterId;
      if (!byCluster[clusterId]) {
        byCluster[clusterId] = {
          cluster: claim.vault.cluster,
          claims: [],
          totalEarned: 0,
          totalDistributed: 0,
          totalPending: 0,
        };
      }
      
      byCluster[clusterId].claims.push({
        id: claim.id,
        fieldCodes: claim.fieldCodes,
        approvedCount: claim.approvedCount,
        amount: Number(claim.amount),
        status: claim.status,
        distributedAt: claim.distributedAt,
        createdAt: claim.createdAt,
      });
      
      byCluster[clusterId].totalEarned += Number(claim.amount);
      if (claim.status === "DISTRIBUTED") {
        byCluster[clusterId].totalDistributed += Number(claim.amount);
      } else {
        byCluster[clusterId].totalPending += Number(claim.amount);
      }
    }

    return NextResponse.json({
      wallet,
      summary: {
        totalEarned,
        totalDistributed,
        totalPending,
        canWithdraw: totalPending >= VAULT_MIN_WITHDRAWAL_IDRX,
        minWithdrawal: VAULT_MIN_WITHDRAWAL_IDRX,
      },
      clusters: Object.values(byCluster),
    });
  } catch (error) {
    console.error("[GET /api/vault] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to load vault data" },
      { status: 500 }
    );
  }
}
