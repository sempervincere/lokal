# LOKAL — Technical Design Document v2.0

> **Indonesia's F&B Hyperlocal Market Intelligence Platform on Solana**
> _"Simulate before you operate."_

| Field         | Value                                                 |
| ------------- | ----------------------------------------------------- |
| **Version**   | 2.0 (Hackathon-Scoped)                                |
| **Status**    | MVP / Active Build                                    |
| **Hackathon** | Superteam Indonesia — Frontier Colosseum              |
| **Deadline**  | 26 days from kickoff                                  |
| **Team**      | Dylan (Blockchain + Product) · Daffa (Full-Stack Web) |

---

## Table of Contents

1. [What We Are Building](#1-what-we-are-building)
2. [The Three Core Flows](#2-the-three-core-flows)
3. [Tech Stack](#3-tech-stack)
4. [Database Schema](#4-database-schema)
5. [Blockchain Layer](#5-blockchain-layer)
6. [AI & Report Generation](#6-ai--report-generation)
7. [API Design](#7-api-design)
8. [Project Folder Structure](#8-project-folder-structure)
9. [Payment Flow](#9-payment-flow)
10. [Edge Cases & Error Handling](#10-edge-cases--error-handling)
11. [Environment Variables](#11-environment-variables)
12. [26-Day Sprint Plan](#12-26-day-sprint-plan)
13. [Demo Day Checklist](#13-demo-day-checklist)
14. [Glossary](#14-glossary)

---

## 1. What We Are Building

LOKAL is a **hyperlocal market intelligence platform** where businesses simulate their F&B concept in a real geographic area before they spend a single rupiah opening one.

### The Problem

90% of F&B businesses fail within a year. The alternatives for market research are:

- Gut feeling (most common)
- Manual research: 3–6 months, still surface-level
- General LLMs: no local context
- Business consultants: Rp 1.25M+ per hour

### The Solution

LOKAL runs **Clusters** — curated 1.5km geographic corridors researched by a local **Cluster Owner (CO)**. A CO collects real behavioral, demographic, and market data from 20–30 respondents in their area. That data lives on the platform and powers an AI simulation report for any **Business Owner (BO)** who wants to open an F&B there.

**The BO pays Rp 400,000 (in IDRX on Solana). They get a 10-section business simulation report + 12-hour AI consultation window.**

### The Three User Types

| User                    | What They Do                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cluster Owner (CO)**  | Researches a 1.5km corridor. Submits behavioral + market data. Gets paid per validated field and earns passive income from every session run on their cluster. |
| **Business Owner (BO)** | Browses clusters. Gets 7 free AI chat messages. Pays 400K IDRX to unlock a full simulation report for their F&B concept.                                       |
| **Admin**               | Reviews CO field submissions. Approves clusters. Manages data quality. (Handled manually by Dylan for MVP.)                                                    |

### The Data Mental Model

```
CLUSTER (1.5km geographic corridor)
  ├── owned by → CLUSTER OWNER (has soulbound NFT credential on Solana)
  ├── has → DATA FIELDS (20 Tier 1 fields for MVP)
  │   ├── Survey fields → filled by 20+ respondents
  │   └── Observation fields → filled directly by CO
  ├── powers → SESSIONS (paid by Business Owner)
  │   ├── triggers → REPORT (10 sections, AI-generated)
  │   └── opens → CONSULTATION WINDOW (12h AI chat)
  └── anchored on → SOLANA (field hash, CO NFT, IDRX payment)
```

---

## 2. The Three Core Flows

### Flow 1 — Cluster Creation (CO Side)

```
Admin creates cluster manually in DB
  → CO receives invite + survey link
  → 20+ respondents fill Tier 1 survey
  → CO fills observation fields (foot traffic, competitors, etc.)
  → Admin reviews + validates fields
  → SHA-256 hash of each validated field written to Solana via Memo Program
  → CO soulbound NFT minted (Metaplex Core, NonTransferable)
  → Cluster status → "ACTIVE"
  → CO earns Rp 100,000 activation milestone
```

> **MVP note:** For the hackathon, ONE cluster (Jalan Margonda, Depok) is pre-seeded manually by Dylan. The CO onboarding flow is a secondary priority — the demo runs on a live seeded cluster.

---

### Flow 2 — Business Session (BO Side)

```
BO lands on cluster page
  → Free AI chat opens (7 messages, pulls from cluster field data)
  → Message 7 → conversion modal shown
  → BO fills concept form (F&B type, menu items + prices, target customer)
  → BO clicks "Unlock Full Report"
  → Phantom wallet opens → BO signs IDRX transfer (400,000 IDRX)
  → Helius webhook fires → backend verifies payment on-chain
  → Session activates
  → Report generation starts (single Claude API call, all 10 sections)
  → Report delivered in-browser + PDF available
  → 12-hour AI consultation window opens
```

---

### Flow 3 — Trust Anchoring (Blockchain)

```
Field validated by admin
  → SHA-256 hash computed from field value (JSON-serialized)
  → Memo transaction sent to Solana devnet
  → Hash permanently on-chain, visible on Solana Explorer

CO approved by admin
  → Metaplex Core NFT minted to CO wallet (NonTransferable plugin = soulbound)
  → NFT holds CO name, cluster slug, approval date in metadata

BO pays for session
  → Standard SPL token transfer: BO wallet → Platform treasury wallet
  → sessionId included as Memo in same transaction (for webhook matching)
  → Helius webhook detects + notifies backend
```

---

## 3. Tech Stack

### Final Stack — Chosen for Speed, Not Elegance

| Layer          | Technology                                        | Why                                                                                                  |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Frontend**   | Next.js 14 (App Router)                           | SSR + streaming + API routes in one. No separate backend.                                            |
| **Styling**    | Tailwind CSS                                      | Fastest iteration for a hackathon.                                                                   |
| **State**      | Zustand                                           | Lightweight. Handles: selected cluster, session state, wallet.                                       |
| **Wallet**     | Solana Wallet Adapter                             | The only production-grade Phantom integration. Don't hand-roll.                                      |
| **Map**        | Mapbox GL JS                                      | Cluster boundary polygon rendering. Free tier sufficient.                                            |
| **Forms**      | React Hook Form                                   | Concept form has complex validation (menu builder). Uncontrolled = no re-render lag.                 |
| **Database**   | Supabase (PostgreSQL)                             | pgvector pre-installed. Auth built-in. Realtime subscriptions for report status. Free tier.          |
| **ORM**        | Prisma                                            | Type-safe DB client. Schema-as-code. Critical for building fast without schema drift bugs.           |
| **AI**         | Anthropic Claude API (`claude-sonnet-4-20250514`) | Best structured output for complex 10-section reports. Single API call, JSON response.               |
| **Blockchain** | Anchor (Rust) + Metaplex Core                     | Anchor for programs. Metaplex Core for soulbound NFT.                                                |
| **RPC**        | Helius                                            | Webhooks for payment detection. Higher rate limits. Essential.                                       |
| **IDRX**       | Existing SPL token                                | IDR-pegged stablecoin. No custom token needed.                                                       |
| **Storage**    | Cloudflare R2                                     | Free egress. PDF + CO evidence photo storage.                                                        |
| **PDF**        | `@react-pdf/renderer`                             | Generates PDF client-side or server-side from React components. No Puppeteer/headless Chrome needed. |
| **Deployment** | Vercel                                            | Zero-config Next.js. Edge network. Streaming support.                                                |

### What We Deliberately Cut (and Why)

| Cut                             | Why                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **LangChain**                   | 40 lines of direct code does the same thing for MVP. One cluster, 20 known fields — just dump them into the prompt. |
| **pgvector / RAG embeddings**   | No semantic search needed when you have one cluster and all fields fit in a single prompt. Add post-hackathon.      |
| **BullMQ + Railway worker**     | Report generation runs as an async Vercel route with 60s timeout. Max 5 demo users — no queue needed.               |
| **Turborepo monorepo**          | Single Next.js app + `/anchor` subfolder. Monorepo setup eats 1–2 days of Daffa's time for zero demo benefit.       |
| **Puppeteer / headless Chrome** | `@react-pdf/renderer` generates clean PDFs with zero infra headache.                                                |
| **Separate Express/Fastify**    | Next.js API routes handle everything.                                                                               |
| **Redis rate limiting**         | Check message count from DB (`WHERE session_id = x AND is_free = true`). Same result, zero extra service.           |
| **Dual CO score system**        | One `co_score` int (0–100) for MVP. Reputation vs Trust nuance is post-hackathon product logic.                     |
| **Full 53-field catalog**       | Seed 20 Tier 1 fields only. All that matter for demo.                                                               |
| **13-entity DB schema**         | 7-entity lean schema. See Section 4.                                                                                |

---

## 4. Database Schema

### 4.1 Overview — 8 Core Tables

```
users
  └── cluster_owners (1:1)

clusters
  └── cluster_field_values (1:N)

sessions
  ├── concept_forms (1:1)
  ├── reports (1:1)
  └── messages (1:N)
```

### 4.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────

enum UserRole {
  BUSINESS_OWNER
  CLUSTER_OWNER
  ADMIN
}

enum ClusterStatus {
  SEEDING    // CO is collecting data
  ACTIVE     // Fully validated, open for sessions
  DEPRECATED // Retired
}

enum FieldStatus {
  PENDING     // Submitted by CO, awaiting admin review
  VALIDATED   // Approved — hash anchored on-chain
  REJECTED    // Failed admin review
}

enum SessionStatus {
  PENDING_PAYMENT
  PAYMENT_CONFIRMED
  GENERATING_REPORT
  ACTIVE     // Report delivered, 12h window open
  EXPIRED
  FAILED
}

enum ReportStatus {
  PENDING
  GENERATING
  COMPLETE
  FAILED
}

// ─── USERS ────────────────────────────────────────────────

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  fullName     String   @map("full_name")
  role         UserRole @default(BUSINESS_OWNER)
  walletAddress String? @unique @map("wallet_address") // Solana base58
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  clusterOwner ClusterOwner?
  sessions     Session[]
  messages     Message[]

  @@map("users")
}

model ClusterOwner {
  id            String   @id @default(uuid())
  userId        String   @unique @map("user_id")
  coScore       Int      @default(0) @map("co_score") // 0–100
  nftMintAddress String? @map("nft_mint_address")     // Soulbound NFT on Solana
  nftTxSignature String? @map("nft_tx_signature")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")

  user          User      @relation(fields: [userId], references: [id])
  clusters      Cluster[]
  coEarnings   CoEarning[]

  @@map("cluster_owners")
}

model CoEarning {
  id           String       @id @default(uuid())
  coId         String       @map("co_id")
  type         CoEarningType
  amountIdrx   Decimal      @map("amount_idrx") @db.Decimal(18, 2)
  description  String
  clusterId    String?      @map("cluster_id")
  sessionId    String?      @map("session_id")
  isPaid       Boolean      @default(false) @map("is_paid")
  paidAt       DateTime?    @map("paid_at")
  createdAt    DateTime     @default(now()) @map("created_at")

  clusterOwner ClusterOwner @relation(fields: [coId], references: [id])

  @@map("co_earnings")
}

enum CoEarningType {
  SESSION_SHARE      // CO earns % of each session run on their cluster
  FIELD_SUBMISSION   // CO earns flat reward per validated field (post-hackathon)
  REFRESH_BONUS      // CO earns for quarterly data refresh (post-hackathon)
}

// ─── CLUSTERS ─────────────────────────────────────────────

model Cluster {
  id                  String        @id @default(uuid())
  slug                String        @unique // e.g. "depok-margonda-001"
  name                String        // e.g. "Jalan Margonda Corridor"
  description         String?
  ownerId             String        @map("owner_id")
  status              ClusterStatus @default(SEEDING)

  // Geographic
  anchorLat           Float         @map("anchor_lat")
  anchorLng           Float         @map("anchor_lng")
  radiusKm            Float         @default(1.5) @map("radius_km")
  anchorLabel         String        @map("anchor_label") // e.g. "UI Depok Gate"

  // Data quality
  dataCompleteness    Int           @default(0) @map("data_completeness") // 0–100 %
  confidenceScore     Int           @default(0) @map("confidence_score")  // 0–100
  totalValidatedFields Int          @default(0) @map("total_validated_fields")

  // Solana
  onchainSlug         String?       @map("onchain_slug") // Written to Solana on first hash

  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  owner               ClusterOwner  @relation(fields: [ownerId], references: [id])
  fieldValues         ClusterFieldValue[]
  sessions            Session[]

  @@map("clusters")
}

// Field values — the actual research data for each cluster

model ClusterFieldValue {
  id               String      @id @default(uuid())
  clusterId        String      @map("cluster_id")
  fieldCode        String      @map("field_code")  // B1, M3, C5 etc.
  fieldName        String      @map("field_name")
  tier             Int                              // 1, 2, or 3
  category         String                           // BEHAVIORAL, MARKET, DEMOGRAPHIC, etc.
  collectionMethod String      @map("collection_method") // SURVEY | OBSERVATION | RESEARCH
  isComplex        Boolean     @default(false) @map("is_complex") // complex = survey-based

  value            Json                             // The actual data (flexible per field)
  status           FieldStatus @default(PENDING)

  // Evidence
  evidenceNote     String?     @map("evidence_note")
  evidencePhotoUrl String?     @map("evidence_photo_url") // R2 URL

  // On-chain proof
  fieldHash        String?     @map("field_hash")  // SHA-256 of value
  solTxSignature   String?     @map("sol_tx_signature") // Memo tx on Solana

  submittedAt      DateTime    @default(now()) @map("submitted_at")
  validatedAt      DateTime?   @map("validated_at")

  cluster          Cluster     @relation(fields: [clusterId], references: [id])

  @@unique([clusterId, fieldCode])
  @@map("cluster_field_values")
}

// ─── SESSIONS ─────────────────────────────────────────────

model Session {
  id               String        @id @default(uuid())
  userId           String        @map("user_id")
  clusterId        String        @map("cluster_id")

  status           SessionStatus @default(PENDING_PAYMENT)
  amountIdrx       Decimal       @default(400000) @map("amount_idrx") @db.Decimal(18, 2)
  solTxSignature   String?       @unique @map("sol_tx_signature")

  freeMessageCount Int           @default(0) @map("free_message_count") // caps at 7

  activatedAt      DateTime?     @map("activated_at")
  expiresAt        DateTime?     @map("expires_at")  // activatedAt + 12h
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")

  user             User          @relation(fields: [userId], references: [id])
  cluster          Cluster       @relation(fields: [clusterId], references: [id])
  conceptForm      ConceptForm?
  report           Report?
  messages         Message[]

  @@map("sessions")
}

model ConceptForm {
  id                  String   @id @default(uuid())
  sessionId           String   @unique @map("session_id")

  fbSubcategory       String   @map("fb_subcategory")    // "Specialty Coffee", "Warung Nasi" etc.
  conceptName         String   @map("concept_name")
  conceptDescription  String   @map("concept_description")
  targetCustomer      String   @map("target_customer")
  specificQuestions   String?  @map("specific_questions")
  menuItems           Json     @map("menu_items")         // [{name, price, description, category}]

  submittedAt         DateTime @default(now()) @map("submitted_at")

  session             Session  @relation(fields: [sessionId], references: [id])

  @@map("concept_forms")
}

model Report {
  id              String       @id @default(uuid())
  sessionId       String       @unique @map("session_id")
  status          ReportStatus @default(PENDING)

  // All 10 sections stored as structured JSON
  sections        Json?        // { section1: {...}, section2: {...}, ... section10: {...} }

  pdfUrl          String?      @map("pdf_url")            // Cloudflare R2 URL
  tokensUsed      Int?         @map("tokens_used")
  generationTimeMs Int?        @map("generation_time_ms")
  errorMessage    String?      @map("error_message")
  retryCount      Int          @default(0) @map("retry_count")

  createdAt       DateTime     @default(now()) @map("created_at")
  completedAt     DateTime?    @map("completed_at")

  session         Session      @relation(fields: [sessionId], references: [id])

  @@map("reports")
}

model Message {
  id          String   @id @default(uuid())
  sessionId   String?  @map("session_id")  // null = pre-payment free chat
  userId      String   @map("user_id")
  clusterId   String   @map("cluster_id")

  role        String                        // "user" | "assistant"
  content     String   @db.Text
  isFree      Boolean  @default(true) @map("is_free")
  messageNum  Int?     @map("message_num") // 1–7 for free messages

  createdAt   DateTime @default(now()) @map("created_at")

  session     Session? @relation(fields: [sessionId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@map("messages")
}
```

### 4.3 SQL — Extensions + Seed Data

```sql
-- Run first in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seed: Tier 1 field definitions (20 fields for MVP)
-- Stored in cluster_field_values per cluster, not a separate catalog table.
-- fieldCode constants live in /src/lib/constants/fields.ts
```

### 4.4 Field Code Reference (Tier 1 — 20 Fields)

| Code | Name                                      | Method      | Complex? |
| ---- | ----------------------------------------- | ----------- | -------- |
| B1   | Max willingness to pay by F&B subcategory | Survey      | ✓        |
| B2   | Price sensitivity index                   | Survey      | ✓        |
| B3   | Peak hours pattern                        | Observation | –        |
| B4   | Digital payment adoption rate             | Survey      | ✓        |
| B5   | Delivery vs dine-in preference split      | Survey      | ✓        |
| M1   | F&B density by subcategory                | Observation | –        |
| M2   | Average price by F&B subcategory          | Observation | –        |
| M3   | Top 5 local competitors                   | Observation | –        |
| M4   | Category saturation rating                | Observation | –        |
| M5   | Recent closure case study                 | Research    | –        |
| D1   | Age distribution                          | Survey      | ✓        |
| D2   | Income bracket distribution               | Survey      | ✓        |
| D3   | Primary occupation mix                    | Survey      | ✓        |
| MS1  | Foot traffic estimates                    | Observation | –        |
| MS2  | Market gap / underserved category         | Observation | –        |
| C1   | Halal sensitivity level                   | Survey      | ✓        |
| C2   | Trend adoption lag                        | Research    | –        |
| C3   | Dining occasion split                     | Survey      | ✓        |
| C4   | Transport access score                    | Observation | –        |
| C5   | Anchor points within 500m                 | Observation | –        |

> Tier 2 and 3 fields exist in the product roadmap but are **not seeded for the hackathon MVP**. Add post-launch.

---

## 5. Blockchain Layer

> **Owner: Dylan**

### 5.1 What LOKAL Uses Solana For (MVP Scope Only)

Three things. Nothing more.

| What                    | How                                                                         | Who Triggers                             |
| ----------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| **Data hash anchoring** | Memo Program transaction containing SHA-256 of a validated field            | Backend (admin validates → hash written) |
| **CO soulbound NFT**    | Metaplex Core NFT with NonTransferable plugin minted to CO wallet           | Dylan (admin action)                     |
| **IDRX payment**        | Standard SPL token transfer, BO wallet → platform wallet. sessionId in Memo | BO via Phantom                           |

### 5.2 Anchor Program — `lokal_core`

One program. Handles both hash anchoring and NFT credential minting.

**Why one program?** Two programs means two deployments, two program IDs to manage, two test suites. For a 26-day build, one is always the right answer.

```rust
// programs/lokal-core/src/lib.rs
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod lokal_core {
    use super::*;

    /// Initializes the on-chain record for a cluster.
    /// Called once when Admin marks a cluster as ACTIVE.
    pub fn initialize_cluster(
        ctx: Context<InitializeCluster>,
        cluster_slug: String,
        cluster_name: String,
    ) -> Result<()> {
        let record = &mut ctx.accounts.cluster_record;
        record.cluster_slug = cluster_slug;
        record.cluster_name = cluster_name;
        record.authority = ctx.accounts.authority.key();
        record.validated_field_count = 0;
        record.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Anchors a SHA-256 hash of a validated field value via Memo program.
    /// Called once per validated field.
    pub fn anchor_field_hash(
        ctx: Context<AnchorFieldHash>,
        cluster_slug: String,
        field_code: String,
        field_hash: String,
        timestamp: i64,
    ) -> Result<()> {
        let memo = format!(
            "LOKAL|{}|{}|{}|{}",
            cluster_slug, field_code, field_hash, timestamp
        );

        let memo_ix = spl_memo::build_memo(memo.as_bytes(), &[]);
        invoke(&memo_ix, &[ctx.accounts.authority.to_account_info()])?;

        let record = &mut ctx.accounts.cluster_record;
        record.validated_field_count += 1;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(cluster_slug: String)]
pub struct InitializeCluster<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 64 + 128 + 32 + 4 + 8,
        seeds = [b"cluster", cluster_slug.as_bytes()],
        bump
    )]
    pub cluster_record: Account<'info, ClusterRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cluster_slug: String)]
pub struct AnchorFieldHash<'info> {
    #[account(
        mut,
        seeds = [b"cluster", cluster_slug.as_bytes()],
        bump
    )]
    pub cluster_record: Account<'info, ClusterRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Memo program — no validation needed
    pub memo_program: AccountInfo<'info>,
}

#[account]
pub struct ClusterRecord {
    pub cluster_slug: String,         // max 64 chars
    pub cluster_name: String,         // max 128 chars
    pub authority: Pubkey,
    pub validated_field_count: u32,
    pub created_at: i64,
}
```

### 5.3 CO Soulbound NFT — Metaplex Core (TypeScript, not Rust)

The NFT is minted from the backend using the Metaplex Core JS SDK. No custom Rust needed for this.

```typescript
// src/lib/solana/mintCoNft.ts
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { create, fetchAsset } from "@metaplex-foundation/mpl-core";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { addPlugin } from "@metaplex-foundation/mpl-core";

export async function mintCoCredentialNft(
  coWalletAddress: string,
  coName: string,
  clusterSlug: string,
) {
  const umi = createUmi(process.env.HELIUS_RPC_URL!);
  // Load platform keypair as signer (from env)
  const platformSigner = loadPlatformSigner(); // helper: loads PLATFORM_KEYPAIR from env

  const assetSigner = generateSigner(umi);

  const tx = await create(umi, {
    asset: assetSigner,
    name: `LOKAL CO — ${coName}`,
    uri: buildNftMetadataUri({ coName, clusterSlug }), // JSON metadata stored in R2
    plugins: [
      {
        type: "NonTransferable", // Makes it soulbound
      },
    ],
  }).sendAndConfirm(umi);

  return {
    mintAddress: assetSigner.publicKey,
    txSignature: tx.signature,
  };
}
```

### 5.4 IDRX Payment Transaction (Frontend)

```typescript
// src/lib/solana/idrxTransfer.ts
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";

const IDRX_MINT = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT_ADDRESS!);
const IDRX_DECIMALS = 2;
const SESSION_PRICE = 400000_00; // 400,000 IDRX × 10^2 base units

export async function createPaymentTransaction(
  userWallet: PublicKey,
  sessionId: string,
  connection: Connection,
): Promise<Transaction> {
  const platformWallet = new PublicKey(
    process.env.NEXT_PUBLIC_PLATFORM_WALLET!,
  );

  const userTokenAccount = await getAssociatedTokenAddress(
    IDRX_MINT,
    userWallet,
  );
  const platformTokenAccount = await getAssociatedTokenAddress(
    IDRX_MINT,
    platformWallet,
  );

  const { blockhash } = await connection.getLatestBlockhash();

  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: userWallet,
  });

  // Memo includes sessionId so Helius webhook can match payment to session
  tx.add(createMemoInstruction(sessionId, [userWallet]));

  tx.add(
    createTransferCheckedInstruction(
      userTokenAccount,
      IDRX_MINT,
      platformTokenAccount,
      userWallet,
      SESSION_PRICE,
      IDRX_DECIMALS,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  return tx;
}
```

### 5.5 Field Hash Helper (Backend)

```typescript
// src/lib/solana/fieldHash.ts
import crypto from "crypto";

export function computeFieldHash(fieldCode: string, value: unknown): string {
  const normalized = JSON.stringify(
    { fieldCode, value },
    Object.keys({ fieldCode, value }).sort(),
  );
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
```

---

## 6. AI & Report Generation

### 6.1 Free Chat (Pre-Payment)

- 7 messages maximum, scoped to a single cluster
- No embeddings, no RAG — inject top Tier 1 fields directly into system prompt
- Message count tracked in `sessions.free_message_count`
- Message 7 response always ends with the conversion hook

```typescript
// src/lib/ai/freeChat.ts
export async function buildFreeChatSystemPrompt(
  clusterId: string,
): Promise<string> {
  const fields = await prisma.clusterFieldValue.findMany({
    where: { clusterId, status: "VALIDATED", tier: 1 },
    orderBy: { fieldCode: "asc" },
  });

  const fieldSummary = fields
    .map((f) => `[${f.fieldCode}] ${f.fieldName}: ${JSON.stringify(f.value)}`)
    .join("\n");

  return `You are LOKAL's market intelligence assistant for the ${clusterName} corridor in Indonesia.
You have access to real, validated hyperlocal data collected from 20+ respondents in this area.

CLUSTER DATA:
${fieldSummary}

RULES:
- Only answer questions about this cluster. If asked about other areas, say "Your free session is scoped to ${clusterName}."
- Cite specific field codes when referencing data (e.g., "Based on field B1...")
- Be direct and data-driven. Avoid generic business advice.
- After your 7th response, end with: "You've reached the limit of your free preview. Unlock a full 10-section simulation report for Rp 400,000 — including pricing strategy, competitor analysis, and a go-to-market playbook."`;
}
```

### 6.2 Report Generation — Single Claude API Call

**No BullMQ. No queue. One async API route with a 60s Vercel function timeout.**

The entire 10-section report is generated in a single structured Claude call. This is faster (one round-trip vs ten), cheaper, and infinitely simpler to debug.

````typescript
// src/lib/ai/reportGenerator.ts
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { computeFieldHash } from "@/lib/solana/fieldHash";

const client = new Anthropic();

export async function generateReport(sessionId: string): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      conceptForm: true,
      cluster: { include: { fieldValues: { where: { status: "VALIDATED" } } } },
    },
  });

  if (!session?.conceptForm) throw new Error("No concept form found");

  await prisma.report.update({
    where: { sessionId },
    data: { status: "GENERATING" },
  });
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "GENERATING_REPORT" },
  });

  const fieldData = session.cluster.fieldValues
    .map((f) => `[${f.fieldCode}] ${f.fieldName}: ${JSON.stringify(f.value)}`)
    .join("\n");

  const concept = session.conceptForm;
  const menuStr = (concept.menuItems as any[])
    .map((m) => `  - ${m.name}: Rp ${m.price}`)
    .join("\n");

  const prompt = `You are LOKAL's report engine. Generate a 10-section business simulation report.

CLUSTER: ${session.cluster.name} (${session.cluster.anchorLabel})
VALIDATED FIELD DATA:
${fieldData}

BUSINESS CONCEPT:
- F&B Type: ${concept.fbSubcategory}
- Name: ${concept.conceptName}
- Description: ${concept.conceptDescription}
- Target Customer: ${concept.targetCustomer}
- Menu:
${menuStr}
- Specific Questions: ${concept.specificQuestions ?? "None"}

Generate a JSON object with exactly these 10 keys. Each section must cite specific field codes:
{
  "section1": { "title": "Executive Cluster Summary", "content": "...", "keyInsights": ["..."] },
  "section2": { "title": "Customer Profile", "content": "...", "segments": [...] },
  "section3": { "title": "Market Sizing", "content": "...", "estimate": "..." },
  "section4": { "title": "Competitive Landscape", "content": "...", "topCompetitors": [...] },
  "section5": { "title": "Location Intelligence", "content": "...", "footTrafficNote": "..." },
  "section6": { "title": "Pricing Strategy", "content": "...", "recommendation": "...", "riskFlags": [...] },
  "section7": { "title": "Product-Market Fit Simulation", "content": "...", "fitScore": 0-100, "rationale": "..." },
  "section8": { "title": "Go-to-Market Playbook", "content": "...", "actions": [...] },
  "section9": { "title": "Risk Register", "content": "...", "risks": [{"risk": "...", "severity": "HIGH|MED|LOW", "mitigation": "..."}] },
  "section10": { "title": "Financial Scenario Modeling", "content": "...", "scenarios": [...] }
}

CRITICAL: Return ONLY the JSON object. No preamble. No markdown fences.`;

  const start = Date.now();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "";
  const sections = JSON.parse(raw.replace(/```json|```/g, "").trim());

  const pdfUrl = await generateReportPdf(
    session.id,
    sections,
    session.cluster.name,
    concept,
  );

  await prisma.$transaction([
    prisma.report.update({
      where: { sessionId },
      data: {
        status: "COMPLETE",
        sections,
        pdfUrl,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        generationTimeMs: Date.now() - start,
        completedAt: new Date(),
      },
    }),
    prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      },
    }),
    prisma.coEarning.create({
      data: {
        coId: session.cluster.ownerId,
        type: "SESSION_SHARE",
        amountIdrx: new Decimal(400000 * 0.05), // 5% flat for MVP — no tier logic needed
        description: `Session revenue share — ${session.cluster.name}`,
        clusterId: session.clusterId,
        sessionId: sessionId,
      },
    }),
  ]);
}
````

### 6.3 PDF Generation

```typescript
// src/lib/pdf/generateReportPdf.ts
// Using @react-pdf/renderer — no Puppeteer, no headless Chrome, no infra headache.

import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/pdf/ReportDocument";
import { uploadToR2 } from "@/lib/storage/r2";

export async function generateReportPdf(
  sessionId: string,
  sections: Record<string, object>,
  clusterName: string,
  conceptForm: any
): Promise<string> {
  const buffer = await renderToBuffer(
    <ReportDocument sections={sections} clusterName={clusterName} concept={conceptForm} />
  );

  const key = `reports/${sessionId}.pdf`;
  await uploadToR2(key, buffer, "application/pdf");
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}
```

### 6.4 Paid Consultation Chat (Post-Report)

Same architecture as free chat but without the 7-message limit and with the full report context injected.

```typescript
// Additional system prompt context for paid chat:
`You are LOKAL's market intelligence assistant for ${clusterName}.
The user has purchased a full simulation report. Below is their report summary and cluster data.
Answer any follow-up questions. Stay scoped to this cluster and their specific concept.

CONCEPT: ${conceptName} (${fbSubcategory})
REPORT SUMMARY: ${JSON.stringify(sections.section1)}
CLUSTER DATA: ${fieldData}`;
```

---

## 7. API Design

### Route Overview

| Route                        | Method | Auth   | What It Does                                               |
| ---------------------------- | ------ | ------ | ---------------------------------------------------------- |
| `/api/clusters`              | GET    | Public | List active clusters with basic stats                      |
| `/api/clusters/[slug]`       | GET    | Public | Cluster detail + validated field summary                   |
| `/api/chat`                  | POST   | User   | Send chat message (free or paid). Checks limit.            |
| `/api/sessions`              | POST   | User   | Create session (pre-payment)                               |
| `/api/sessions/[id]`         | GET    | Owner  | Get session status + report                                |
| `/api/sessions/[id]/concept` | POST   | Owner  | Submit concept form                                        |
| `/api/sessions/[id]/report`  | POST   | Owner  | Trigger report generation (called after payment confirmed) |
| `/api/webhooks/helius`       | POST   | HMAC   | Detect IDRX payment → activate session                     |
| `/api/admin/clusters`        | POST   | Admin  | Create cluster                                             |
| `/api/admin/fields`          | POST   | Admin  | Validate field → triggers hash anchor                      |

### Key Route Implementations

#### Chat Route

```typescript
// src/app/api/chat/route.ts
export async function POST(req: Request) {
  const { sessionId, clusterId, message, userId } = await req.json();

  // Check free message limit
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });
  const isPaid = session?.status === "ACTIVE";

  if (!isPaid) {
    const count = await prisma.message.count({
      where: { sessionId, isFree: true },
    });
    if (count >= 7) {
      return Response.json({ error: "FREE_LIMIT_REACHED" }, { status: 402 });
    }
  }

  // Save user message
  await prisma.message.create({
    data: {
      sessionId,
      userId,
      clusterId,
      role: "user",
      content: message,
      isFree: !isPaid,
    },
  });

  // Build system prompt + call Claude (streaming)
  const systemPrompt = isPaid
    ? await buildPaidChatSystemPrompt(sessionId)
    : await buildFreeChatSystemPrompt(clusterId);

  const history = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages: history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  // Stream response to client, save when done
  return new StreamingTextResponse(stream.toReadableStream());
}
```

#### Helius Webhook Route

```typescript
// src/app/api/webhooks/helius/route.ts
import crypto from "crypto";

export async function POST(req: Request) {
  // 1. Verify HMAC signature
  const signature = req.headers.get("helius-signature");
  const body = await req.text();
  const expected = crypto
    .createHmac("sha256", process.env.HELIUS_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  if (signature !== expected)
    return new Response("Unauthorized", { status: 401 });

  const payload = JSON.parse(body);

  // 2. Find the IDRX transfer to our platform wallet
  for (const tx of payload) {
    const idrxTransfer = tx.tokenTransfers?.find(
      (t: any) =>
        t.mint === process.env.IDRX_MINT_ADDRESS &&
        t.toUserAccount === process.env.NEXT_PUBLIC_PLATFORM_WALLET &&
        t.tokenAmount === 400000,
    );

    if (!idrxTransfer) continue;

    // 3. Extract sessionId from memo
    const memo = tx.instructions?.find(
      (i: any) => i.programId === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    )?.data;
    const sessionId = memo
      ? Buffer.from(memo, "base64").toString("utf-8")
      : null;

    if (!sessionId) continue;

    // 4. Deduplicate
    const existing = await prisma.session.findFirst({
      where: { solTxSignature: tx.signature },
    });
    if (existing) continue;

    // 5. Activate session + trigger report generation
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "PAYMENT_CONFIRMED", solTxSignature: tx.signature },
    });

    // Fire-and-forget report generation (async, non-blocking)
    generateReport(sessionId).catch(console.error);
  }

  return new Response("OK", { status: 200 });
}
```

---

## 8. Project Folder Structure

Single Next.js app. No monorepo. Anchor workspace lives in `/anchor`.

```
lokal/
├── anchor/                          # ← Dylan owns this
│   ├── programs/
│   │   └── lokal-core/
│   │       └── src/
│   │           └── lib.rs
│   ├── tests/
│   │   └── lokal-core.ts
│   ├── Anchor.toml
│   └── Cargo.toml
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                      # Seeds Margonda cluster + 20 Tier 1 fields
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (public)/
│   │   │   ├── page.tsx             # Landing page
│   │   │   └── clusters/
│   │   │       ├── page.tsx         # Cluster browser + map
│   │   │       └── [slug]/
│   │   │           └── page.tsx     # Cluster detail + free chat
│   │   ├── (auth)/
│   │   │   ├── dashboard/           # BO dashboard (sessions, reports)
│   │   │   └── session/
│   │   │       └── [id]/
│   │   │           ├── page.tsx     # Report viewer + paid chat
│   │   │           └── concept/
│   │   │               └── page.tsx # Concept form (menu builder)
│   │   ├── admin/                   # Admin dashboard (field review, cluster mgmt)
│   │   │   ├── page.tsx
│   │   │   └── clusters/
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── clusters/
│   │       │   ├── route.ts
│   │       │   └── [slug]/
│   │       │       └── route.ts
│   │       ├── chat/
│   │       │   └── route.ts
│   │       ├── sessions/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── concept/route.ts
│   │       │       └── report/route.ts
│   │       ├── webhooks/
│   │       │   └── helius/route.ts
│   │       └── admin/
│   │           ├── clusters/route.ts
│   │           └── fields/route.ts
│   │
│   ├── components/
│   │   ├── cluster/
│   │   │   ├── ClusterCard.tsx
│   │   │   ├── ClusterMap.tsx       # Mapbox GL, 1.5km radius polygon
│   │   │   └── ClusterStats.tsx     # Data completeness, confidence score
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ConversionModal.tsx  # Shown at message 7
│   │   ├── session/
│   │   │   ├── ConceptForm.tsx      # F&B type, menu builder, target customer
│   │   │   ├── PaymentButton.tsx    # Phantom wallet + IDRX transfer
│   │   │   └── ReportViewer.tsx     # 10-section report renderer
│   │   ├── pdf/
│   │   │   └── ReportDocument.tsx   # @react-pdf/renderer component
│   │   └── ui/                      # Shared: Button, Card, Badge, Modal, etc.
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── freeChat.ts          # System prompt builder for free chat
│   │   │   ├── paidChat.ts          # System prompt builder for paid chat
│   │   │   └── reportGenerator.ts   # Full 10-section report generation
│   │   ├── solana/
│   │   │   ├── idrxTransfer.ts      # Payment transaction builder
│   │   │   ├── fieldHash.ts         # SHA-256 hash helper
│   │   │   ├── mintCoNft.ts         # Metaplex Core NFT minting
│   │   │   └── anchorClient.ts      # Anchor program client (lokal-core)
│   │   ├── pdf/
│   │   │   └── generateReportPdf.ts
│   │   ├── storage/
│   │   │   └── r2.ts                # Cloudflare R2 upload helper
│   │   ├── prisma.ts                # Singleton Prisma client
│   │   └── constants/
│   │       ├── fields.ts            # TIER_1_FIELD_CODES, field metadata
│   │       └── pricing.ts           # SESSION_PRICE_IDRX = 400000
│   │
│   └── types/
│       ├── cluster.ts
│       ├── session.ts
│       └── report.ts
│
├── scripts/
│   └── seed-margonda.ts             # Manually seed demo cluster with real data
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 9. Payment Flow

### Full Payment → Report Lifecycle

```
1. BO clicks "Unlock Full Report"
   └── Frontend: createPaymentTransaction(userWallet, sessionId, connection)

2. Phantom signs + submits transaction
   ├── SPL transfer: 400,000 IDRX → Platform wallet
   └── Memo: sessionId

3. Helius webhook fires (usually within 2–5 seconds)
   └── POST /api/webhooks/helius
       ├── HMAC verified
       ├── sessionId extracted from Memo
       ├── Amount verified (must equal 400,000)
       ├── Session updated: status → PAYMENT_CONFIRMED
       └── generateReport(sessionId) called async

4. Report generation runs (~20–40 seconds)
   ├── Fields fetched from DB
   ├── Single Claude API call → 10 sections JSON
   ├── PDF generated via @react-pdf/renderer
   ├── PDF uploaded to R2
   └── Report updated: status → COMPLETE

5. Frontend polls session status every 3 seconds
   └── When status === ACTIVE → redirect to /session/[id]

6. BO sees report + 12-hour chat window opens
```

### Polling Fallback (If Webhook Fails)

```typescript
// src/app/api/sessions/[id]/verify-payment/route.ts
// Called by frontend every 30s if status stays PENDING_PAYMENT after wallet confirms

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await prisma.session.findUnique({ where: { id: params.id } });

  if (session?.solTxSignature) {
    // Already processed
    return Response.json({ status: session.status });
  }

  // Check Helius for recent transfers to platform wallet
  const recentTxs = await helius.getTransactionHistory(PLATFORM_WALLET, {
    limit: 10,
  });
  const match = recentTxs.find((tx) => tx.memo === params.id);

  if (match) {
    await activateSession(params.id, match.signature);
    generateReport(params.id).catch(console.error);
  }

  return Response.json({ status: session?.status });
}
```

---

## 10. Edge Cases & Error Handling

### Payment Edge Cases

| Scenario                                | Handling                                                                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Webhook fires but sessionId not in memo | Skip silently. Log. Manual admin review.                                                                                                     |
| Wrong IDRX amount                       | Don't activate. Store tx signature. Admin reviews.                                                                                           |
| Double payment (duplicate tx)           | `solTxSignature UNIQUE` constraint rejects duplicate.                                                                                        |
| Webhook never fires                     | Frontend polling fallback every 30s for up to 10 minutes.                                                                                    |
| Report generation crashes               | Catch error → `report.status = FAILED`, `session.status = FAILED`. BO sees "Generating failed — contact support." Admin retriggers manually. |

### AI Edge Cases

| Scenario                                   | Handling                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Claude returns invalid JSON                | Strip markdown fences, retry parse. If still fails, save raw text, mark report FAILED, log for admin.                            |
| Claude API timeout                         | Vercel route timeout at 60s. On timeout: report FAILED, session stays PAYMENT_CONFIRMED for admin retry.                         |
| Free chat at limit (7 messages)            | Return `FREE_LIMIT_REACHED` (HTTP 402). Frontend shows conversion modal. Never silently drop message.                            |
| BO asks about another cluster in paid chat | System prompt restricts scope. Claude redirected with: "Your session covers [clusterName]. Start a new session for other areas." |

### Data Edge Cases

| Scenario                       | Handling                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| CO submits same field twice    | `UNIQUE(clusterId, fieldCode)` — second upserts the existing record, resets to PENDING.                                                               |
| Field hash anchor tx fails     | Field stays VALIDATED in DB. Log Solana error. Admin can retry hash anchor. Never block CO workflow for on-chain failure.                             |
| Cluster has < 50% completeness | Report generated with explicit confidence caveat in Section 1. Sections with missing fields include: "⚠️ Insufficient data for [X] — confidence LOW." |

### Security

| Concern                                      | Mitigation                                               |
| -------------------------------------------- | -------------------------------------------------------- |
| Forged Helius webhook                        | HMAC-SHA256 signature verification on every request      |
| Replay attack on webhook                     | Deduplicate by `solTxSignature` (UNIQUE constraint)      |
| Admin route accessed by non-admin            | Middleware checks `user.role === 'ADMIN'` + Supabase RLS |
| Free chat abuse (>7 messages via direct API) | DB count check on every message request, not client-side |
| Survey link spamming (post-MVP)              | Device fingerprint + CO review layer                     |

### Survey Edge Cases

| Scenario | Handling |
|----------|----------|
| Respondent submits duplicate survey | Check for existing `SurveyResponse` with same wallet + cluster |
| CO rejects >15% of responses | Warning flag shown to CO; admin notified for audit |
| Respondent disconnects wallet mid-survey | Use `useRef` to prevent auto-reconnect after disconnect |
| TipLink API unavailable | Fallback to deterministic wallet placeholder for demo |
| Survey step validation fails | Gray button state + error count summary shown |
| CO reviews field with no responses | Show empty state with "No responses yet" message |

### Vault Edge Cases

| Scenario | Handling |
|----------|----------|
| No approved respondents when BO pays | 8% goes to `totalPool` but `distributed = 0`; sits idle |
| Vault balance < minimum withdrawal | Show "Minimum 10,000 IDRX" message; disable withdraw button |
| Platform wallet insufficient IDRX | Return `INSUFFICIENT_FUNDS` error; admin notified |
| Multiple BO sessions accumulate rewards | Claims increment `amount` field; cumulative across sessions |
| CO withdrawal below minimum | Return `BELOW_MINIMUM` error with current balance |

---

## 11. Environment Variables

```bash
# .env.local

# ── DATABASE ──────────────────────────────────────────
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# ── SUPABASE ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."        # Server only — never expose to frontend

# ── AI ────────────────────────────────────────────────
ANTHROPIC_API_KEY="sk-ant-..."            # Used by anthropicClient.ts (actually Groq)
ANTHROPIC_BASE_URL="https://api.groq.com/openai/v1"
GROQ_API_KEY="gsk_..."
AI_MODEL="meta-llama/llama-4-scout-17b-16e-instruct"

# ── SOLANA ────────────────────────────────────────────
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
HELIUS_RPC_URL="https://devnet.helius-rpc.com/?api-key=..."
NEXT_PUBLIC_HELIUS_RPC_URL="https://devnet.helius-rpc.com/?api-key=..."
HELIUS_API_KEY="..."
HELIUS_WEBHOOK_SECRET="..."               # For HMAC verification
NEXT_PUBLIC_IDRX_MINT_ADDRESS="..."       # IDRX SPL token mint on devnet
NEXT_PUBLIC_PLATFORM_WALLET="..."         # LOKAL treasury wallet (public key)
PLATFORM_KEYPAIR="[123,45,...]"           # JSON byte array — NEVER commit to git
NEXT_PUBLIC_LOKAL_CORE_PROGRAM_ID="..."   # Deployed Anchor program ID
IDRX_MINT_ADDRESS="..."                   # Server-side copy (for webhook verification)

# ── STORAGE ───────────────────────────────────────────
CLOUDFLARE_R2_ACCOUNT_ID="..."
CLOUDFLARE_R2_ACCESS_KEY_ID="..."
CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
CLOUDFLARE_R2_BUCKET_NAME="lokal-reports"
CLOUDFLARE_R2_PUBLIC_URL="https://reports.lokal.id"

# ── MAP ───────────────────────────────────────────────
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ..."

# ── TIPLINK ───────────────────────────────────────────
TIPLINK_API_KEY="..."                     # TipLink wallet creation for survey respondents
```

---

## 12. 26-Day Sprint Plan

### Team Split

| Dylan                                        | Daffa                          |
| -------------------------------------------- | ------------------------------ |
| Anchor program (`lokal-core`)                | Next.js app scaffolding        |
| Metaplex Core NFT minting                    | Prisma schema + Supabase setup |
| IDRX payment transaction builder             | Cluster browser + map UI       |
| Field hash anchoring (backend call)          | Free chat interface            |
| Helius webhook setup + testing               | Concept form + menu builder    |
| Seed Margonda cluster data                   | Payment button integration     |
| Demo polish (Explorer links, NFT in Phantom) | Report viewer UI + PDF         |

---

### Days 1–3 — Foundation

**Dylan:**

- [ ] Set up Solana devnet wallet (platform keypair)
- [ ] Get devnet IDRX tokens for testing
- [ ] Helius account + webhook endpoint registered
- [ ] Anchor workspace init (`anchor init lokal`)

**Daffa:**

- [ ] `npx create-next-app@latest lokal` — TypeScript + Tailwind + App Router
- [ ] Prisma schema deployed to Supabase
- [ ] Supabase Auth configured (email + Google OAuth)
- [ ] Vercel project created, env vars set
- [ ] `prisma/seed.ts` — seeds Margonda cluster shell (no fields yet)

---

### Days 4–7 — Blockchain Core

**Dylan:**

- [ ] Write `lokal-core` Anchor program (`initialize_cluster` + `anchor_field_hash`)
- [ ] Compile + deploy to Solana devnet
- [ ] Write Anchor tests (`anchor test`) — both instructions passing
- [ ] `mintCoNft.ts` — Metaplex Core NFT minting tested end-to-end (mint to own wallet)
- [ ] `idrxTransfer.ts` — payment transaction builds + submits on devnet
- [ ] `fieldHash.ts` — SHA-256 helper tested

**Daffa:**

- [ ] Cluster list page (static, uses seeded Margonda data)
- [ ] Cluster detail page shell (slug routing)
- [ ] Supabase Auth middleware (protected routes)
- [ ] Wallet Adapter wired into Next.js app

---

### Days 8–12 — Data Layer + Free Chat

**Dylan:**

- [ ] `anchorClient.ts` — typed Anchor client for calling `lokal-core` from Next.js backend
- [ ] `/api/admin/fields` — validate field → compute hash → call Anchor program → update DB
- [ ] Manually seed all 20 Tier 1 fields for Margonda with real data (this is critical for demo quality)
- [ ] Validate all 20 fields via admin API (triggers hash anchoring for each)

**Daffa:**

- [ ] Free chat UI (`ChatWindow.tsx`, `MessageBubble.tsx`)
- [ ] `/api/chat` route — message count check, Claude integration, streaming response
- [ ] `ConversionModal.tsx` — shown at message 7
- [ ] Cluster map (`ClusterMap.tsx`) — Mapbox GL, 1.5km circle, anchor point marker
- [ ] Admin field review UI (simple table, approve/reject buttons)

---

### Days 13–17 — Payment + Report Generation

**Dylan:**

- [ ] Helius webhook tested locally (ngrok) — payment detected, sessionId matched
- [ ] `/api/webhooks/helius` — full implementation with HMAC verification
- [ ] Payment flow end-to-end tested on devnet (real IDRX transfer → webhook → session activated)

**Daffa:**

- [ ] `ConceptForm.tsx` — F&B subcategory, menu builder (add/remove items, prices), target customer
- [ ] `PaymentButton.tsx` — connects to Phantom, calls `createPaymentTransaction`, signs + sends
- [ ] `/api/sessions/[id]/report` — calls `generateReport(sessionId)`
- [ ] `reportGenerator.ts` — single Claude call, JSON parse, sections stored
- [ ] `ReportDocument.tsx` — PDF component with all 10 sections styled
- [ ] `generateReportPdf.ts` — renders to buffer, uploads to R2
- [ ] `ReportViewer.tsx` — renders all 10 sections in-browser, PDF download button

---

### Days 18–21 — Session Flow + Polling

**Daffa:**

- [ ] Session status polling (Supabase Realtime subscription on `sessions.status`)
- [ ] "Generating report..." loading state UI (progress animation during 20–40s wait)
- [ ] Paid consultation chat (12-hour window, full report context injected)
- [ ] `/api/sessions/[id]/verify-payment` — polling fallback route
- [ ] Dashboard (BO session history, report access)

**Dylan:**

- [ ] CO credential NFT visible in Phantom wallet (verify on devnet)
- [ ] All validated field hashes visible on Solana Explorer
- [ ] Payment transaction visible on Solana Explorer with memo
- [ ] Prepare Solana Explorer screenshots/links for demo slides

---

### Days 22–24 — Demo Polish

**Both:**

- [ ] End-to-end demo path rehearsed 10+ times
- [ ] Margonda cluster data reviewed for accuracy and demo-worthiness
- [ ] All Solana Explorer links working + bookmarked for demo
- [ ] Mobile responsiveness check (judges might use phone)
- [ ] Error states handled gracefully (not blank screens)
- [ ] README written (setup instructions, demo script)
- [ ] GitHub repo cleaned (no secrets, no debug logs committed)

---

### Day 25–26 — Buffer

- Bug fixes only. No new features.
- Demo dry-run with a friend as the "judge"
- Deck + video final review

---

## 13. Demo Day Checklist

This is the only thing that matters on demo day. Every checkbox must pass before you present.

### Core Flow

- [ ] Landing page loads and looks polished
- [ ] Margonda cluster appears on the map with the 1.5km boundary
- [ ] Cluster detail page shows data completeness + confidence score
- [ ] Free chat opens — Claude responds with data-grounded answer citing field codes
- [ ] Message 7 triggers conversion modal
- [ ] Concept form submits successfully (F&B type, menu, target customer)
- [ ] Phantom wallet opens with correct IDRX amount (400,000)
- [ ] Payment submits and confirms on devnet
- [ ] Session activates within 10 seconds of payment
- [ ] "Generating report..." state shows during the 20–40s wait
- [ ] Report appears with all 10 sections
- [ ] Section 6 (Pricing Strategy) contains specific IDR price data from the cluster
- [ ] PDF downloads successfully
- [ ] 12-hour paid chat window is open and responsive

### Blockchain Proof Points (Critical for Hackathon)

- [ ] Solana Explorer shows: field hash Memo transaction (pick 1 field to demonstrate)
- [ ] Solana Explorer shows: IDRX payment transaction with sessionId in memo
- [ ] CO soulbound NFT visible in Phantom wallet (Dylan's wallet for demo)
- [ ] NFT is non-transferable (verify in Phantom — no transfer option)

### Quality Bar

- [ ] No console errors during the demo flow
- [ ] All pages load in < 3 seconds
- [ ] Report section 2 (Customer Profile) references real demographic data (D1, D2, D3 fields)
- [ ] At least one pricing flag appears: "Your Rp X [item] is [Y]% above the area price ceiling"

---

## 14. Glossary

| Term                 | Definition                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Anchor**           | Rust framework for Solana smart contracts. Handles account serialization and instruction routing.                                                                          |
| **Cluster**          | A 1.5km radius geographic corridor. The core data entity in LOKAL.                                                                                                         |
| **CO**               | Cluster Owner — vetted local researcher who submits and owns field data for a cluster.                                                                                     |
| **Confidence Score** | Weighted quality score (0–100) reflecting how complete and validated a cluster's Tier 1 field data is.                                                                     |
| **Field Code**       | Unique code (B1, M3, C5, etc.) identifying a specific data point in the field catalog.                                                                                     |
| **Field Hash**       | SHA-256 hash of a cluster field value (JSON-serialized, key-sorted). Written to Solana via Memo program.                                                                   |
| **Helius**           | Premium Solana RPC provider. Used for webhooks that detect IDRX payment transactions.                                                                                      |
| **IDRX**             | IDR-pegged SPL token on Solana. 1 IDRX = 1 IDR. 2 decimal places.                                                                                                          |
| **Memo Program**     | Native Solana program (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) that writes arbitrary UTF-8 into a transaction. Used for field hash anchoring and sessionId tagging. |
| **Metaplex Core**    | Modern Solana NFT standard. Lighter than Token Metadata. Supports NonTransferable plugin for soulbound enforcement.                                                        |
| **PDA**              | Program Derived Address. A Solana account address deterministically derived from seeds. No private key — only the program can sign for it.                                 |
| **RAG**              | Retrieval-Augmented Generation. For MVP, this is simplified to direct field injection into the Claude prompt (no vector search needed).                                    |
| **RLS**              | Row-Level Security — Supabase/PostgreSQL feature enforcing data access at the database level.                                                                              |
| **Session**          | One paid consultation unit. Includes 1 report + 12-hour AI chat window. Costs 400,000 IDRX.                                                                                |
| **Soulbound NFT**    | Non-transferable NFT. Used as CO credential. Enforced by Metaplex Core's NonTransferable plugin.                                                                           |
| **SPL Token**        | Solana Program Library token standard (equivalent to ERC-20). IDRX is an SPL token.                                                                                        |
| **Survey Response**  | A respondent's submission containing 15 field answers. Stored in `survey_responses` + `survey_field_responses` tables.                                                    |
| **Vault**            | Per-cluster reward pool funded by 8% of session revenue. Distributed proportionally to respondents based on approved field count.                                          |
| **VaultClaim**       | A respondent's share of the vault. Created when CO approves their survey responses. Amount accumulates across multiple BO sessions.                                        |
| **TipLink**          | Email-based wallet creation service. Allows respondents to participate without understanding crypto — Gmail creates a Solana wallet automatically.                          |
| **Bulk Accept**      | CO feature to approve all pending responses for specific fields (D1-D3, B2, B4, B5, C1, C3) at once.                                                                      |

---

_LOKAL TDD v2.0 — Built lean. Built to demo. Built to win._
_Dylan + Daffa · Superteam Indonesia Frontier Colosseum 2025_
