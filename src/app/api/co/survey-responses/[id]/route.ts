/**
 * PATCH /api/co/survey-responses/[id]
 * 
 * Approve or reject an individual survey field response.
 * 
 * Body:
 * - action: "APPROVE" | "REJECT" (required)
 * - rejectReason: string (required if action is "REJECT")
 * 
 * Auth: CLUSTER_OWNER only (must own the cluster)
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isRejectionThresholdExceeded } from "@/lib/constants/pricing";
import { SURVEY_FIELDS } from "@/lib/constants/survey-fields";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, rejectReason } = body;

    // Validate action
    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "action must be APPROVE or REJECT" },
        { status: 400 }
      );
    }

    // Validate reject reason
    if (action === "REJECT" && (!rejectReason || rejectReason.trim().length === 0)) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "rejectReason is required when rejecting" },
        { status: 400 }
      );
    }

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
      include: { clusters: { select: { id: true }, take: 1 } },
    });

    if (!co || co.clusters.length === 0) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "No cluster found for this CO" },
        { status: 403 }
      );
    }

    const clusterId = co.clusters[0].id;

    // Find the field response
    const fieldResponse = await prisma.surveyFieldResponse.findUnique({
      where: { id },
      include: {
        surveyResponse: {
          select: {
            id: true,
            clusterId: true,
            respondentWallet: true,
          },
        },
      },
    });

    if (!fieldResponse) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Field response not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (fieldResponse.surveyResponse.clusterId !== clusterId) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "This response belongs to a different cluster" },
        { status: 403 }
      );
    }

    // Check if already reviewed
    if (fieldResponse.coStatus !== "PENDING") {
      return NextResponse.json(
        { error: "CONFLICT", message: "This response has already been reviewed" },
        { status: 409 }
      );
    }

    // Check rejection threshold before allowing rejection
    if (action === "REJECT") {
      const fieldStats = await prisma.surveyFieldResponse.groupBy({
        by: ["coStatus"],
        where: {
          fieldCode: fieldResponse.fieldCode,
          surveyResponse: {
            clusterId,
            status: "SUBMITTED",
          },
        },
        _count: true,
      });

      const totalReviewed = fieldStats.reduce((sum, s) => sum + s._count, 0);
      const rejectedCount = fieldStats.find(s => s.coStatus === "REJECTED")?._count || 0;

      if (isRejectionThresholdExceeded(rejectedCount + 1, totalReviewed + 1)) {
        return NextResponse.json({
          ok: true,
          warning: "REJECTION_THRESHOLD_EXCEEDED",
          message: "Rejection rate exceeds 15% threshold. Admin will be notified for review.",
          // Still allow the rejection, but flag it
        });
      }
    }

    // Update the field response
    const updated = await prisma.surveyFieldResponse.update({
      where: { id },
      data: {
        coStatus: action === "APPROVE" ? "APPROVED" : "REJECTED",
        coRejectReason: action === "REJECT" ? rejectReason : null,
        reviewedAt: new Date(),
      },
    });

    // If approved, aggregate the value into ClusterFieldValue
    if (action === "APPROVE") {
      await aggregateApprovedValue(clusterId, fieldResponse.fieldCode, fieldResponse.value);
    }

    // Check if all fields for this survey response are reviewed
    const allFields = await prisma.surveyFieldResponse.findMany({
      where: { surveyResponseId: fieldResponse.surveyResponseId },
    });

    const allReviewed = allFields.every(f => f.coStatus !== "PENDING");
    
    if (allReviewed) {
      // Update survey response status
      await prisma.surveyResponse.update({
        where: { id: fieldResponse.surveyResponseId },
        data: { status: "REVIEWED", reviewedAt: new Date() },
      });

      // Create vault claim for this respondent
      const approvedFields = allFields.filter(f => f.coStatus === "APPROVED");
      if (approvedFields.length > 0) {
        await createVaultClaim(clusterId, fieldResponse.surveyResponse.respondentWallet, approvedFields);
      }
    }

    return NextResponse.json({
      ok: true,
      action,
      fieldResponse: {
        id: updated.id,
        fieldCode: updated.fieldCode,
        coStatus: updated.coStatus,
        coRejectReason: updated.coRejectReason,
        reviewedAt: updated.reviewedAt,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/co/survey-responses/[id]] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to update field response" },
      { status: 500 }
    );
  }
}

/**
 * Aggregate approved survey value into ClusterFieldValue
 */
async function aggregateApprovedValue(clusterId: string, fieldCode: string, value: any) {
  // Find or create the ClusterFieldValue
  const existing = await prisma.clusterFieldValue.findUnique({
    where: {
      clusterId_fieldCode: { clusterId, fieldCode },
    },
  });

  if (existing) {
    // Update existing - append to responses array
    const currentValue = existing.value as any;
    const responses = Array.isArray(currentValue?.responses) ? currentValue.responses : [];
    responses.push({ value, approvedAt: new Date() });

    // Calculate aggregated data
    const aggregated = calculateAggregation(fieldCode, responses);

    await prisma.clusterFieldValue.update({
      where: { id: existing.id },
      data: {
        value: { responses, aggregated },
      },
    });
  } else {
    // Create new
    const fieldDef = SURVEY_FIELDS.find(f => f.code === fieldCode);
    const aggregated = calculateAggregation(fieldCode, [{ value, approvedAt: new Date() }]);

    await prisma.clusterFieldValue.create({
      data: {
        clusterId,
        fieldCode,
        fieldName: fieldDef?.question || fieldCode,
        tier: 1,
        category: fieldDef?.category || "UNKNOWN",
        collectionMethod: "SURVEY",
        isComplex: true,
        value: {
          responses: [{ value, approvedAt: new Date() }],
          aggregated,
        },
        status: "PENDING", // Still needs admin validation
      },
    });
  }
}

