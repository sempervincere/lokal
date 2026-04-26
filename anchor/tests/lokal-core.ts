import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import type { LokalCore } from "../target/types/lokal_core";

// The Memo program ID is stable across all Solana clusters
const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// Time-based slug avoids PDA collision on re-runs
const RUN_ID = Date.now().toString().slice(-6);
const SLUG = `test-${RUN_ID}`;
const SEED_CLUSTER = Buffer.from("cluster");

describe("lokal-core", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Loads the deployed program using the IDL from target/types/
  const program = anchor.workspace.LokalCore as Program<LokalCore>;

  // Derive the PDA for fetch() calls — Anchor 1.0 auto-resolves it in .accounts()
  // because the IDL fully specifies seeds: [b"cluster", slug arg]
  const [clusterPda] = PublicKey.findProgramAddressSync(
    [SEED_CLUSTER, Buffer.from(SLUG)],
    program.programId,
  );

  // ── Test 1: initialize_cluster ────────────────────────────────────────────
  it("initialize_cluster creates PDA with correct data", async () => {
    const clusterName = "Test Cluster (T-09)";

    // Anchor 1.0: clusterRecord PDA is auto-resolved (seeds in IDL)
    // systemProgram is auto-resolved (fixed address in IDL)
    // Only non-resolvable accounts need to be passed: authority
    const txSig = await program.methods
      .initializeCluster(SLUG, clusterName)
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .rpc({ commitment: "confirmed" });

    console.log("  → initializeCluster tx:", txSig);
    console.log("  → Explorer: https://explorer.solana.com/tx/" + txSig + "?cluster=devnet");

    const record = await program.account.clusterRecord.fetch(clusterPda, "confirmed");

    assert.equal(record.clusterSlug, SLUG, "slug should match");
    assert.equal(record.clusterName, clusterName, "name should match");
    assert.equal(record.validatedFieldCount, 0, "count should start at 0");
    assert.isTrue(
      record.authority.equals(provider.wallet.publicKey),
      "authority should be the signer",
    );
  });

  // ── Test 2: anchor_field_hash success ────────────────────────────────────
  it("anchor_field_hash increments counter and writes Memo tx", async () => {
    const fieldCode = "B1";
    // Valid 64-char hex hash (normally from computeFieldHash — hardcoded for test)
    const fieldHash = "a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2";

    // clusterRecord PDA auto-resolved by Anchor 1.0.
    // The Memo program must be passed as remainingAccounts because the Rust
    // AnchorFieldHash context struct doesn't declare it — the client won't add it automatically.
    const txSig = await program.methods
      .anchorFieldHash(SLUG, fieldCode, fieldHash)
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .remainingAccounts([
        { pubkey: MEMO_PROGRAM, isWritable: false, isSigner: false },
      ])
      .rpc({ commitment: "confirmed" });

    console.log("  → anchorFieldHash tx:", txSig);
    console.log("  → Explorer: https://explorer.solana.com/tx/" + txSig + "?cluster=devnet");
    console.log("  → Open Explorer → expand logs → find LOKAL|test-...|B1|... in Memo");

    const record = await program.account.clusterRecord.fetch(clusterPda, "confirmed");

    assert.equal(
      record.validatedFieldCount,
      1,
      "field count should increment to 1",
    );
  });

  // ── Test 3: unauthorized signer → Unauthorized error ─────────────────────
  it("anchor_field_hash with wrong authority throws LokalError::Unauthorized", async () => {
    // A random keypair — not the authority that initialized the cluster
    const wrongSigner = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .anchorFieldHash(SLUG, "M1", "b".repeat(64))
        .accounts({
          authority: wrongSigner.publicKey,
        })
        .signers([wrongSigner])
        .rpc();

      assert.fail("Expected an Unauthorized error but got none");
    } catch (err: unknown) {
      const msg = (err as Error).toString();
      assert.isTrue(
        msg.includes("Unauthorized") || msg.includes("6000"),
        `Expected Unauthorized (6000), got: ${msg}`,
      );
      console.log("  ✓ Correctly threw Unauthorized");
    }
  });
});
