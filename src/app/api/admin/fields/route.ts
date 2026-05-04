/**
 * POST /api/admin/fields  +  GET /api/admin/fields
 *
 * POST: Validates or rejects a ClusterFieldValue.
 * GET:  Lists all fields with optional filters and sorting.
 *
 * Auth: ADMIN only (TEMPORARILY BYPASSED for preview)
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { computeFieldHash } from "@/lib/solana/fieldHash";
import { anchorFieldHashOnChain } from "@/lib/solana/anchorClient";

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

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // TEMPORARY: bypass admin check for UI preview
  // const admin = await getAdminUser(request);
  // if (!admin) { ... }

  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status") || undefined;
  const clusterId = searchParams.get("clusterId") || undefined;
  const fieldCode = searchParams.get("fieldCode") || undefined;
  const sort = searchParams.get("sort") || "submittedAt";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";

  const validSortFields = ["submittedAt", "validatedAt", "fieldCode"];
  const sortField = validSortFields.includes(sort) ? sort : "submittedAt";

  const [fields, clusters] = await Promise.all([
    prisma.clusterFieldValue.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(clusterId ? { clusterId } : {}),
        ...(fieldCode ? { fieldCode } : {}),
      },
      orderBy: { [sortField]: order },
      include: {
        cluster: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: {
              select: {
                user: {
                  select: { fullName: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.cluster.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ fields, clusters });
}

// ── POST ───────────────────────────────────────────────────────────────────

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
    anchorError =
      err instanceof Error ? err.message : "Unknown anchor error";
    console.error(
      `[POST /api/admin/fields] Anchor failed for ${field.fieldCode}:`
      , anchorError
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