/**
 * Calculate aggregated data for a field based on all approved responses
 */
function calculateAggregation(fieldCode: string, responses: any[]): any {
  const values = responses.map(r => r.value);

  // Different aggregation based on field type
  switch (fieldCode) {
    case 'D1': // Age distribution
    case 'D2': // Income distribution
    case 'D3': // Occupation mix
    case 'B3': // Peak hours
    case 'B4': // Payment method
    case 'B5': // Dine-in vs delivery
    case 'MS1': // Foot traffic
    case 'C1': // Halal sensitivity
    case 'C4': // Transport access
      // Calculate distribution
      const distribution: Record<string, number> = {};
      for (const val of values) {
        const key = typeof val === 'string' ? val : String(val);
        distribution[key] = (distribution[key] || 0) + 1;
      }
      const dominant = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0];
      return { distribution, dominant, total: values.length };

    case 'B2': // Price sensitivity (scale 1-10)
      const numValues = values.map(v => typeof v === 'number' ? v : parseInt(v)).filter(n => !isNaN(n));
      const avg = numValues.reduce((a, b) => a + b, 0) / numValues.length;
      return { average: Math.round(avg * 10) / 10, min: Math.min(...numValues), max: Math.max(...numValues), total: numValues.length };

    case 'B1': // Max willingness to pay (category prices)
    case 'M2': // Average price (category prices)
      // Aggregate by category
      const categoryPrices: Record<string, number[]> = {};
      for (const val of values) {
        if (typeof val === 'object' && val !== null) {
          for (const [cat, price] of Object.entries(val)) {
            if (!categoryPrices[cat]) categoryPrices[cat] = [];
            if (typeof price === 'number') categoryPrices[cat].push(price);
          }
        }
      }
      const categoryAvg: Record<string, { avg: number; min: number; max: number }> = {};
      for (const [cat, prices] of Object.entries(categoryPrices)) {
        categoryAvg[cat] = {
          avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          min: Math.min(...prices),
          max: Math.max(...prices),
        };
      }
      return { byCategory: categoryAvg, totalResponses: values.length };

    case 'M3': // Top competitors (text list)
      const allCompetitors: string[] = [];
      for (const val of values) {
        if (Array.isArray(val)) allCompetitors.push(...val);
        else if (typeof val === 'string') allCompetitors.push(val);
      }
      // Count frequency
      const competitorCount: Record<string, number> = {};
      for (const name of allCompetitors) {
        competitorCount[name] = (competitorCount[name] || 0) + 1;
      }
      const topCompetitors = Object.entries(competitorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, mentions: count }));
      return { topCompetitors, totalMentions: allCompetitors.length };

    case 'C3': // Dining occasions (multi-select)
      const occasionCount: Record<string, number> = {};
      for (const val of values) {
        if (Array.isArray(val)) {
          for (const occasion of val) {
            occasionCount[occasion] = (occasionCount[occasion] || 0) + 1;
          }
        }
      }
      return { distribution: occasionCount, total: values.length };

    case 'MS2': // Market gap (text)
      return { responses: values, total: values.length };

    default:
      return { raw: values, total: values.length };
  }
}

/**
 * Create or update vault claim for a respondent
 */
async function createVaultClaim(clusterId: string, respondentWallet: string, approvedFields: any[]) {
  // Get or create vault for this cluster
  let vault = await prisma.clusterVault.findUnique({
    where: { clusterId },
  });

  if (!vault) {
    vault = await prisma.clusterVault.create({
      data: { clusterId, totalPool: 0, distributed: 0 },
    });
  }

  // Calculate reward amount per field
  // For now, we'll use a simple equal distribution model
  // The actual distribution happens when BO pays for a session
  const fieldCodes = approvedFields.map(f => f.fieldCode);

  // Check if claim already exists
  const existingClaim = await prisma.vaultClaim.findFirst({
    where: {
      vaultId: vault.id,
      respondentWallet,
    },
  });

  if (existingClaim) {
    // Update existing claim
    const mergedFieldCodes = Array.from(new Set([...existingClaim.fieldCodes, ...fieldCodes]));
    await prisma.vaultClaim.update({
      where: { id: existingClaim.id },
      data: {
        fieldCodes: mergedFieldCodes,
        approvedCount: existingClaim.approvedCount + approvedFields.length,
      },
    });
  } else {
    // Create new claim
    await prisma.vaultClaim.create({
      data: {
        vaultId: vault.id,
        surveyResponseId: approvedFields[0].surveyResponseId,
        respondentWallet,
        fieldCodes,
        approvedCount: approvedFields.length,
        amount: 0, // Will be calculated when vault is funded
        status: "PENDING",
      },
    });
  }
}
