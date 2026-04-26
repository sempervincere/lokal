import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveClusterStats } from "@/lib/utils/clusterStats";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "INVALID_SLUG", message: "Invalid cluster slug" },
      { status: 400 }
    );
  }

  try {
    const cluster = await prisma.cluster.findUnique({
      where: { slug },
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
        onchainSlug: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            coScore: true,
            nftMintAddress: true,
            user: {
              select: { fullName: true },
            },
          },
        },
        fieldValues: {
          select: {
            id: true,
            fieldCode: true,
            fieldName: true,
            tier: true,
            category: true,
            collectionMethod: true,
            isComplex: true,
            status: true,
            fieldHash: true,
            solTxSignature: true,
            validatedAt: true,
            value: true, // included for stats derivation, stripped before returning
          },
          orderBy: { fieldCode: "asc" },
        },
      },
    });

    if (!cluster) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: `Cluster '${slug}' not found` },
        { status: 404 }
      );
    }

    // Derive stats from all field values (not just validated)
    const keyStats = deriveClusterStats(
      cluster.fieldValues.map((f) => ({
        fieldCode: f.fieldCode,
        value: f.value,
        status: f.status,
      }))
    );

    // Compute per-category breakdown (no extra DB query needed)
    const categoryBreakdown = cluster.fieldValues.reduce<
      Record<string, { total: number; validated: number }>
    >((acc, f) => {
      if (!acc[f.category]) acc[f.category] = { total: 0, validated: 0 };
      acc[f.category].total++;
      if (f.status === "VALIDATED") acc[f.category].validated++;
      return acc;
    }, {});

    // Strip raw value from fieldValues before returning — raw field data is never public
    const publicFieldValues = cluster.fieldValues.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ value: _v, ...publicFields }) => publicFields
    );

    return NextResponse.json(
      {
        ...cluster,
        fieldValues: publicFieldValues,
        categoryBreakdown,
        keyStats,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error(`[GET /api/clusters/${slug}]`, error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch cluster" },
      { status: 500 }
    );
  }
}
