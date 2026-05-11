/**
 * POST /api/co/withdraw
 * 
 * Withdraw CO earnings to their wallet.
 * Applies a 2% platform fee on withdrawals.
 * 
 * Body: { wallet?: string }
 * - wallet: Optional override wallet address. If not provided, uses the CO's registered wallet.
 * 
 * Auth: CLUSTER_OWNER only
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  createAssociatedTokenAccountIdempotentInstruction,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { IDRX_DECIMALS } from "@/lib/constants/pricing";

const WITHDRAWAL_FEE_RATE = 0.02; // 2% platform fee
const MIN_WITHDRAWAL_IDRX = 10_000;

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "CLUSTER_OWNER") {
      return NextResponse.json({ error: "CLUSTER_OWNER_REQUIRED" }, { status: 403 });
    }

    // Get CO record
    const co = await prisma.clusterOwner.findUnique({
      where: { userId: user.id },
      include: { user: { select: { walletAddress: true } } },
    });

    if (!co) {
      return NextResponse.json({ error: "CO_NOT_FOUND" }, { status: 404 });
    }

    // Determine withdrawal wallet
    const body = await request.json().catch(() => ({}));
    const withdrawalWallet = body.wallet || co.user.walletAddress;

    if (!withdrawalWallet) {
      return NextResponse.json(
        { error: "NO_WALLET", message: "No wallet address found. Please connect your wallet first." },
        { status: 400 }
      );
    }

    // Validate wallet address
    let walletPubkey: PublicKey;
    try {
      walletPubkey = new PublicKey(withdrawalWallet);
    } catch {
      return NextResponse.json({ error: "INVALID_WALLET", message: "Invalid wallet address" }, { status: 400 });
    }

    // Get all unpaid earnings
    const unpaidEarnings = await prisma.coEarning.findMany({
      where: {
        coId: co.id,
        isPaid: false,
      },
    });

    if (unpaidEarnings.length === 0) {
      return NextResponse.json(
        { error: "NO_EARNINGS", message: "No unpaid earnings available" },
        { status: 400 }
      );
    }

    // Calculate total earnings
    const totalEarnings = unpaidEarnings.reduce(
      (sum, e) => sum + Number(e.amountIdrx),
      0
    );

    // Check minimum withdrawal
    if (totalEarnings < MIN_WITHDRAWAL_IDRX) {
      return NextResponse.json(
        {
          error: "BELOW_MINIMUM",
          message: `Minimum withdrawal is ${MIN_WITHDRAWAL_IDRX.toLocaleString('id')} IDRX. Current balance: ${totalEarnings.toLocaleString('id')} IDRX`,
          currentBalance: totalEarnings,
          minWithdrawal: MIN_WITHDRAWAL_IDRX,
        },
        { status: 400 }
      );
    }

    // ── Fix 4: Optimistic lock — atomically mark THIS snapshot as paid before TX ──
    // If a concurrent withdrawal already locked these records, updateMany returns count=0.
    const earningIds = unpaidEarnings.map((e) => e.id);
    const paidAt = new Date();
    const lockResult = await prisma.coEarning.updateMany({
      where: { id: { in: earningIds }, isPaid: false },
      data: { isPaid: true, paidAt },
    });

    if (lockResult.count === 0) {
      return NextResponse.json(
        { error: "WITHDRAWAL_IN_PROGRESS", message: "Another withdrawal is already in progress. Please wait." },
        { status: 409 }
      );
    }

    // Calculate platform fee and net amount
    const feeAmount = Math.floor(totalEarnings * WITHDRAWAL_FEE_RATE);
    const netAmount = totalEarnings - feeAmount;

    // Check platform wallet balance
    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    if (!rpcUrl) {
      throw new Error("HELIUS_RPC_URL not configured");
    }

    const connection = new Connection(rpcUrl, "confirmed");
    const idrxMint = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT_ADDRESS!);
    const platformWallet = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(process.env.PLATFORM_KEYPAIR!))
    );
    const platformAta = getAssociatedTokenAddressSync(idrxMint, platformWallet.publicKey);
    const respondentAta = getAssociatedTokenAddressSync(idrxMint, walletPubkey);

    // Check platform balance
    const platformBalance = await connection.getTokenAccountBalance(platformAta);
    const platformBalanceBaseUnits = parseInt(platformBalance.value.amount);
    const withdrawalBaseUnits = Math.floor(netAmount * Math.pow(10, IDRX_DECIMALS));

    if (platformBalanceBaseUnits < withdrawalBaseUnits) {
      // Rollback lock before returning error
      await prisma.coEarning.updateMany({
        where: { id: { in: earningIds } },
        data: { isPaid: false, paidAt: null },
      });
      return NextResponse.json(
        { error: "INSUFFICIENT_FUNDS", message: "Platform has insufficient balance" },
        { status: 400 }
      );
    }

    // ── Fix 5: Ensure recipient ATA exists before transfer ──
    const { Transaction, sendAndConfirmTransaction } = await import("@solana/web3.js");
    const transaction = new Transaction();

    try {
      await getAccount(connection, respondentAta);
    } catch (err) {
      if (err instanceof TokenAccountNotFoundError) {
        // ATA doesn't exist — platform wallet creates it (pays ~0.002 SOL rent)
        transaction.add(
          createAssociatedTokenAccountIdempotentInstruction(
            platformWallet.publicKey,
            respondentAta,
            walletPubkey,
            idrxMint,
          )
        );
      } else {
        // Rollback lock on unexpected RPC error
        await prisma.coEarning.updateMany({
          where: { id: { in: earningIds } },
          data: { isPaid: false, paidAt: null },
        });
        throw err;
      }
    }

    transaction.add(
      createTransferCheckedInstruction(
        platformAta,
        idrxMint,
        respondentAta,
        platformWallet.publicKey,
        BigInt(withdrawalBaseUnits),
        IDRX_DECIMALS,
      )
    );

    let signature: string;
    try {
      signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [platformWallet],
        { commitment: "confirmed" }
      );
    } catch (solanaError) {
      // Solana TX failed — rollback the optimistic lock so CO can retry
      await prisma.coEarning.updateMany({
        where: { id: { in: earningIds } },
        data: { isPaid: false, paidAt: null },
      });
      throw solanaError;
    }

    // Earnings already marked paid before TX — nothing more to update in DB

    return NextResponse.json({
      ok: true,
      message: `Successfully withdrawn ${netAmount.toLocaleString('id')} IDRX`,
      withdrawal: {
        grossAmount: totalEarnings,
        feeAmount,
        feeRate: `${WITHDRAWAL_FEE_RATE * 100}%`,
        netAmount,
        netAmountBaseUnits: withdrawalBaseUnits,
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      },
    });
  } catch (error) {
    console.error("[POST /api/co/withdraw] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
