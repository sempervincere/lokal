/**
 * GET /api/admin/proposals  +  POST /api/admin/proposals
 *
 * GET: Lists cluster proposals with optional status filter.
 * POST: Approve or reject a proposal.
 *   - APPROVE: creates Cluster from proposal data, updates proposal status.
 *   - REJECT: updates proposal status + stores admin reason.
 *
 * Auth: ADMIN only (TEMPORARILY BYPASSED)
 */

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  const proposals = await prisma.clusterProposal.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    include: {
      clusterOwner: {
        select: {
          id: true,
          user: {
            select: { fullName: true, email: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ proposals });
}

// ── POST ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: {
    proposalId?: string;
    action?: "APPROVE" | "REJECT";
    rejectReason?: string;
    initOnChain?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { proposalId, action, rejectReason, initOnChain = false } = body;

  if (!proposalId || !action) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "proposalId and action are required" },
      { status: 400 }
    );
  }

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "action must be APPROVE or REJECT" },
      { status: 400 }
    );
  }

  const proposal = await prisma.clusterProposal.findUnique({
    where: { id: proposalId },
    include: {
      clusterOwner: {
        select: { id: true, user: { select: { fullName: true } } },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Proposal not found" },
      { status: 404 }
    );
  }

  if (proposal.status !== "PENDING") {
    return NextResponse.json(
      { error: "CONFLICT", message: `Proposal already ${proposal.status}` },
      { status: 409 }
    );
  }

  // ── REJECT ──────────────────────────────────────────────────────────────
  if (action === "REJECT") {
    if (!rejectReason?.trim()) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "rejectReason is required for rejection" },
        { status: 400 }
      );
    }

    const updated = await prisma.clusterProposal.update({
      where: { id: proposalId },
      data: {
        status: "REJECTED",
        adminNote: rejectReason.trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      action: "REJECTED",
      proposal: {
        id: updated.id,
        status: updated.status,
        adminNote: updated.adminNote,
      },
    });
  }

  // ── APPROVE ─────────────────────────────────────────────────────────────
  // Generate slug from cluster name
  const baseSlug = proposal.clusterName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug = baseSlug;
  let suffix = 1;

  // Ensure unique slug
  while (await prisma.cluster.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const cluster = await prisma.cluster.create({
    data: {
      slug,
      name: proposal.clusterName,
      description: proposal.clusterDescription,
      anchorLat: proposal.anchorLat,
      anchorLng: proposal.anchorLng,
      anchorLabel: proposal.anchorLabel,
      radiusKm: proposal.radiusKm || 1.5,
      ownerId: proposal.coId,
      status: "SEEDING",
    },
  });

  const updatedProposal = await prisma.clusterProposal.update({
    where: { id: proposalId },
    data: {
      status: "APPROVED",
      adminNote: `Cluster created: ${cluster.name} (${cluster.slug})`,
    },
  });

  return NextResponse.json({
    ok: true,
    action: "APPROVED",
    proposal: {
      id: updatedProposal.id,
      status: updatedProposal.status,
    },
    cluster: {
      id: cluster.id,
      slug: cluster.slug,
      name: cluster.name,
      status: cluster.status,
    },
  });
}
