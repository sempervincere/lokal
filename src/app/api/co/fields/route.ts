/**
 * GET /api/co/fields
 *
 * Returns all Tier 1 field entries for the authenticated Cluster Owner's
 * cluster, including raw field values. If no cluster exists, returns the
 * 20 field definitions with PENDING status and null values.
 *
 * Now includes survey response counts per field.
 *
 * Auth: Supabase session + role === 'CLUSTER_OWNER'
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TIER_1_FIELDS } from "@/lib/constants/field";
import { SURVEY_FIELDS, isBulkAcceptField } from "@/lib/constants/survey-fields";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "CLUSTER_OWNER") {
    return NextResponse.json(
      { error: "CLUSTER_OWNER_REQUIRED" },
      { status: 403 },
    );
  }

  const co = await prisma.clusterOwner.findUnique({
    where: { userId: user.id },
    include: { clusters: { select: { id: true, slug: true }, take: 1 } },
  });

  if (!co || co.clusters.length === 0) {
    // No cluster yet — return field definitions with empty data
    return NextResponse.json({
      clusterSlug: null,
      total: 20,
      validated: 0,
      fields: TIER_1_FIELDS.map((f) => ({
        id: null,
        fieldCode: f.code,
        fieldName: f.name,
        collectionMethod: f.collectionMethod,
        isComplex: f.isComplex,
        tier: f.tier,
        category: f.category,
        status: "PENDING",
        value: null,
        evidencePhotoUrl: null,
        evidenceNote: null,
        fieldHash: null,
        solTxSignature: null,
        submittedAt: null,
        validatedAt: null,
      })),
    });
  }

  const clusterId = co.clusters[0].id;
  const clusterSlug = co.clusters[0].slug;

  const fieldValues = await prisma.clusterFieldValue.findMany({
    where: { clusterId },
    orderBy: { fieldCode: "asc" },
    select: {
      id: true, fieldCode: true, fieldName: true, collectionMethod: true,
      isComplex: true, tier: true, category: true, status: true, value: true,
      evidencePhotoUrl: true, evidenceNote: true, fieldHash: true,
      solTxSignature: true, submittedAt: true, validatedAt: true,
    },
  });

  // Merge DB fields with field definitions (some codes may be missing if not yet submitted)
  const dbMap = new Map(fieldValues.map(f => [f.fieldCode, f]));
  const fields = TIER_1_FIELDS.map((def) => {
    const db = dbMap.get(def.code);
    return db ? {
      id: db.id,
      fieldCode: db.fieldCode,
      fieldName: db.fieldName,
      collectionMethod: db.collectionMethod,
      isComplex: db.isComplex,
      tier: db.tier,
      category: db.category,
      status: db.status,
      value: db.value,
      evidencePhotoUrl: db.evidencePhotoUrl,
      evidenceNote: db.evidenceNote,
      fieldHash: db.fieldHash,
      solTxSignature: db.solTxSignature,
      submittedAt: db.submittedAt,
      validatedAt: db.validatedAt,
    } : {
      id: null,
      fieldCode: def.code,
      fieldName: def.name,
      collectionMethod: def.collectionMethod,
      isComplex: def.isComplex,
      tier: def.tier,
      category: def.category,
      status: "PENDING",
      value: null,
      evidencePhotoUrl: null,
      evidenceNote: null,
      fieldHash: null,
      solTxSignature: null,
      submittedAt: null,
      validatedAt: null,
    };
  });

  const validatedCount = fields.filter(f => f.status === "VALIDATED").length;

  // Get survey response counts per field
  const surveyFieldCodes = SURVEY_FIELDS.map(f => f.code);
  const surveyResponseCounts = await prisma.surveyFieldResponse.groupBy({
    by: ["fieldCode", "coStatus"],
    where: {
      fieldCode: { in: surveyFieldCodes },
      surveyResponse: {
        clusterId,
        status: "SUBMITTED",
      },
    },
    _count: true,
  });

  // Build survey response stats per field
  const surveyStats: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {};
  for (const stat of surveyResponseCounts) {
    if (!surveyStats[stat.fieldCode]) {
      surveyStats[stat.fieldCode] = { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    surveyStats[stat.fieldCode].total += stat._count;
    if (stat.coStatus === "PENDING") surveyStats[stat.fieldCode].pending = stat._count;
    if (stat.coStatus === "APPROVED") surveyStats[stat.fieldCode].approved = stat._count;
    if (stat.coStatus === "REJECTED") surveyStats[stat.fieldCode].rejected = stat._count;
  }

  // Generate survey link
  const surveyToken = `cluster-${clusterId}-survey`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lokal.id";
  const surveyLink = `${baseUrl}/survey/${clusterSlug}?token=${surveyToken}`;

  // Merge survey stats with field data
  const fieldsWithSurveyStats = fields.map(field => {
    const surveyStat = surveyStats[field.fieldCode];
    const isSurveyField = surveyFieldCodes.includes(field.fieldCode);
    
    return {
      ...field,
      isSurveyField,
      surveyResponses: surveyStat || { total: 0, pending: 0, approved: 0, rejected: 0 },
      canBulkAccept: isBulkAcceptField(field.fieldCode),
    };
  });

  return NextResponse.json({
    clusterSlug,
    total: fields.length,
    validated: validatedCount,
    surveyLink,
    surveyToken,
    fields: fieldsWithSurveyStats,
  });
}
