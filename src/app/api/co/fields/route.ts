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

/**
 * POST /api/co/fields
 *
 * Submit or update a ClusterFieldValue for a non-survey field.
 * Only CLUSTER_OWNER can submit for their own cluster.
 *
 * Body:
 * - fieldCode: string (required, must be non-survey field)
 * - value: any (JSON, required)
 * - evidenceNote?: string
 * - evidencePhotoUrl?: string
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TIER_1_FIELDS, TIER_1_FIELD_CODES } from "@/lib/constants/field";
import { SURVEY_FIELDS, isBulkAcceptField } from "@/lib/constants/survey-fields";

/* ═══════════════════════════════════════════════════════════════════════════
   GET
   ═══════════════════════════════════════════════════════════════════════════ */

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
    include: { clusters: { select: { id: true, slug: true, name: true }, orderBy: { createdAt: 'desc' } } },
  });

  // Parse clusterSlug from query params
  const { searchParams } = new URL(request.url);
  const clusterSlugFilter = searchParams.get("clusterSlug");

  if (!co || co.clusters.length === 0) {
    // No cluster yet — return field definitions with empty data
    return NextResponse.json({
      clusterSlug: null,
      clusters: [],
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

  const cluster = clusterSlugFilter
    ? co.clusters.find(c => c.slug === clusterSlugFilter)
    : co.clusters[0];

  if (!cluster) {
    return NextResponse.json(
      { error: "CLUSTER_NOT_FOUND", message: "Cluster tidak ditemukan" },
      { status: 404 }
    );
  }

  const clusterId = cluster.id;
  const clusterSlug = cluster.slug;

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
    clusters: co.clusters.map(c => ({ id: c.id, slug: c.slug, name: c.name })),
    total: fields.length,
    validated: validatedCount,
    surveyLink,
    surveyToken,
    fields: fieldsWithSurveyStats,
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   POST
   ═══════════════════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "CLUSTER_OWNER") {
      return NextResponse.json({ error: "CLUSTER_OWNER_REQUIRED" }, { status: 403 });
    }

    const co = await prisma.clusterOwner.findUnique({
      where: { userId: user.id },
      include: { clusters: { select: { id: true, slug: true, name: true }, orderBy: { createdAt: 'desc' } } },
    });

    if (!co || co.clusters.length === 0) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "No cluster found for this CO" },
        { status: 403 }
      );
    }

    // For now, use the first cluster (or we could accept clusterSlug in body)
    const cluster = co.clusters[0];
    const clusterId = cluster.id;

    const body = await request.json();
    const { fieldCode, value, evidenceNote, evidencePhotoUrl } = body;

    // Validate required fields
    if (!fieldCode || value === undefined || value === null) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "fieldCode and value are required" },
        { status: 400 }
      );
    }

    // Validate field code
    const fieldDef = TIER_1_FIELD_CODES[fieldCode];
    if (!fieldDef) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: `Invalid field code: ${fieldCode}` },
        { status: 400 }
      );
    }

    // Only allow non-survey fields (OBSERVATION or RESEARCH)
    if (fieldDef.collectionMethod === "SURVEY") {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Survey fields cannot be submitted directly. They are filled by respondents." },
        { status: 400 }
      );
    }

    // Check if field already exists and is VALIDATED
    const existing = await prisma.clusterFieldValue.findUnique({
      where: { clusterId_fieldCode: { clusterId, fieldCode } },
    });

    if (existing && existing.status === "VALIDATED") {
      return NextResponse.json(
        { error: "CONFLICT", message: "This field has already been validated and cannot be modified." },
        { status: 409 }
      );
    }

    // Upsert the field value
    const upserted = await prisma.clusterFieldValue.upsert({
      where: { clusterId_fieldCode: { clusterId, fieldCode } },
      update: {
        value,
        evidenceNote: evidenceNote || null,
        evidencePhotoUrl: evidencePhotoUrl || null,
        status: "PENDING",
        submittedAt: new Date(),
      },
      create: {
        clusterId,
        fieldCode,
        fieldName: fieldDef.name,
        tier: fieldDef.tier,
        category: fieldDef.category,
        collectionMethod: fieldDef.collectionMethod,
        isComplex: fieldDef.isComplex,
        value,
        evidenceNote: evidenceNote || null,
        evidencePhotoUrl: evidencePhotoUrl || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ok: true,
      field: {
        id: upserted.id,
        fieldCode: upserted.fieldCode,
        fieldName: upserted.fieldName,
        status: upserted.status,
        collectionMethod: upserted.collectionMethod,
        submittedAt: upserted.submittedAt,
      },
    });
  } catch (error) {
    console.error("[POST /api/co/fields] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to submit field" },
      { status: 500 }
    );
  }
}
