/**
 * GET /api/co/survey-link
 * 
 * Generate or retrieve the survey link for the CO's cluster.
 * 
 * Auth: CLUSTER_OWNER only
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "CLUSTER_OWNER") {
      return NextResponse.json(
        { error: "CLUSTER_OWNER_REQUIRED" },
        { status: 403 }
      );
    }

    // Get CO's cluster
    const co = await prisma.clusterOwner.findUnique({
      where: { userId: user.id },
      include: { clusters: { select: { id: true, slug: true, name: true }, take: 1 } },
    });

    if (!co || co.clusters.length === 0) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "No cluster found for this CO" },
        { status: 404 }
      );
    }

    const cluster = co.clusters[0];
    
    // Generate survey link with token
    // Token format: cluster-{clusterId}-survey
    const token = `cluster-${cluster.id}-survey`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lokal.id";
    const surveyLink = `${baseUrl}/survey/${cluster.slug}?token=${token}`;

    // Get survey stats
    const [totalResponses, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.surveyResponse.count({
        where: { clusterId: cluster.id, status: { in: ["SUBMITTED", "REVIEWED"] } },
      }),
      prisma.surveyFieldResponse.count({
        where: {
          coStatus: "PENDING",
          surveyResponse: { clusterId: cluster.id, status: "SUBMITTED" },
        },
      }),
      prisma.surveyFieldResponse.count({
        where: {
          coStatus: "APPROVED",
          surveyResponse: { clusterId: cluster.id, status: "SUBMITTED" },
        },
      }),
      prisma.surveyFieldResponse.count({
        where: {
          coStatus: "REJECTED",
          surveyResponse: { clusterId: cluster.id, status: "SUBMITTED" },
        },
      }),
    ]);

    return NextResponse.json({
      cluster: {
        id: cluster.id,
        slug: cluster.slug,
        name: cluster.name,
      },
      surveyLink,
      token,
      stats: {
        totalResponses,
        totalFields: 15, // 15 survey fields
        pendingCount,
        approvedCount,
        rejectedCount,
        completionRate: totalResponses > 0 
          ? Math.round((approvedCount / (totalResponses * 15)) * 100) 
          : 0,
      },
    });
  } catch (error) {
    console.error("[GET /api/co/survey-link] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to generate survey link" },
      { status: 500 }
    );
  }
}
