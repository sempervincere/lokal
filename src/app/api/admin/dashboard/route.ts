/**
 * GET /api/admin/dashboard
 *
 * Returns platform overview stats for the admin dashboard.
 * Auth: ADMIN only (TEMPORARILY BYPASSED — see PREVIEW_MODE in layout.tsx)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // TEMPORARY: bypass admin check for UI preview
  // const admin = await getAdminUser();
  // if (!admin) { ... }

  const [clusterGroups, fieldGroups, sessionAgg, recentValidations] =
    await Promise.all([
      prisma.cluster.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.clusterFieldValue.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.session.aggregate({
        _count: { id: true },
        _sum: { amountIdrx: true },
      }),
      prisma.clusterFieldValue.findMany({
        where: { status: "VALIDATED" },
        orderBy: { validatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          fieldCode: true,
          fieldName: true,
          solTxSignature: true,
          validatedAt: true,
          cluster: {
            select: { name: true },
          },
        },
      }),
    ]);

  const clusters = {
    total: clusterGroups.reduce((sum, c) => sum + c._count.status, 0),
    seeding:
      clusterGroups.find((c) => c.status === "SEEDING")?._count.status ?? 0,
    active:
      clusterGroups.find((c) => c.status === "ACTIVE")?._count.status ?? 0,
  };

  const fields = {
    total: fieldGroups.reduce((sum, f) => sum + f._count.status, 0),
    validated:
      fieldGroups.find((f) => f.status === "VALIDATED")?._count.status ?? 0,
    pending:
      fieldGroups.find((f) => f.status === "PENDING")?._count.status ?? 0,
    rejected:
      fieldGroups.find((f) => f.status === "REJECTED")?._count.status ?? 0,
  };

  const sessions = {
    total: sessionAgg._count.id,
    totalRevenueIdrx: Number(sessionAgg._sum.amountIdrx ?? 0),
  };

  return NextResponse.json({
    clusters,
    fields,
    sessions,
    recentActivity: recentValidations.map((a) => ({
      id: a.id,
      clusterName: a.cluster.name,
      fieldCode: a.fieldCode,
      fieldName: a.fieldName,
      solTxSignature: a.solTxSignature,
      validatedAt: a.validatedAt,
    })),
  });
}
