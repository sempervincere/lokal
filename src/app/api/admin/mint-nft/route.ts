/**
 * POST /api/admin/mint-nft
 * 
 * Mints a soulbound CO credential NFT for a Cluster Owner.
 * 
 * Body: { coEmail: string, walletAddress: string, clusterSlug?: string }
 * 
 * Auth: ADMIN only
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { mintCoCredentialNft } from "@/lib/solana/mintCoNft";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
    }

    const body = await request.json();
    const { coEmail, walletAddress, clusterSlug } = body;

    if (!coEmail || !walletAddress) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "coEmail and walletAddress are required" },
        { status: 400 }
      );
    }

    // Find the CO user
    const coUser = await prisma.user.findUnique({
      where: { email: coEmail },
      include: { clusterOwner: true },
    });

    if (!coUser || !coUser.clusterOwner) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "CO user not found" },
        { status: 404 }
      );
    }

    // Use specified cluster or find the CO's first cluster
    let slug = clusterSlug;
    if (!slug) {
      const coCluster = await prisma.cluster.findFirst({
        where: { ownerId: coUser.clusterOwner.id },
        orderBy: { createdAt: "asc" },
      });
      if (!coCluster) {
        return NextResponse.json(
          { error: "NO_CLUSTER", message: "CO has no cluster. Create a cluster first." },
          { status: 400 }
        );
      }
      slug = coCluster.slug;
    }

    // Check if NFT already minted
    if (coUser.clusterOwner.nftMintAddress) {
      return NextResponse.json({
        ok: true,
        message: "NFT already minted",
        existing: {
          mintAddress: coUser.clusterOwner.nftMintAddress,
          txSignature: coUser.clusterOwner.nftTxSignature,
        },
      });
    }

    // Mint the soulbound NFT
    const { mintAddress, txSignature } = await mintCoCredentialNft(
      coUser.fullName,
      slug,
      walletAddress
    );

    // Update ClusterOwner record
    await prisma.clusterOwner.update({
      where: { id: coUser.clusterOwner.id },
      data: {
        nftMintAddress: mintAddress,
        nftTxSignature: txSignature,
      },
    });

    // Update user wallet
    await prisma.user.update({
      where: { id: coUser.id },
      data: { walletAddress },
    });

    return NextResponse.json({
      ok: true,
      message: "Soulbound CO credential NFT minted successfully",
      nft: {
        coName: coUser.fullName,
        clusterSlug: slug,
        walletAddress,
        mintAddress,
        txSignature,
        explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
      },
    });
  } catch (error) {
    console.error("[Mint NFT] Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to mint NFT",
      },
      { status: 500 }
    );
  }
}
