/**
 * GET /api/admin/survey-responses
 *
 * Returns all survey field responses across all clusters for admin audit.
 * Supports filtering by cluster, field code, and review status.
 *
 * Query params:
 * - clusterId: Filter by cluster (optional)
 * - fieldCode: Filter by field code (optional)
 * - status: PENDING | APPROVED | REJECTED (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SURVEY_FIELDS, isBulkAcceptField } from "@/lib/constants/survey-fields";

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
    const clusterId = searchParams.get("clusterId");
    const fieldCode = searchParams.get("fieldCode");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (fieldCode) where.fieldCode = fieldCode;
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      where.coStatus = status;
    }

    // Filter by cluster through surveyResponse relation
    const surveyWhere: any = { status: "SUBMITTED" };
    if (clusterId) surveyWhere.clusterId = clusterId;

    where.surveyResponse = surveyWhere;

    // Fetch responses with pagination
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
              cluster: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: [{ coStatus: "asc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
      }),
      prisma.surveyFieldResponse.count({ where }),
    ]);

    // Get all clusters for filter dropdown
    const clusters = await prisma.cluster.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
    });

    // Compute stats
    const allStats = await prisma.surveyFieldResponse.groupBy({
      by: ["fieldCode", "coStatus"],
      where: { surveyResponse: { status: "SUBMITTED" } },
      _count: true,
    });

    const fieldStatsMap: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {};
    for (const stat of allStats) {
      if (!fieldStatsMap[stat.fieldCode]) {
        fieldStatsMap[stat.fieldCode] = { total: 0, pending: 0, approved: 0, rejected: 0 };
      }
      fieldStatsMap[stat.fieldCode].total += stat._count;
      if (stat.coStatus === "PENDING") fieldStatsMap[stat.fieldCode].pending += stat._count;
      if (stat.coStatus === "APPROVED") fieldStatsMap[stat.fieldCode].approved += stat._count;
      if (stat.coStatus === "REJECTED") fieldStatsMap[stat.fieldCode].rejected += stat._count;
    }

    const fieldStats = Object.entries(fieldStatsMap).map(([code, stats]) => {
      const fieldDef = SURVEY_FIELDS.find(f => f.code === code);
      const rejectionRate = stats.total > 0 ? stats.rejected / stats.total : 0;
      return {
        fieldCode: code,
        fieldName: fieldDef?.question || code,
        category: fieldDef?.category || "UNKNOWN",
        ...stats,
        rejectionRate,
        thresholdExceeded: rejectionRate > 0.15,
        canBulkAccept: isBulkAcceptField(code),
      };
    }).sort((a, b) => b.rejectionRate - a.rejectionRate);

    // Overall stats
    const totalPending = fieldStats.reduce((sum, f) => sum + f.pending, 0);
    const totalApproved = fieldStats.reduce((sum, f) => sum + f.approved, 0);
    const totalRejected = fieldStats.reduce((sum, f) => sum + f.rejected, 0);
    const fieldsOverThreshold = fieldStats.filter(f => f.thresholdExceeded).length;

    return NextResponse.json({
      stats: {
        total: totalPending + totalApproved + totalRejected,
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
        fieldsOverThreshold,
      },
      fieldStats,
      clusters,
      responses: fieldResponses.map(fr => ({
        id: fr.id,
        fieldCode: fr.fieldCode,
        fieldName: SURVEY_FIELDS.find(f => f.code === fr.fieldCode)?.question || fr.fieldCode,
        category: SURVEY_FIELDS.find(f => f.code === fr.fieldCode)?.category || "UNKNOWN",
        value: fr.value,
        coStatus: fr.coStatus,
        coRejectReason: fr.coRejectReason,
        reviewedAt: fr.reviewedAt,
        createdAt: fr.createdAt,
        canBulkAccept: isBulkAcceptField(fr.fieldCode),
        respondent: {
          wallet: fr.surveyResponse.respondentWallet,
          email: fr.surveyResponse.respondentEmail,
          submittedAt: fr.surveyResponse.submittedAt,
        },
        cluster: fr.surveyResponse.cluster,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/survey-responses] Error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
