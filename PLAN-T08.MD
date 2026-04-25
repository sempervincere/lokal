# PLAN-T08 — Anchor `lokal_core` Program Implementation

> **Owner:** Dylan | **Agent:** `rust-engineer` | **Skill:** `context7` (run before every API call)
> **Stack:** Anchor 1.0.0 · Rust 1.89.0 · Solana CLI 3.1.12 · devnet via Helius

---

## What this program does

Two instructions in one program (`lokal_core`):

| Instruction | Purpose | On-chain output |
|---|---|---|
| `initialize_cluster` | Creates a PDA that registers the cluster on-chain | Account exists at `[b"cluster", slug]` |
| `anchor_field_hash` | Logs a field hash via SPL Memo, increments counter | Memo tx visible on Solana Explorer |

The Memo transaction for `anchor_field_hash` is the blockchain proof point for demo day:
```
LOKAL|depok-margonda-001|B1|<sha256_hex>|<unix_timestamp>
```

---

## Environment prerequisites (all confirmed ✓)

| Item | Status | Value |
|---|---|---|
| Anchor CLI | ✅ 1.0.0 | `anchor --version` |
| Solana CLI | ✅ 3.1.12 | `solana --version` |
| Rust | ✅ 1.89.0 | via `rust-toolchain.toml` |
| Devnet balance | ✅ 3.5 SOL | `solana balance` |
| Program ID in Anchor.toml | ✅ Set | `4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ` |
| Helius RPC in Anchor.toml | ✅ Set | Devnet endpoint |
| PLATFORM_KEYPAIR in .env.local | ✅ Set | JSON byte array |

---

## Step 0 — Add `spl-memo` dependency

Edit `anchor/programs/lokal-core/Cargo.toml`, add to `[dependencies]`:

```toml
[dependencies]
anchor-lang = "1.0.0"
spl-memo = { version = "6", features = ["no-entrypoint"] }
```

> **Why `no-entrypoint` feature?** spl-memo has its own BPF entrypoint. When pulled into another program, `no-entrypoint` suppresses it so the linker doesn't see two entrypoints and error out.

If `spl-memo = "6"` causes a dependency conflict, try `"5"`. Run `cargo check` inside `anchor/programs/lokal-core/` to confirm.

---

## Step 1 — Account struct (`src/state.rs`)

Replace the default contents with:

```rust
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ClusterRecord {
    #[max_len(64)]
    pub cluster_slug: String,
    #[max_len(128)]
    pub cluster_name: String,
    pub authority: Pubkey,
    pub validated_field_count: u32,
    pub created_at: i64,
}
```

**Account space:** `8 (discriminator) + 4+64 (String) + 4+128 (String) + 32 (Pubkey) + 4 (u32) + 8 (i64) = 252 bytes`

Use `space = 8 + ClusterRecord::INIT_SPACE` in the `init` constraint — `#[derive(InitSpace)]` computes this automatically. Do **not** hardcode a number.

---

## Step 2 — Constants (`src/constants.rs`)

```rust
use anchor_lang::prelude::*;

pub const SEED_CLUSTER: &[u8] = b"cluster";
pub const MAX_SLUG_LEN: usize = 64;
pub const MAX_NAME_LEN: usize = 128;
pub const MAX_FIELD_CODE_LEN: usize = 8;
pub const MAX_FIELD_HASH_LEN: usize = 64; // SHA-256 hex = 64 chars
```

---

## Step 3 — Errors (`src/error.rs`)

```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum LokalError {
    #[msg("Only the cluster authority can anchor field hashes")]
    Unauthorized,
    #[msg("Slug exceeds maximum length")]
    SlugTooLong,
    #[msg("Field code exceeds maximum length")]
    FieldCodeTooLong,
    #[msg("Field hash must be a 64-character SHA-256 hex string")]
    InvalidFieldHash,
}
```

---

## Step 4 — `initialize_cluster` instruction

**File:** `src/instructions/initialize_cluster.rs`

```rust
use anchor_lang::prelude::*;
use crate::{constants::*, error::LokalError, state::ClusterRecord};

pub fn handler(
    ctx: Context<InitializeCluster>,
    slug: String,
    name: String,
) -> Result<()> {
    require!(slug.len() <= MAX_SLUG_LEN, LokalError::SlugTooLong);

    let record = &mut ctx.accounts.cluster_record;
    record.cluster_slug = slug;
    record.cluster_name = name;
    record.authority = ctx.accounts.authority.key();
    record.validated_field_count = 0;
    record.created_at = Clock::get()?.unix_timestamp;

    msg!(
        "Cluster initialized: {} | authority: {}",
        record.cluster_slug,
        record.authority
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct InitializeCluster<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ClusterRecord::INIT_SPACE,
        seeds = [SEED_CLUSTER, slug.as_bytes()],
        bump,
    )]
    pub cluster_record: Account<'info, ClusterRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

---

## Step 5 — `anchor_field_hash` instruction

**File:** `src/instructions/anchor_field_hash.rs`

This instruction CPIs to the SPL Memo program to write the field hash string into the transaction logs — that's what appears on Solana Explorer.

```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use crate::{constants::*, error::LokalError, state::ClusterRecord};

