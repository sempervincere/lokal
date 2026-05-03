/**
 * POST /api/auth/tiplink
 * 
 * Creates or retrieves a TipLink wallet for an email address.
 * TipLink creates a custodial wallet associated with the email.
 * The respondent can later access this wallet via email verification.
 * 
 * Body: { email: string }
 * Returns: { walletAddress: string }
 * 
 * Auth: None required (public endpoint for survey respondents)
 */

import { NextResponse, type NextRequest } from "next/server";
import { createReceiverTipLink } from "@tiplink/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Valid email is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.TIPLINK_API_KEY;

    // If no TipLink API key, generate a deterministic wallet address from email
    // This is for development/demo purposes only
    if (!apiKey) {
      console.warn(
        "[POST /api/auth/tiplink] TIPLINK_API_KEY not set — using deterministic fallback"
      );

      // Generate a deterministic address from email hash
      // This allows the demo to work without a TipLink API key
      const { createHash } = await import("crypto");
      const hash = createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

      // Convert first 32 bytes of hash to a base58-like address
      // This is NOT a real wallet — just a placeholder for the demo
      const deterministicAddress = hash.slice(0, 32);

      return NextResponse.json({
        walletAddress: deterministicAddress,
        email: email.toLowerCase().trim(),
        isDemo: true,
        message:
          "Demo mode: TipLink API key not configured. Using placeholder wallet.",
      });
    }

    // Production: Use TipLink API to create/retrieve wallet
    const walletPublicKey = await createReceiverTipLink(apiKey, email);

    return NextResponse.json({
      walletAddress: walletPublicKey.toString(),
      email: email.toLowerCase().trim(),
      isDemo: false,
    });
  } catch (error) {
    console.error("[POST /api/auth/tiplink] Error:", error);

    // Handle specific TipLink errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            error: "CONFIG_ERROR",
            message: "TipLink API key is invalid",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
