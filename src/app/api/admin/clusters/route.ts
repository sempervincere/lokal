/**
 * POST /api/admin/clusters
 *
 * Creates a new cluster and optionally initializes it on-chain.
 * Admin only.
 *
 * Body: {
 *   slug: string;
 *   name: string;
 *   description?: string;
 *   anchorLat: number;
 *   anchorLng: number;
 *   anchorLabel: string;
 *   radiusKm?: number;       // defaults to 1.5
 *   ownerId: string;         // ClusterOwner.id
 *   initOnChain?: boolean;   // call initializeClusterOnChain (default: false)
 * }
 * Auth: ADMIN only
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { initializeClusterOnChain } from "@/lib/solana/anchorClient";

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

export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Admin access required" },
      { status: 403 }
    );
  }

  let body: {
    slug?: string;
    name?: string;
    description?: string;
    anchorLat?: number;
    anchorLng?: number;
    anchorLabel?: string;
    radiusKm?: number;
    ownerId?: string;
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

  const {
    slug,
    name,
    description,
    anchorLat,
    anchorLng,
    anchorLabel,
    radiusKm = 1.5,
    ownerId,
    initOnChain = false,
  } = body;

  if (!slug || !name || anchorLat === undefined || anchorLng === undefined || !anchorLabel || !ownerId) {
    return NextResponse.json(
      {
        error: "BAD_REQUEST",
        message: "Required: slug, name, anchorLat, anchorLng, anchorLabel, ownerId",
      },
      { status: 400 }
    );
  }

  // Validate slug format: lowercase alphanumeric + hyphens only
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "slug must be lowercase alphanumeric with hyphens only" },
      { status: 400 }
    );
  }

  const owner = await prisma.clusterOwner.findUnique({ where: { id: ownerId } });
  if (!owner) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "ClusterOwner not found" },
      { status: 404 }
    );
  }

  // Duplicate slug check
  const existing = await prisma.cluster.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "CONFLICT", message: `Cluster with slug "${slug}" already exists` },
      { status: 409 }
    );
  }

  const cluster = await prisma.cluster.create({
    data: {
      slug,
      name,
      description,
      anchorLat,
      anchorLng,
      anchorLabel,
      radiusKm,
      ownerId,
      status: "SEEDING",
    },
  });

  // Optional on-chain initialization — non-blocking on failure
  let onchainTx: string | null = null;
  let onchainError: string | null = null;

  if (initOnChain) {
    try {
      onchainTx = await initializeClusterOnChain(slug, name);
      await prisma.cluster.update({
        where: { id: cluster.id },
        data: { onchainSlug: slug },
      });
    } catch (err) {
      onchainError = err instanceof Error ? err.message : "Unknown error";
      console.error("[POST /api/admin/clusters] On-chain init failed:", onchainError);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      cluster: {
        id: cluster.id,
        slug: cluster.slug,
        name: cluster.name,
        status: cluster.status,
      },
      ...(onchainTx ? { onchainTx } : {}),
      ...(onchainError ? { onchainWarning: onchainError } : {}),
    },
    { status: 201 }
  );
}
