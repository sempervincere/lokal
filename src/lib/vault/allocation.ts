// src/lib/vault/allocation.ts

/**
 * Vault Allocation Module
 * 
 * Handles the allocation of session revenue to the respondent vault.
 * Called when a BO payment is confirmed.
 * 
 * Flow:
 * 1. BO pays 400,000 IDRX for session
 * 2. Backend detects payment (Helius webhook)
 * 3. This module allocates 8% (32,000 IDRX) to vault
 * 4. Vault is distributed to respondents based on their approved field contributions
 */

import { prisma } from "@/lib/prisma";
import { VAULT_ALLOCATION_IDRX, calculateRespondentReward } from "@/lib/constants/pricing";

/**
 * Allocate session revenue to cluster vault
 * 
 * @param clusterId - The cluster ID for this session
 * @param sessionId - The session ID (for tracking)
 * @param sessionPriceIdrx - Session price in IDRX (default: 400,000)
 * @returns Vault allocation details
 */
export async function allocateSessionToVault(
  clusterId: string,
  sessionId: string,
  sessionPriceIdrx: number = 400_000
) {
  // Calculate vault allocation (8% of session price)
  const vaultAllocation = Math.floor(sessionPriceIdrx * 0.08);

  // Get or create vault for this cluster
  let vault = await prisma.clusterVault.findUnique({
    where: { clusterId },
  });

  if (!vault) {
    vault = await prisma.clusterVault.create({
      data: {
        clusterId,
        totalPool: 0,
        distributed: 0,
        respondentCount: 0,
      },
    });
  }

  // Update vault total pool
  await prisma.clusterVault.update({
    where: { id: vault.id },
    data: {
      totalPool: { increment: vaultAllocation },
    },
  });

  // Get all pending claims for this vault
  const pendingClaims = await prisma.vaultClaim.findMany({
    where: {
      vaultId: vault.id,
      status: "PENDING",
      approvedCount: { gt: 0 },
    },
  });

  if (pendingClaims.length === 0) {
    return {
      vaultId: vault.id,
      allocated: vaultAllocation,
      distributed: 0,
      message: "No pending claims to distribute to",
    };
  }

  // Calculate total approved fields across all respondents
  const totalApprovedFields = pendingClaims.reduce(
    (sum, claim) => sum + claim.approvedCount,
    0
  );

  // Distribute proportionally based on approved field count
  const distributionResults = [];
  
  for (const claim of pendingClaims) {
    const reward = calculateRespondentReward(
      vaultAllocation,
      totalApprovedFields,
      claim.approvedCount
    );

    if (reward > 0) {
      // Update claim amount
      await prisma.vaultClaim.update({
        where: { id: claim.id },
        data: {
          amount: { increment: reward },
        },
      });

      distributionResults.push({
        claimId: claim.id,
        wallet: claim.respondentWallet,
        approvedFields: claim.approvedCount,
        reward,
      });
    }
  }

  // Update vault distributed amount
  const totalDistributed = distributionResults.reduce(
    (sum, r) => sum + r.reward,
    0
  );

  await prisma.clusterVault.update({
    where: { id: vault.id },
    data: {
      distributed: { increment: totalDistributed },
      respondentCount: pendingClaims.length,
    },
  });

  return {
    vaultId: vault.id,
    allocated: vaultAllocation,
    distributed: totalDistributed,
    respondentCount: pendingClaims.length,
    distribution: distributionResults,
  };
}

/**
 * Get vault summary for a cluster
 * 
 * @param clusterId - The cluster ID
 * @returns Vault summary
 */
export async function getVaultSummary(clusterId: string) {
  const vault = await prisma.clusterVault.findUnique({
    where: { clusterId },
    include: {
      claims: {
        select: {
          id: true,
          respondentWallet: true,
          fieldCodes: true,
          approvedCount: true,
          amount: true,
          status: true,
        },
      },
    },
  });

  if (!vault) {
    return {
      exists: false,
      totalPool: 0,
      distributed: 0,
      available: 0,
      respondentCount: 0,
      claims: [],
    };
  }

  const totalPool = Number(vault.totalPool);
  const distributed = Number(vault.distributed);

  return {
    exists: true,
    id: vault.id,
    totalPool,
    distributed,
    available: totalPool - distributed,
    respondentCount: vault.claims.length,
    status: vault.status,
    claims: vault.claims.map(c => ({
      ...c,
      amount: Number(c.amount),
    })),
  };
}

/**
 * Check if a respondent can withdraw from vault
 * 
 * @param wallet - Respondent's wallet address
 * @param minWithdrawal - Minimum withdrawal amount (default: 10,000 IDRX)
 * @returns Whether withdrawal is possible and the amount
 */
export async function canWithdrawFromVault(
  wallet: string,
  minWithdrawal: number = 10_000
) {
  const claims = await prisma.vaultClaim.findMany({
    where: {
      respondentWallet: wallet,
      status: "PENDING",
      amount: { gt: 0 },
    },
  });

  const totalAmount = claims.reduce(
    (sum, claim) => sum + Number(claim.amount),
    0
  );

  return {
    canWithdraw: totalAmount >= minWithdrawal,
    currentBalance: totalAmount,
    minWithdrawal,
    claimCount: claims.length,
  };
}