pub fn handler(
    ctx: Context<AnchorFieldHash>,
    _slug: String,
    field_code: String,
    field_hash: String,
) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.cluster_record.authority,
        LokalError::Unauthorized
    );
    require!(field_code.len() <= MAX_FIELD_CODE_LEN, LokalError::FieldCodeTooLong);
    require!(field_hash.len() == MAX_FIELD_HASH_LEN, LokalError::InvalidFieldHash);

    let record = &mut ctx.accounts.cluster_record;
    let timestamp = Clock::get()?.unix_timestamp;

    // Format: LOKAL|<slug>|<field_code>|<field_hash>|<timestamp>
    let memo = format!(
        "LOKAL|{}|{}|{}|{}",
        record.cluster_slug, field_code, field_hash, timestamp
    );

    // CPI to SPL Memo program — writes memo into transaction logs
    let memo_ix = spl_memo::build_memo(memo.as_bytes(), &[]);
    invoke(&memo_ix, &[])?;

    record.validated_field_count = record
        .validated_field_count
        .checked_add(1)
        .unwrap_or(record.validated_field_count);

    msg!("Field anchored: {} | count: {}", field_code, record.validated_field_count);
    Ok(())
}

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct AnchorFieldHash<'info> {
    #[account(
        mut,
        seeds = [SEED_CLUSTER, slug.as_bytes()],
        bump,
    )]
    pub cluster_record: Account<'info, ClusterRecord>,

    pub authority: Signer<'info>,
}
```

---

## Step 6 — Instructions module (`src/instructions.rs`)

Replace stub content with:

```rust
pub mod initialize_cluster;
pub mod anchor_field_hash;

pub use initialize_cluster::*;
pub use anchor_field_hash::*;
```

---

## Step 7 — Main program entry (`src/lib.rs`)

```rust
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ");

#[program]
pub mod lokal_core {
    use super::*;

    pub fn initialize_cluster(
        ctx: Context<InitializeCluster>,
        slug: String,
        name: String,
    ) -> Result<()> {
        instructions::initialize_cluster::handler(ctx, slug, name)
    }

    pub fn anchor_field_hash(
        ctx: Context<AnchorFieldHash>,
        slug: String,
        field_code: String,
        field_hash: String,
    ) -> Result<()> {
        instructions::anchor_field_hash::handler(ctx, slug, field_code, field_hash)
    }
}
```

---

## Step 8 — Build and deploy

```bash
# From the LOKAL root (not the anchor/ subfolder):
cd anchor

# Build
anchor build

# If build succeeds:
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show 4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ
```

**If anchor build fails with `spl-memo` dependency error:**
1. Try `spl-memo = { version = "5", features = ["no-entrypoint"] }` in Cargo.toml
2. Run `cargo update` inside `anchor/`
3. If still failing, use the raw invoke approach (see Appendix A)

**After successful deploy:**
Add to `.env.local`:
```
NEXT_PUBLIC_LOKAL_CORE_PROGRAM_ID=4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ
```
(This should already be there — verify it matches.)

**Commit the generated IDL:**
```bash
git add anchor/target/idl/lokal_core.json
git add anchor/target/types/lokal_core.ts
```
These files are needed by T-13 (TypeScript Anchor client).

---

## Step 9 — Quick smoke test (optional before T-09)

You can verify both instructions work from the Anchor test file or via a quick CLI call:

```bash
# Inside anchor/
anchor run test
# (only if you set up tests in anchor/tests/lokal-core.ts first)
```

Or open Solana Explorer → search program ID → confirm it's deployed on devnet.

---

## What to update in STATE.md after this ticket

```markdown
| T-08 | Anchor Program `lokal_core` | Dylan | DONE | Program ID: 4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ. Two instructions: initialize_cluster, anchor_field_hash. IDL committed. |
| T-02 | Anchor Workspace Init | Dylan | DONE | Already had workspace + program ID deployed. |
```

---

## Appendix A — Raw Memo CPI (fallback if spl-memo won't compile)

If `spl-memo` version conflicts with Anchor 1.0's dependency tree, skip the crate entirely and build the instruction manually:

```rust
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::invoke,
    pubkey,
};

// Hardcoded Memo program ID — stable, never changes
const MEMO_PROGRAM_ID: Pubkey = pubkey!("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

fn build_memo_ix(memo: &str) -> Instruction {
    Instruction {
        program_id: MEMO_PROGRAM_ID,
        accounts: vec![],       // Memo needs no account metas
        data: memo.as_bytes().to_vec(),
    }
}

// In handler:
let memo_ix = build_memo_ix(&memo);
invoke(&memo_ix, &[])?;
```

Remove `spl-memo` from Cargo.toml if using this approach.

---

## Appendix B — Instruction file locations

```
anchor/programs/lokal-core/src/
├── lib.rs                          ← Step 7
├── constants.rs                    ← Step 2
├── error.rs                        ← Step 3
├── state.rs                        ← Step 1
├── instructions.rs                 ← Step 6 (module re-exports)
└── instructions/
    ├── initialize_cluster.rs       ← Step 4
    └── anchor_field_hash.rs        ← Step 5
```

Note: The repo currently has `instructions/initialize.rs` (the default stub). Delete `instructions/initialize.rs` and `instructions/initialize_cluster.rs` + `anchor_field_hash.rs` are the new files.

---

## Acceptance criteria (from PLAN.md)

- [ ] `anchor build` succeeds with no errors or warnings
- [ ] `anchor deploy --provider.cluster devnet` succeeds
- [ ] Program ID in `Anchor.toml [programs.devnet]` matches `declare_id!()` in `lib.rs`
- [ ] `anchor/target/idl/lokal_core.json` generated and committed
- [ ] `solana program show 4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ` confirms deployment
- [ ] IDL has two instructions: `initialize_cluster` and `anchor_field_hash`

---

_Written 2026-04-25. Use context7 for any Anchor API uncertainty — do not rely on training data for Anchor 1.0 syntax._
