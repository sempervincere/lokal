import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveClusterStats } from "@/lib/utils/clusterStats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clusters = await prisma.cluster.findMany({
      where: {status: "ACTIVE"},
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
        updatedAt: true,
        _count: {
          select: {
            fieldValues: {
              where: { status: "VALIDATED" },
            },
          },
        },
        fieldValues: {
          where: { status: "VALIDATED" },
          select: {
            fieldCode: true,
            value: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Derive stats and strip raw value before returning
    const response = clusters.map((cluster) => {
      const keyStats = deriveClusterStats(
        cluster.fieldValues.map((f) => ({
          fieldCode: f.fieldCode,
          value: f.value,
          status: f.status,
        }))
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fieldValues: _fv, ...rest } = cluster;

      return {
        ...rest,
        keyStats,
      };
    });

    return NextResponse.json(response, {
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
