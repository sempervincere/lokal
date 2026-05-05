/**
 * POST /api/webhooks/helius
 *
 * Helius webhook handler for detecting IDRX payments.
 * Authenticates via query parameter shared secret (not HMAC — Helius doesn't support it).
 * Matches sessionId from Memo instruction, activates the session,
 * and triggers report generation + vault allocation.
 *
 * Webhook URL format:
 *   https://your-domain.com/api/webhooks/helius?secret=YOUR_WEBHOOK_SECRET
 *
 * Auth: Query parameter secret verified against HELIUS_WEBHOOK_SECRET env var
 */

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReport } from "@/lib/ai/reportGenerator";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify shared secret via query parameter
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Helius Webhook] HELIUS_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    if (!secret || secret !== webhookSecret) {
      console.error("[Helius Webhook] Invalid or missing secret");
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Parse payload — Helius sends an ARRAY of transactions
    const body = await request.text();
    const payload = JSON.parse(body);
    const transactions = Array.isArray(payload) ? payload : [payload];

    console.log(
      `[Helius Webhook] Received ${transactions.length} transaction(s)`
    );

    // 3. Process each transaction
    for (const tx of transactions) {
      console.log(
        `[Helius Webhook] Processing tx: ${tx.signature?.slice(0, 12)}... type: ${tx.type}`
      );

      // Skip if no signature
      if (!tx.signature) {
        console.log("[Helius Webhook] No signature — skipped");
        continue;
      }

      // Skip if already processed (replay protection via UNIQUE constraint)
      const existing = await prisma.session.findFirst({
        where: { solTxSignature: tx.signature },
      });
      if (existing) {
        console.log(
          `[Helius Webhook] Duplicate tx: ${tx.signature.slice(0, 12)}... — skipped`
        );
        continue;
      }

      // Find the IDRX transfer to our platform wallet
      const tokenTransfers = tx.tokenTransfers || [];
      const idrxTransfer = tokenTransfers.find(
        (t: any) =>
          t.mint === process.env.IDRX_MINT_ADDRESS &&
          (t.toUserAccount === process.env.NEXT_PUBLIC_PLATFORM_WALLET ||
            t.toTokenAccount === process.env.NEXT_PUBLIC_PLATFORM_WALLET)
      );

      if (!idrxTransfer) {
        console.log(
          "[Helius Webhook] No IDRX transfer to platform wallet in this tx"
        );
        continue;
      }

      console.log(
        `[Helius Webhook] Found IDRX transfer: ${idrxTransfer.tokenAmount} from ${idrxTransfer.fromUserAccount}`
      );

      // Extract sessionId from Memo instruction
      // Helius enhanced webhook: instructions[].data is base64 encoded
      let sessionId: string | null = null;

      const instructions = tx.instructions || [];
      for (const ix of instructions) {
        if (
          ix.programId === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        ) {
          try {
            // Helius sends Memo data as base64
            const data = ix.data || ix.rawData;
            if (data) {
              sessionId = Buffer.from(data, "base64").toString("utf-8").trim();
            }
          } catch {
            try {
              // Fallback: try hex encoding
              const raw = ix.rawData || ix.data;
              if (raw) {
                sessionId = Buffer.from(raw, "hex")
                  .toString("utf-8")
                  .replace(/\0/g, "")
                  .trim();
              }
            } catch {
              console.log(
                "[Helius Webhook] Could not decode Memo instruction data"
              );
            }
          }
          break;
        }
      }

      if (!sessionId || sessionId.trim().length === 0) {
        console.log(
          "[Helius Webhook] No sessionId found in Memo instruction — skipped (may be a non-LOKAL transfer)"
        );
        continue;
      }

      console.log(
        `[Helius Webhook] Found sessionId: ${sessionId.slice(0, 8)}...`
      );

      // Verify session exists and is in correct state
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        console.log(
          `[Helius Webhook] Session not found: ${sessionId} — skipped`
        );
        continue;
      }

      if (session.status !== "PENDING_PAYMENT") {
        console.log(
          `[Helius Webhook] Session already processed: ${sessionId} (status: ${session.status}) — skipped`
        );
        continue;
      }

      // Activate session
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "PAYMENT_CONFIRMED",
          solTxSignature: tx.signature,
        },
      });

      console.log(
        `[Helius Webhook] Session ${sessionId.slice(0, 8)}... ACTIVATED — triggering report generation`
      );

      // Fire-and-forget report generation (includes vault allocation)
      generateReport(sessionId).catch((err) => {
        console.error(
          `[Helius Webhook] Report generation failed for ${sessionId}:`,
          err
        );
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Helius Webhook] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
