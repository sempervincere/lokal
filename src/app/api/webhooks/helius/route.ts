/**
 * POST /api/webhooks/helius
 *
 * Helius webhook handler for detecting IDRX payments.
 * Authenticates via query parameter shared secret.
 *
 * Matching strategy (in order):
 *   1. Memo instruction on the transaction (if decoded successfully)
 *   2. Sender wallet address → user → most recent PENDING_PAYMENT session
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Security: validate webhook secret via query param AND timing-safe comparison
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") ?? "";

    const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET ?? "";
    if (!webhookSecret) {
      console.error("[Helius Webhook] HELIUS_WEBHOOK_SECRET not configured");
      return new Response("Internal error", { status: 500 });
    }

    // Timing-safe comparison to prevent timing attacks
    const { timingSafeEqual } = await import("crypto");
    const secretBuf = Buffer.from(secret);
    const expectedBuf = Buffer.from(webhookSecret);
    const isValid =
      secretBuf.length === expectedBuf.length &&
      timingSafeEqual(secretBuf, expectedBuf);

    if (!isValid) {
      console.error("[Helius Webhook] Invalid or missing secret");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.text();
    const payload = JSON.parse(body);
    const transactions = Array.isArray(payload) ? payload : [payload];

    console.log(`[Helius Webhook] Received ${transactions.length} transaction(s)`);

    for (const tx of transactions) {
      console.log(`[Helius Webhook] Processing tx: ${tx.signature?.slice(0, 12)}... type: ${tx.type}`);

      if (!tx.signature) continue;

      // Replay protection
      const existing = await prisma.session.findFirst({
        where: { solTxSignature: tx.signature },
      });
      if (existing) {
        console.log(`[Helius Webhook] Duplicate: ${tx.signature.slice(0, 12)}... — skipped`);
        continue;
      }

      // Find IDRX transfer to our platform wallet
      const tokenTransfers = tx.tokenTransfers || [];
      const idrxTransfer = tokenTransfers.find(
        (t: any) =>
          t.mint === process.env.IDRX_MINT_ADDRESS &&
          (t.toUserAccount === process.env.NEXT_PUBLIC_PLATFORM_WALLET ||
            t.toTokenAccount === process.env.NEXT_PUBLIC_PLATFORM_WALLET)
      );

      if (!idrxTransfer) {
        console.log("[Helius Webhook] No IDRX transfer to platform wallet — skipped");
        continue;
      }

      const senderWallet = idrxTransfer.fromUserAccount;
      const rawAmount = parseFloat(idrxTransfer.tokenAmount) || 400000;

      console.log(
        `[Helius Webhook] IDRX transfer: ${rawAmount} from ${senderWallet}`
      );

      // ── Strategy 1: Match by sender wallet address ──────────────
      // Find the user who owns this wallet, then their latest PENDING_PAYMENT session.
      // This is the reliable path — no Memo encoding needed.

      const user = await prisma.user.findUnique({
        where: { walletAddress: senderWallet },
        select: { id: true },
      });

      if (!user) {
        console.log(`[Helius Webhook] No user found for wallet ${senderWallet} — skipped`);
        continue;
      }

      const session = await prisma.session.findFirst({
        where: {
          userId: user.id,
          status: "PENDING_PAYMENT",
        },
        orderBy: { createdAt: "desc" },
      });

      if (!session) {
        console.log(`[Helius Webhook] No PENDING_PAYMENT session for user ${user.id} — skipped`);
        continue;
      }

      console.log(
        `[Helius Webhook] Wallet match: user=${user.id} session=${session.id.slice(0, 8)}...`
      );

      await prisma.session.update({
        where: { id: session.id },
        data: {
          status: "PAYMENT_CONFIRMED",
          solTxSignature: tx.signature,
        },
      });

      console.log(
        `[Helius Webhook] Session ${session.id.slice(0, 8)}... → PAYMENT_CONFIRMED (wallet match)`
      );
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Helius Webhook] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
