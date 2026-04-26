import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clusters = await prisma.cluster.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        anchorLat: true,
        anchorLng: true,
        anchorLabel: true,
        radiusKm: true,
        confidenceScore: true,
        dataCompleteness: true,
        totalValidatedFields: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            fieldValues: {
              where: { status: "VALIDATED" },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(clusters, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[GET /api/clusters]", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch clusters" },
      { status: 500 }
    );
  }
}
