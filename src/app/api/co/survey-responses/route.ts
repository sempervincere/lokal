/**
 * GET /api/co/survey-responses
 * 
 * Returns all survey responses for the authenticated CO's cluster.
 * Supports filtering by field code and review status.
 * 
 * Query params:
 * - fieldCode: Filter by specific field code (optional)
 * - status: Filter by review status - PENDING, APPROVED, REJECTED (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 * 
 * Auth: CLUSTER_OWNER only
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SURVEY_FIELDS, isBulkAcceptField } from "@/lib/constants/survey-fields";
import { isRejectionThresholdExceeded } from "@/lib/constants/pricing";

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

    // Get CO's clusters
    const co = await prisma.clusterOwner.findUnique({
      where: { userId: user.id },
      include: { clusters: { select: { id: true, slug: true, name: true }, orderBy: { createdAt: 'desc' } } },
    });

    if (!co || co.clusters.length === 0) {
      return NextResponse.json({
        cluster: null,
        clusters: [],
        responses: [],
        stats: {},
      });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const clusterSlugFilter = searchParams.get("clusterSlug");

    // Find target cluster: by slug if provided, else first cluster
    const cluster = clusterSlugFilter
      ? co.clusters.find(c => c.slug === clusterSlugFilter)
      : co.clusters[0];

    if (!cluster) {
      return NextResponse.json(
        { error: "CLUSTER_NOT_FOUND", message: "Cluster tidak ditemukan" },
        { status: 404 }
      );
    }

    const fieldCodeFilter = searchParams.get("fieldCode");
    const statusFilter = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      surveyResponse: {
        clusterId: cluster.id,
        status: "SUBMITTED",
      },
    };

    if (fieldCodeFilter) {
      where.fieldCode = fieldCodeFilter;
    }

    if (statusFilter && ["PENDING", "APPROVED", "REJECTED"].includes(statusFilter)) {
      where.coStatus = statusFilter;
    }

    // Get field responses with pagination
    const [fieldResponses, total] = await Promise.all([
      prisma.surveyFieldResponse.findMany({
        where,
        include: {
          surveyResponse: {
            select: {
              id: true,
              respondentWallet: true,
              respondentEmail: true,
              submittedAt: true,
            },
          },
        },
        orderBy: [
          { fieldCode: "asc" },
          { createdAt: "desc" },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.surveyFieldResponse.count({ where }),
    ]);

    // Get stats per field
    const fieldStats = await prisma.surveyFieldResponse.groupBy({
      by: ["fieldCode", "coStatus"],
      where: {
        surveyResponse: {
          clusterId: cluster.id,
          status: "SUBMITTED",
        },
      },
      _count: true,
    });

    // Organize stats by field code
    const statsByField: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {};
    
    for (const stat of fieldStats) {
      if (!statsByField[stat.fieldCode]) {
        statsByField[stat.fieldCode] = { total: 0, pending: 0, approved: 0, rejected: 0 };
      }
      statsByField[stat.fieldCode].total += stat._count;
      if (stat.coStatus === "PENDING") statsByField[stat.fieldCode].pending = stat._count;
      if (stat.coStatus === "APPROVED") statsByField[stat.fieldCode].approved = stat._count;
      if (stat.coStatus === "REJECTED") statsByField[stat.fieldCode].rejected = stat._count;
    }

    // Add field definitions and bulk accept flag
    const fieldStatsWithDefs = Object.entries(statsByField).map(([code, stats]) => {
      const fieldDef = SURVEY_FIELDS.find(f => f.code === code);
      return {
        fieldCode: code,
        fieldName: fieldDef?.question || code,
        category: fieldDef?.category || "UNKNOWN",
        ...stats,
        canBulkAccept: isBulkAcceptField(code),
        rejectionRate: stats.total > 0 ? stats.rejected / stats.total : 0,
        thresholdExceeded: isRejectionThresholdExceeded(stats.rejected, stats.total),
      };
    });

    // Get total survey responses count
    const totalSurveyResponses = await prisma.surveyResponse.count({
      where: {
        clusterId: cluster.id,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json({
      cluster: {
        id: cluster.id,
        slug: cluster.slug,
        name: cluster.name,
      },
      clusters: co.clusters.map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
      })),
      surveyLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://lokal.id"}/survey/${cluster.slug}?token=cluster-${cluster.id}-survey`,
      stats: {
        totalResponses: totalSurveyResponses,
        fields: fieldStatsWithDefs,
      },
      responses: fieldResponses.map(fr => ({
        id: fr.id,
        fieldCode: fr.fieldCode,
        value: fr.value,
        coStatus: fr.coStatus,
        coRejectReason: fr.coRejectReason,
        reviewedAt: fr.reviewedAt,
        respondent: {
          wallet: fr.surveyResponse.respondentWallet,
          email: fr.surveyResponse.respondentEmail,
          submittedAt: fr.surveyResponse.submittedAt,
        },
        canBulkAccept: isBulkAcceptField(fr.fieldCode),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/co/survey-responses] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to load survey responses" },
      { status: 500 }
    );
  }
}
