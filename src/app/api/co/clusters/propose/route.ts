/**
 * POST /api/co/clusters/propose
 *
 * Submits a cluster proposal with area legitimacy + cluster details.
 * Auth: Supabase session + role === 'CLUSTER_OWNER'
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "CLUSTER_OWNER") return NextResponse.json({ error: "CLUSTER_OWNER_REQUIRED" }, { status: 403 });
  if (!dbUser.kycCompleted) return NextResponse.json({ error: "KYC_REQUIRED" }, { status: 400 });

  const co = await prisma.clusterOwner.findUnique({ where: { userId: user.id } });
  if (!co) return NextResponse.json({ error: "NO_PROFILE" }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }

  const occupation = body.occupation as string;
  const areaDuration = body.areaDuration as string;
  const primaryAnchor = body.primaryAnchor as string;
  const physicalPresence = body.physicalPresence as string;
  const sampleBusinesses = body.sampleBusinesses;
  const clusterName = body.clusterName as string;
  const clusterDescription = (body.clusterDescription as string) || null;
  const anchorType = body.anchorType as string;
  const corridorDesc = body.corridorDesc as string;
  const anchorLat = body.anchorLat as number;
  const anchorLng = body.anchorLng as number;
  const anchorLabel = body.anchorLabel as string;
  const radiusKm = (body.radiusKm as number) || 1.5;

  // Validate required
  const missing: string[] = [];
  if (!occupation) missing.push("occupation");
  if (!areaDuration) missing.push("areaDuration");
  if (!primaryAnchor) missing.push("primaryAnchor");
  if (!physicalPresence) missing.push("physicalPresence");
  if (!clusterName) missing.push("clusterName");
  if (!anchorType) missing.push("anchorType");
  if (!corridorDesc) missing.push("corridorDesc");
  if (!sampleBusinesses) missing.push("sampleBusinesses");
  if (anchorLat == null || isNaN(anchorLat)) missing.push("anchorLat");
  if (anchorLng == null || isNaN(anchorLng)) missing.push("anchorLng");
  if (!anchorLabel) missing.push("anchorLabel");
  if (missing.length > 0) return NextResponse.json({ error: "MISSING_FIELDS", message: `Required: ${missing.join(", ")}` }, { status: 400 });

  // Validate enums
  const validOccupations = ["student", "worker", "freelancer", "other"];
  const occLower = occupation.toLowerCase();
  if (!validOccupations.includes(occLower) && !occLower.startsWith("other:")) return NextResponse.json({ error: "INVALID_OCCUPATION" }, { status: 400 });
  if (!["under_6mo", "6mo_2y", "2y_plus"].includes(areaDuration)) return NextResponse.json({ error: "INVALID_DURATION" }, { status: 400 });
  if (!["daily", "3x_week", "weekly", "whenever"].includes(physicalPresence)) return NextResponse.json({ error: "INVALID_PRESENCE" }, { status: 400 });
  if (!["university", "mall", "market", "station", "office", "residential"].includes(anchorType)) return NextResponse.json({ error: "INVALID_ANCHOR_TYPE" }, { status: 400 });

  // Limit pending proposals
  const pendingCount = await prisma.clusterProposal.count({ where: { coId: co.id, status: "PENDING" } });
  if (pendingCount >= 3) return NextResponse.json({ error: "TOO_MANY_PENDING" }, { status: 400 });

  const proposal = await prisma.clusterProposal.create({
    data: {
      coId: co.id,
      occupation,
      areaDuration,
      primaryAnchor,
      physicalPresence,
      sampleBusinesses: sampleBusinesses as never,
      clusterName,
      clusterDescription,
      anchorType,
      corridorDesc,
      anchorLat,
      anchorLng,
      anchorLabel,
      radiusKm,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true, proposal: { id: proposal.id, clusterName: proposal.clusterName, status: proposal.status } }, { status: 201 });
}
