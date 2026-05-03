/**
 * POST /api/vault/withdraw
 * 
 * Withdraw pending vault balance to respondent's wallet.
 * Distributes IDRX from platform wallet to respondent wallet.
 * 
 * Body:
 * - wallet: Respondent's wallet address (required)
 * - clusterSlug: Cluster to withdraw from (optional, defaults to all)
 * 
 * Auth: Wallet-based (respondent must own the wallet)
 */

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { VAULT_MIN_WITHDRAWAL_IDRX, IDRX_DECIMALS } from "@/lib/constants/pricing";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, clusterSlug } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "wallet is required" },
        { status: 400 }
      );
    }

    // Validate wallet address
    let walletPubkey: PublicKey;
    try {
      walletPubkey = new PublicKey(wallet);
    } catch {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      respondentWallet: wallet,
      status: "PENDING",
      amount: { gt: 0 },
    };
    
    if (clusterSlug) {
      const cluster = await prisma.cluster.findUnique({
        where: { slug: clusterSlug },
        select: { id: true },
      });
      
      if (!cluster) {
        return NextResponse.json(
          { error: "NOT_FOUND", message: "Cluster not found" },
          { status: 404 }
        );
      }
      
      where.vault = { clusterId: cluster.id };
    }

    // Get all pending claims for this wallet
    const pendingClaims = await prisma.vaultClaim.findMany({
      where,
      include: {
        vault: {
          include: {
            cluster: {
              select: { id: true, slug: true, name: true },
            },
          },
        },
      },
    });

    if (pendingClaims.length === 0) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "No pending claims found" },
        { status: 404 }
      );
    }

    // Calculate total withdrawal amount
    const totalAmount = pendingClaims.reduce((sum, claim) => sum + Number(claim.amount), 0);

    // Check minimum withdrawal threshold
    if (totalAmount < VAULT_MIN_WITHDRAWAL_IDRX) {
      return NextResponse.json(
        { 
          error: "BAD_REQUEST", 
          message: `Minimum withdrawal is ${VAULT_MIN_WITHDRAWAL_IDRX} IDRX. Current balance: ${totalAmount} IDRX`,
          currentBalance: totalAmount,
          minWithdrawal: VAULT_MIN_WITHDRAWAL_IDRX,
        },
        { status: 400 }
      );
    }

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
    const withdrawalBaseUnits = totalAmount * Math.pow(10, IDRX_DECIMALS);

    if (platformBalanceBaseUnits < withdrawalBaseUnits) {
      return NextResponse.json(
        { error: "INSUFFICIENT_FUNDS", message: "Platform vault has insufficient balance" },
        { status: 400 }
      );
    }

    // Create transfer instruction
    const transferIx = createTransferCheckedInstruction(
      platformAta,
      idrxMint,
      respondentAta,
      platformWallet.publicKey,
      withdrawalBaseUnits,
      IDRX_DECIMALS
    );

    // Build and send transaction
    const { Transaction, sendAndConfirmTransaction } = await import("@solana/web3.js");
    const transaction = new Transaction().add(transferIx);
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [platformWallet],
      { commitment: "confirmed" }
    );

    // Update claims as distributed in a transaction
    await prisma.$transaction(async (tx) => {
      // Update all pending claims to DISTRIBUTED
      await tx.vaultClaim.updateMany({
        where: {
          id: { in: pendingClaims.map(c => c.id) },
        },
        data: {
          status: "DISTRIBUTED",
          distributedAt: new Date(),
          solTxSignature: signature,
        },
      });

      // Update vault distributed amounts
      const vaultIds = Array.from(new Set(pendingClaims.map(c => c.vaultId)));
      for (const vaultId of vaultIds) {
        const vaultClaims = pendingClaims.filter(c => c.vaultId === vaultId);
        const vaultAmount = vaultClaims.reduce((sum, c) => sum + Number(c.amount), 0);
        
        await tx.clusterVault.update({
          where: { id: vaultId },
          data: {
            distributed: { increment: vaultAmount },
          },
        });
      }
    });

    return NextResponse.json({
      ok: true,
      message: `Successfully withdrawn ${totalAmount} IDRX`,
      withdrawal: {
        amount: totalAmount,
        amountBaseUnits: withdrawalBaseUnits,
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      },
      claims: pendingClaims.map(c => ({
        id: c.id,
        cluster: c.vault.cluster.name,
        amount: Number(c.amount),
        fieldCodes: c.fieldCodes,
      })),
    });
  } catch (error) {
    console.error("[POST /api/vault/withdraw] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
