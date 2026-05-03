/**
 * POST /api/co/survey-responses/bulk-accept
 * 
 * Bulk accept all pending responses for a specific field.
 * Only allowed for fields in BULK_ACCEPT_FIELD_CODES (D1-D3, B2, B4, B5, C1, C3).
 * 
 * Body:
 * - fieldCode: string (required) - The field code to bulk accept
 * 
 * Auth: CLUSTER_OWNER only
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isBulkAcceptField, SURVEY_FIELDS } from "@/lib/constants/survey-fields";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fieldCode } = body;

    // Validate field code
    if (!fieldCode) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "fieldCode is required" },
        { status: 400 }
      );
    }

    // Check if field supports bulk accept
    if (!isBulkAcceptField(fieldCode)) {
      return NextResponse.json(
        { 
          error: "BAD_REQUEST", 
          message: `Field ${fieldCode} does not support bulk accept. Only D1-D3, B2, B4, B5, C1, C3 support bulk accept.` 
        },
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

    // Find all pending responses for this field
    const pendingResponses = await prisma.surveyFieldResponse.findMany({
      where: {
        fieldCode,
        coStatus: "PENDING",
        surveyResponse: {
          clusterId,
          status: "SUBMITTED",
        },
      },
      include: {
        surveyResponse: {
          select: {
            id: true,
            respondentWallet: true,
          },
        },
      },
    });

    if (pendingResponses.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No pending responses to accept",
        acceptedCount: 0,
      });
    }

    // Bulk accept all pending responses in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update all pending responses to APPROVED
      const updated = await tx.surveyFieldResponse.updateMany({
        where: {
          id: { in: pendingResponses.map(r => r.id) },
        },
        data: {
          coStatus: "APPROVED",
          reviewedAt: new Date(),
        },
      });

      // Aggregate values for each response
      for (const response of pendingResponses) {
        await aggregateApprovedValue(tx, clusterId, fieldCode, response.value);
      }

      // Check if all fields for each survey response are now reviewed
      const surveyResponseIds = Array.from(new Set(pendingResponses.map(r => r.surveyResponseId)));
      
      for (const surveyResponseId of surveyResponseIds) {
        const allFields = await tx.surveyFieldResponse.findMany({
          where: { surveyResponseId },
        });

        const allReviewed = allFields.every(f => f.coStatus !== "PENDING");
        
        if (allReviewed) {
          await tx.surveyResponse.update({
            where: { id: surveyResponseId },
            data: { status: "REVIEWED", reviewedAt: new Date() },
          });

          // Create vault claim for this respondent
          const approvedFields = allFields.filter(f => f.coStatus === "APPROVED");
          if (approvedFields.length > 0) {
            const respondentWallet = pendingResponses.find(r => r.surveyResponseId === surveyResponseId)?.surveyResponse.respondentWallet;
            if (respondentWallet) {
              await createVaultClaim(tx, clusterId, respondentWallet, approvedFields);
            }
          }
        }
      }

      return { acceptedCount: updated.count };
    });

    return NextResponse.json({
      ok: true,
      message: `Bulk accepted ${result.acceptedCount} responses for field ${fieldCode}`,
      acceptedCount: result.acceptedCount,
    });
  } catch (error) {
    console.error("[POST /api/co/survey-responses/bulk-accept] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to bulk accept responses" },
      { status: 500 }
    );
  }
}

/**
 * Aggregate approved survey value into ClusterFieldValue
 */
async function aggregateApprovedValue(tx: any, clusterId: string, fieldCode: string, value: any) {
  // Find or create the ClusterFieldValue
  const existing = await tx.clusterFieldValue.findUnique({
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

    await tx.clusterFieldValue.update({
      where: { id: existing.id },
      data: {
        value: { responses, aggregated },
      },
    });
  } else {
    // Create new
    const fieldDef = SURVEY_FIELDS.find(f => f.code === fieldCode);
    const aggregated = calculateAggregation(fieldCode, [{ value, approvedAt: new Date() }]);

    await tx.clusterFieldValue.create({
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

  switch (fieldCode) {
    case 'D1':
    case 'D2':
    case 'D3':
    case 'B3':
    case 'B4':
    case 'B5':
    case 'MS1':
    case 'C1':
    case 'C4':
      const distribution: Record<string, number> = {};
      for (const val of values) {
        const key = typeof val === 'string' ? val : String(val);
        distribution[key] = (distribution[key] || 0) + 1;
      }
      const dominant = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0];
      return { distribution, dominant, total: values.length };

    case 'B2':
      const numValues = values.map(v => typeof v === 'number' ? v : parseInt(v)).filter(n => !isNaN(n));
      const avg = numValues.reduce((a, b) => a + b, 0) / numValues.length;
      return { average: Math.round(avg * 10) / 10, min: Math.min(...numValues), max: Math.max(...numValues), total: numValues.length };

    case 'B1':
    case 'M2':
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

    case 'M3':
      const allCompetitors: string[] = [];
      for (const val of values) {
        if (Array.isArray(val)) allCompetitors.push(...val);
        else if (typeof val === 'string') allCompetitors.push(val);
      }
      const competitorCount: Record<string, number> = {};
      for (const name of allCompetitors) {
        competitorCount[name] = (competitorCount[name] || 0) + 1;
      }
      const topCompetitors = Object.entries(competitorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, mentions: count }));
      return { topCompetitors, totalMentions: allCompetitors.length };

    case 'C3':
      const occasionCount: Record<string, number> = {};
      for (const val of values) {
        if (Array.isArray(val)) {
          for (const occasion of val) {
            occasionCount[occasion] = (occasionCount[occasion] || 0) + 1;
          }
        }
      }
      return { distribution: occasionCount, total: values.length };

    case 'MS2':
      return { responses: values, total: values.length };

    default:
      return { raw: values, total: values.length };
  }
}

/**
 * Create or update vault claim for a respondent
 */
async function createVaultClaim(tx: any, clusterId: string, respondentWallet: string, approvedFields: any[]) {
  // Get or create vault for this cluster
  let vault = await tx.clusterVault.findUnique({
    where: { clusterId },
  });

  if (!vault) {
    vault = await tx.clusterVault.create({
      data: { clusterId, totalPool: 0, distributed: 0 },
    });
  }

  const fieldCodes = approvedFields.map(f => f.fieldCode);

  // Check if claim already exists
  const existingClaim = await tx.vaultClaim.findFirst({
    where: {
      vaultId: vault.id,
      respondentWallet,
    },
  });

  if (existingClaim) {
    const mergedFieldCodes = Array.from(new Set([...existingClaim.fieldCodes, ...fieldCodes]));
    await tx.vaultClaim.update({
      where: { id: existingClaim.id },
      data: {
        fieldCodes: mergedFieldCodes,
        approvedCount: existingClaim.approvedCount + approvedFields.length,
      },
    });
  } else {
    await tx.vaultClaim.create({
      data: {
        vaultId: vault.id,
        surveyResponseId: approvedFields[0].surveyResponseId,
        respondentWallet,
        fieldCodes,
        approvedCount: approvedFields.length,
        amount: 0,
        status: "PENDING",
      },
    });
  }
}
