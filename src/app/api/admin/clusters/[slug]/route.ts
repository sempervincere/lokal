/**
 * GET /api/admin/clusters/[slug]
 *
 * Returns a single cluster with all field values and owner info.
 * Auth: ADMIN only (TEMPORARILY BYPASSED)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const cluster = await prisma.cluster.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          user: {
            select: { fullName: true, email: true },
          },
        },
      },
      fieldValues: {
        orderBy: { fieldCode: "asc" },
      },
    },
  });

  if (!cluster) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Cluster not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ cluster });
}
