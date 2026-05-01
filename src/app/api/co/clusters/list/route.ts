/**
 * GET /api/co/clusters/list
 *
 * Returns the authenticated CO's active clusters and pending proposals.
 *
 * Auth: Supabase session + role === 'CLUSTER_OWNER'
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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
    include: {
      clusters: {
        select: {
          id: true,
          slug: true,
          name: true,
          anchorLabel: true,
          status: true,
          confidenceScore: true,
          dataCompleteness: true,
          totalValidatedFields: true,
          anchorLat: true,
          anchorLng: true,
          radiusKm: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!co) {
    return NextResponse.json({
      clusters: [],
      proposals: [],
      hasProfile: false,
    });
  }

  const proposals = await prisma.clusterProposal.findMany({
    where: { coId: co.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    clusters: co.clusters,
    proposals: proposals.map((p) => ({
      id: p.id,
      clusterName: p.clusterName,
      clusterDescription: p.clusterDescription,
      anchorLabel: p.anchorLabel,
      status: p.status,
      occupation: p.occupation,
      areaDuration: p.areaDuration,
      primaryAnchor: p.primaryAnchor,
      adminNote: p.adminNote,
      createdAt: p.createdAt,
    })),
    hasProfile: true,
  });
}
