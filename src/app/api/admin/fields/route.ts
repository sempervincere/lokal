/**
 * POST /api/admin/fields
 *
 * Validates or rejects a ClusterFieldValue.
 * APPROVE: computes SHA-256 hash → anchors on Solana → marks VALIDATED.
 * REJECT: marks REJECTED with optional reason.
 * Recomputes cluster completeness stats after both actions.
 *
 * Body: { fieldId: string; action: "APPROVE" | "REJECT"; rejectReason?: string }
 * Auth: ADMIN only
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { computeFieldHash } from "@/lib/solana/fieldHash";
import { anchorFieldHashOnChain } from "@/lib/solana/anchorClient";

// Total Tier 1 fields — used to compute dataCompleteness percentage
const TIER_1_TOTAL = 20;

async function getAdminUser(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return null;

  return dbUser;
}

async function recomputeClusterStats(clusterId: string) {
  const validatedCount = await prisma.clusterFieldValue.count({
    where: { clusterId, status: "VALIDATED" },
  });

  const dataCompleteness = Math.round((validatedCount / TIER_1_TOTAL) * 100);
  // Confidence score: completeness × 0.87 factor (reflects validation quality, not just count)
  const confidenceScore = Math.min(Math.round(dataCompleteness * 0.87), 87);

  await prisma.cluster.update({
    where: { id: clusterId },
    data: {
      totalValidatedFields: validatedCount,
      dataCompleteness,
      confidenceScore,
    },
  });

  return { validatedCount, dataCompleteness, confidenceScore };
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Admin access required" },
      { status: 403 }
    );
  }

  let body: { fieldId?: string; action?: string; rejectReason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { fieldId, action, rejectReason } = body;

  if (!fieldId || !action) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "fieldId and action are required" },
      { status: 400 }
    );
  }

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "action must be APPROVE or REJECT" },
      { status: 400 }
    );
  }

  const field = await prisma.clusterFieldValue.findUnique({
    where: { id: fieldId },
    include: { cluster: { select: { id: true, slug: true } } },
  });

  if (!field) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Field not found" },
      { status: 404 }
    );
  }

  if (field.status === "VALIDATED") {
    return NextResponse.json(
      { error: "CONFLICT", message: "Field already validated" },
      { status: 409 }
    );
  }

  // ── REJECT ──────────────────────────────────────────────────────────────
  if (action === "REJECT") {
    const updated = await prisma.clusterFieldValue.update({
      where: { id: fieldId },
      data: {
        status: "REJECTED",
        evidenceNote: rejectReason
          ? `[REJECTED] ${rejectReason}`
          : field.evidenceNote,
      },
    });

    const stats = await recomputeClusterStats(field.clusterId);

    return NextResponse.json({
      ok: true,
      action: "REJECTED",
      field: { id: updated.id, fieldCode: updated.fieldCode, status: updated.status },
      clusterStats: stats,
    });
  }

  // ── APPROVE ─────────────────────────────────────────────────────────────
  const hash = computeFieldHash(field.fieldCode, field.value);

  let solTxSignature: string | null = null;
  let anchorError: string | null = null;

  try {
    solTxSignature = await anchorFieldHashOnChain(
      field.cluster.slug,
      field.fieldCode,
      hash
    );
  } catch (err) {
    // Solana anchor failure must NOT block the DB validation —
    // store the error, mark field validated, admin can re-anchor via T-32 script.
    anchorError =
      err instanceof Error ? err.message : "Unknown anchor error";
    console.error(
      `[POST /api/admin/fields] Anchor failed for ${field.fieldCode}:`,
      anchorError
    );
  }

  const updated = await prisma.clusterFieldValue.update({
    where: { id: fieldId },
    data: {
      status: "VALIDATED",
      fieldHash: hash,
      solTxSignature,
      validatedAt: new Date(),
    },
  });

  const stats = await recomputeClusterStats(field.clusterId);

  return NextResponse.json({
    ok: true,
    action: "VALIDATED",
    field: {
      id: updated.id,
      fieldCode: updated.fieldCode,
      status: updated.status,
      fieldHash: updated.fieldHash,
      solTxSignature: updated.solTxSignature,
      validatedAt: updated.validatedAt,
    },
    clusterStats: stats,
    ...(anchorError ? { anchorWarning: anchorError } : {}),
  });
}
