/**
 * PATCH /api/admin/survey-responses/[id]
 *
 * Admin override review of a survey field response.
 * Can approve or reject, overriding the CO's decision.
 *
 * Body: { action: 'APPROVE' | 'REJECT', reason?: string }
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body as { action: "APPROVE" | "REJECT"; reason?: string };

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
    }

    if (action === "REJECT" && !reason?.trim()) {
      return NextResponse.json({ error: "REASON_REQUIRED" }, { status: 400 });
    }

    const updated = await prisma.surveyFieldResponse.update({
      where: { id },
      data: {
        coStatus: action === "APPROVE" ? "APPROVED" : "REJECTED",
        coRejectReason: action === "REJECT" ? reason : null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, response: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/survey-responses/[id]] Error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
