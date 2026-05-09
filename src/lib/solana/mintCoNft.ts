import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore, create } from '@metaplex-foundation/mpl-core';
import {
  keypairIdentity,
  generateSigner,
  createSignerFromKeypair,
  publicKey as toUmiPublicKey,
} from '@metaplex-foundation/umi';

/**
 * Mints a soulbound CO credential NFT using Metaplex Core.
 *
 * Server-side only — never call from client components.
 * Platform keypair (PLATFORM_KEYPAIR) is the payer + minter.
 * The NFT is minted TO coWalletAddress (the CO's Phantom wallet).
 *
 * PermanentFreezeDelegate with frozen: true = permanently non-transferable (soulbound).
 */
export async function mintCoCredentialNft(
  coName: string,
  clusterSlug: string,
  coWalletAddress: string,
): Promise<{ mintAddress: string; txSignature: string }> {
  const rpcUrl = (process.env.HELIUS_RPC_URL ?? process.env.NEXT_PUBLIC_HELIUS_RPC_URL)!;
  const platformKeypairBytes = JSON.parse(process.env.PLATFORM_KEYPAIR!) as number[];

  const umi = createUmi(rpcUrl).use(mplCore());

  const keypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(platformKeypairBytes));
  const platformSigner = createSignerFromKeypair(umi, keypair);
  umi.use(keypairIdentity(platformSigner));

  const assetSigner = generateSigner(umi);

  const r2BaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? 'https://placeholder.r2.dev';
  const metadataUri = `${r2BaseUrl}/co-metadata/${clusterSlug}.json`;

  const { signature } = await create(umi, {
    asset: assetSigner,
    name: `LOKAL CO — ${coName}`,
    uri: metadataUri,
    owner: toUmiPublicKey(coWalletAddress),
    plugins: [
      {
        type: 'PermanentFreezeDelegate',
        frozen: true,
        authority: { type: 'UpdateAuthority' },
      },
    ],
  }).sendAndConfirm(umi);

  const bs58 = require('bs58');

  return {
    mintAddress: assetSigner.publicKey.toString(),
    txSignature: bs58.encode(signature),
  };
}
