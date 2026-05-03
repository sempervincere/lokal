/**
 * GET /api/survey/[slug]
 * 
 * Returns survey questions for a cluster and checks if respondent has already submitted.
 * 
 * Query params:
 * - token: Survey link token (required)
 * - wallet: Respondent's wallet address (optional, for checking existing submissions)
 * 
 * Auth: None required (public endpoint, but wallet needed for submission)
 */

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SURVEY_FIELDS, SURVEY_CATEGORIES, getSurveyCategoriesWithFields } from "@/lib/constants/survey-fields";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const wallet = searchParams.get("wallet");

    // Validate token
    if (!token) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Token is required" },
        { status: 400 }
      );
    }

    // Find cluster by slug
    const cluster = await prisma.cluster.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        anchorLabel: true,
      },
    });

    if (!cluster) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Cluster not found" },
        { status: 404 }
      );
    }

    // Validate token matches cluster (token is cluster-specific)
    // For now, we use a simple format: cluster-{clusterId}-survey
    // In production, generate a proper unique token per cluster
    const expectedToken = `cluster-${cluster.id}-survey`;
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Invalid survey token" },
        { status: 403 }
      );
    }

    // Check if wallet has already submitted
    let existingSubmission = null;
    if (wallet) {
      existingSubmission = await prisma.surveyResponse.findFirst({
        where: {
          clusterId: cluster.id,
          respondentWallet: wallet,
          status: { in: ["SUBMITTED", "REVIEWED"] },
        },
        select: {
          id: true,
          status: true,
          submittedAt: true,
        },
      });
    }

    // Get survey categories with fields
    const categoriesWithFields = getSurveyCategoriesWithFields();

    return NextResponse.json({
      cluster: {
        id: cluster.id,
        name: cluster.name,
        slug: cluster.slug,
        location: cluster.anchorLabel,
      },
      survey: {
        title: `Survey LOKAL — ${cluster.name}`,
        description: `Bantu kami mengumpulkan data tentang area ${cluster.name}. Jawaban kamu akan membantu pelaku usaha F&B membuat keputusan yang lebih baik.`,
        categories: categoriesWithFields,
        totalFields: SURVEY_FIELDS.length,
        estimatedTime: "5-10 menit",
      },
      existingSubmission,
    });
  } catch (error) {
    console.error("[GET /api/survey/[slug]] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to load survey" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/survey/[slug]
 * 
 * Submit survey responses for a cluster.
 * 
 * Body:
 * - wallet: Respondent's wallet address (required)
 * - email: Respondent's email (optional, for Tiplink users)
 * - responses: Array of { fieldCode: string, value: any } (required)
 * - token: Survey link token (required)
 * 
 * Auth: Wallet required (no LOKAL account needed)
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { wallet, email, responses, token } = body;

    // Validate required fields
    if (!wallet || !responses || !Array.isArray(responses) || !token) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "wallet, responses array, and token are required" },
        { status: 400 }
      );
    }

    // Validate responses array has all required fields
    const requiredFieldCodes = SURVEY_FIELDS.filter(f => f.required).map(f => f.code);
    const submittedFieldCodes = responses.map((r: { fieldCode: string }) => r.fieldCode);
    const missingFields = requiredFieldCodes.filter(code => !submittedFieldCodes.includes(code));

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: "BAD_REQUEST", 
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Find cluster
    const cluster = await prisma.cluster.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!cluster) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Cluster not found" },
        { status: 404 }
      );
    }

    // Validate token
    const expectedToken = `cluster-${cluster.id}-survey`;
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Invalid survey token" },
        { status: 403 }
      );
    }

    // Check for duplicate submission
    const existingSubmission = await prisma.surveyResponse.findFirst({
      where: {
        clusterId: cluster.id,
        respondentWallet: wallet,
        status: { in: ["SUBMITTED", "REVIEWED"] },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "CONFLICT", message: "You have already submitted this survey" },
        { status: 409 }
      );
    }

    // Validate each field code
    const validFieldCodes = SURVEY_FIELDS.map(f => f.code);
    const invalidFields = responses.filter(
      (r: { fieldCode: string }) => !validFieldCodes.includes(r.fieldCode)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { 
          error: "BAD_REQUEST", 
          message: `Invalid field codes: ${invalidFields.map((f: { fieldCode: string }) => f.fieldCode).join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Create survey response with field responses in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the survey response
      const surveyResponse = await tx.surveyResponse.create({
        data: {
          clusterId: cluster.id,
          formToken: token,
          respondentWallet: wallet,
          respondentEmail: email || null,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      // Create individual field responses
      const fieldResponses = await Promise.all(
        responses.map(async (r: { fieldCode: string; value: any }) => {
          return tx.surveyFieldResponse.create({
            data: {
              surveyResponseId: surveyResponse.id,
              fieldCode: r.fieldCode,
              value: r.value,
              coStatus: "PENDING",
            },
          });
        })
      );

      return { surveyResponse, fieldResponses };
    });

    return NextResponse.json({
      ok: true,
      message: "Survey submitted successfully!",
      submission: {
        id: result.surveyResponse.id,
        status: result.surveyResponse.status,
        submittedAt: result.surveyResponse.submittedAt,
        fieldsSubmitted: result.fieldResponses.length,
      },
    });
  } catch (error) {
    console.error("[POST /api/survey/[slug]] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to submit survey" },
      { status: 500 }
    );
  }
}
