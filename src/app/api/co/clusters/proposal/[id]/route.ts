/**
 * GET + PATCH /api/co/clusters/proposal/[id]
 *
 * GET: Returns a single proposal (CO ownership verified).
 * PATCH: Updates a proposal if status is PENDING (CO ownership verified).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "CLUSTER_OWNER") return NextResponse.json({ error: "CLUSTER_OWNER_REQUIRED" }, { status: 403 });

  const co = await prisma.clusterOwner.findUnique({ where: { userId: user.id } });
  if (!co) return NextResponse.json({ error: "NO_PROFILE" }, { status: 404 });

  const proposal = await prisma.clusterProposal.findFirst({
    where: { id: params.id, coId: co.id },
  });

  if (!proposal) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ proposal }, { status: 200 });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "CLUSTER_OWNER") return NextResponse.json({ error: "CLUSTER_OWNER_REQUIRED" }, { status: 403 });

  const co = await prisma.clusterOwner.findUnique({ where: { userId: user.id } });
  if (!co) return NextResponse.json({ error: "NO_PROFILE" }, { status: 404 });

  const proposal = await prisma.clusterProposal.findFirst({
    where: { id: params.id, coId: co.id },
  });

  if (!proposal) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (proposal.status !== "PENDING") return NextResponse.json({ error: "NOT_EDITABLE", message: "Proposal can only be edited while pending." }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }

  const updateData: Record<string, unknown> = {};

  if (body.occupation !== undefined) updateData.occupation = body.occupation as string;
  if (body.areaDuration !== undefined) updateData.areaDuration = body.areaDuration as string;
  if (body.primaryAnchor !== undefined) updateData.primaryAnchor = body.primaryAnchor as string;
  if (body.physicalPresence !== undefined) updateData.physicalPresence = body.physicalPresence as string;
  if (body.sampleBusinesses !== undefined) updateData.sampleBusinesses = body.sampleBusinesses;
  if (body.clusterName !== undefined) updateData.clusterName = body.clusterName as string;
  if (body.clusterDescription !== undefined) updateData.clusterDescription = (body.clusterDescription as string) || null;
  if (body.anchorType !== undefined) updateData.anchorType = body.anchorType as string;
  if (body.corridorDesc !== undefined) updateData.corridorDesc = body.corridorDesc as string;
  if (body.anchorLat !== undefined) updateData.anchorLat = body.anchorLat as number;
  if (body.anchorLng !== undefined) updateData.anchorLng = body.anchorLng as number;
  if (body.anchorLabel !== undefined) updateData.anchorLabel = body.anchorLabel as string;
  if (body.radiusKm !== undefined) updateData.radiusKm = (body.radiusKm as number) || 1.5;

  const updated = await prisma.clusterProposal.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ ok: true, proposal: updated }, { status: 200 });
}
