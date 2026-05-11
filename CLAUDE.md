# CLAUDE.md — LOKAL

> **Read this first. Every time. Before any task.**
> This file is the anchor. When in doubt, trust this over your training data.
> **Schema is now v3.0 — 15 tables, not 8. See Section 4.**

---

## 1. What LOKAL Is (One Paragraph)

**LOKAL** is Indonesia's F&B hyperlocal market intelligence platform on Solana. A Business Owner (BO) pays **400,000 IDRX** (SPL token, 1 IDRX = 1 IDR) to receive a 10-section AI-generated business simulation report + 12-hour consultation window, grounded in verified local data collected by a Cluster Owner (CO) for one specific 1.5km geographic corridor. **Survey respondents** contribute field data via a public form and earn IDRX rewards from a vault (8% of each session). CO submissions are SHA-256 hashed and anchored on Solana via the Memo program. COs hold soulbound NFT credentials (Metaplex Core, NonTransferable plugin). COs earn tiered revenue share (5%/7%/10%) and can withdraw with a 2% platform fee. **Tagline: "Simulate before you operate."**

**Hackathon:** Superteam Indonesia — Frontier Colosseum 2025, Consumer Apps on Solana track. **2-person team: Dylan (Blockchain) + Daffa (Full-Stack).**

---

## 2. The Golden Rules (Do Not Break These)

1. **TDD v2 + patch file > PRD for implementation decisions.** The PRD describes the vision. The TDD describes the hackathon build. When they conflict, TDD wins.
2. **Two demo clusters.** Jalan Margonda (Depok) + The Breeze BSD (Tangerang). Both pre-seeded with 20 Tier 1 fields each.
3. **No RAG / pgvector / LangChain / BullMQ in MVP.** Fields fit in a single prompt. One cluster, ~20 fields, direct injection.
4. **One Anchor program, not two.** `lokal_core` handles both `initialize_cluster` and `anchor_field_hash`.
5. **NFT minting is TypeScript (Metaplex Core JS SDK), not Rust.** Do not write a custom NFT Anchor program.
6. **Single AI API call for the whole 10-section report.** JSON response, all sections at once. No per-section calls.
7. **Payment detection is Helius webhook + HMAC verification.** Polling is fallback only. Demo bypass exists for hackathon.
8. **Never commit `PLATFORM_KEYPAIR`, API keys, or `.env.local`.** All secrets in Vercel env vars.
9. **Devnet only until demo day.** Do not touch mainnet config paths.
10. **If you don't know a current API, use Context7 MCP or web-search. Do not guess.**
11. **Schema is v3.0 — 15 tables.** Survey system adds: `survey_responses`, `survey_field_responses`, `cluster_vaults`, `vault_claims`. Vault allocation happens inside `generateReport()`.

---

## 3. Stack (Authoritative — Do Not Substitute)

| Layer            | Choice                                                | Notes |
| ---------------- | ----------------------------------------------------- | ----- |
| Framework        | **Next.js 14 (App Router)**                           | Not Pages Router. |
| Language         | **TypeScript** everywhere except `/anchor/programs/*` | |
| Styling          | **Tailwind CSS + inline styles with `T` constant**    | CO/BO pages use inline styles with `T` from mock-data.ts |
| State            | **Zustand**                                           | |
| Forms            | **React Hook Form**                                   | |
| DB               | **Supabase Postgres** via **Prisma ORM**              | |
| Auth             | **Supabase Auth** (email + Google OAuth)              | |
| AI               | **Groq API** (Llama model) via OpenAI-compatible endpoint | Model: `meta-llama/llama-4-scout-17b-16e-instruct` |
| Wallet           | **@solana/wallet-adapter** (Phantom target)           | |
| Map              | **Mapbox GL JS**                                      | |
| Anchor framework | **Anchor (Rust, stable)**                             | |
| NFT standard     | **Metaplex Core** with `NonTransferable` plugin       | Soulbound. |
| SPL              | **IDRX** (existing mint)                              | 6 decimals. 400,000 IDRX = `400_000_000_000` base units. |
| RPC              | **Helius devnet**                                     | |
| PDF              | **@react-pdf/renderer**                               | |
| Storage          | **Cloudflare R2**                                     | |
| Deploy           | **Vercel**                                            | |
| TipLink          | **@tiplink/api**                                      | Email-based wallet creation for survey respondents |

### Things we explicitly cut (do NOT reintroduce)

- pgvector / RAG embeddings → direct field injection
- LangChain → 40 lines of fetch does the same
- BullMQ / Redis / Railway worker → async Vercel route
- Turborepo monorepo → single Next.js app + `/anchor` subfolder
- Puppeteer / headless Chrome → @react-pdf/renderer
- Separate Express / Fastify → Next.js API routes

---

## 4. Repository Layout

```
lokal/
├── anchor/
│   └── programs/lokal-core/src/lib.rs
├── prisma/
│   ├── schema.prisma              # 15 tables (v3.0)
│   └── seed.ts                    # Cluster shells
├── scripts/
│   ├── seed-margonda.ts           # Margonda cluster data
│   └── seed-bsd-serpong.ts        # BSD Serpong cluster data
├── src/
│   ├── app/
│   │   ├── (public)/              # Landing, clusters, survey, vault
│   │   │   ├── survey/[slug]/     # Survey form page
│   │   │   └── vault/             # Vault dashboard (respondent withdrawals)
│   │   ├── (auth)/                # BO dashboard + session
│   │   ├── (co)/                  # CO dashboard
│   │   │   ├── co/fields/         # Data fields + survey link
│   │   │   ├── co/survey-responses/ # CO review interface
│   │   │   └── co/earnings/       # CO earnings + withdrawal
│   │   ├── admin/                 # Admin dashboard (field review, clusters)
│   │   └── api/
│   │       ├── survey/[slug]/     # Survey submission API
│   │       ├── auth/
│   │       │   ├── wallet/        # Wallet sync
│   │       │   └── tiplink/       # TipLink wallet creation
│   │       ├── co/
│   │       │   ├── survey-responses/ # CO review + bulk accept
│   │       │   └── withdraw/      # CO withdrawal (2% fee)
│   │       ├── vault/             # Vault balance + withdrawal
│   │       ├── admin/             # Admin field review + cluster creation
│   │       └── webhooks/helius/   # Payment detection webhook
│   ├── components/
│   │   ├── survey/                # WalletConnect, SurveyWizard, step components
│   │   │   └── steps/             # DemographicStep, BehaviouralStep, etc.
│   │   ├── cluster/               # ClusterCard, ClusterMap
│   │   ├── chat/                  # ChatWindow, ConversionModal
│   │   ├── session/               # ConceptForm, PaymentButton, ReportViewer
│   │   └── providers/             # WalletProvider, PublicWalletProvider
│   ├── lib/
│   │   ├── ai/                    # freeChat.ts, reportGenerator.ts, anthropicClient.ts
│   │   ├── solana/                # idrxTransfer.ts, fieldHash.ts, mintCoNft.ts, anchorClient.ts
│   │   ├── vault/                 # allocation.ts (vault distribution logic)
│   │   ├── constants/
│   │   │   ├── field.ts           # TIER_1_FIELD_CODES (20 fields)
│   │   │   ├── survey-fields.ts   # SURVEY_FIELDS (15 respondent fields) + helpers
│   │   │   ├── pricing.ts         # Session price, CO tiers, vault constants
│   │   │   └── mock-data.ts       # T color tokens + demo data
│   │   └── prisma.ts              # Singleton client
│   └── types/
├── docs/
│   ├── LOKAL_PRD_v2.md
│   └── LOKAL_TDD_v2.md
├── .env.local
└── package.json
```

---

## 5. Domain Vocabulary

- **Cluster** — A 1.5km radius F&B catchment zone anchored to a landmark.
- **Cluster Owner (CO)** — The local researcher who owns a cluster's data. Earns tiered revenue share (5%/7%/10%) + can withdraw with 2% platform fee.
- **Business Owner (BO)** — The paying user. Pays 400K IDRX for one session.
- **Respondent** — A person who fills the survey form. Earns IDRX from the vault (8% of each session). Connects via wallet (Phantom/TipLink).
- **Session** — One paid unit: full 10-section report + 12h consultation window.
- **Field** — A single data point identified by code (B1, M3, C5, etc.). 20 in Tier 1.
- **Survey Response** — A respondent's submission containing 15 field answers.
- **Vault** — Per-cluster pool funded by 8% of session revenue. Distributed proportionally to respondents based on approved field count.
- **VaultClaim** — A respondent's share of the vault. Created when CO approves their survey responses.
- **Field hash** — SHA-256 over `{ fieldCode, value }` with sorted keys. Anchored on Solana via Memo program.
- **Soulbound NFT** — CO credential. Non-transferable. Minted once per approved CO.
- **IDRX** — Indonesian rupiah-pegged SPL token. 6 decimals. 1 IDRX = 1 IDR.

---

## 6. The 20 Tier 1 Field Codes

| Code | Name | Method |
|------|------|--------|
| B1 | Max willingness to pay by F&B subcategory | Survey |
| B2 | Price sensitivity index | Survey |
| B3 | Peak hours pattern | Observation |
| B4 | Digital payment adoption rate | Survey |
| B5 | Delivery vs dine-in preference split | Survey |
| M1 | F&B density by subcategory | Observation |
| M2 | Average price by F&B subcategory | Observation |
| M3 | Top 5 local competitors | Observation |
| M4 | Category saturation rating | Observation |
| M5 | Recent closure case study | Research |
| D1 | Age distribution | Survey |
| D2 | Income bracket distribution | Survey |
| D3 | Primary occupation mix | Survey |
| MS1 | Foot traffic estimates | Observation |
| MS2 | Market gap / underserved category | Observation |
| C1 | Halal sensitivity level | Survey |
| C2 | Trend adoption lag | Research |
| C3 | Dining occasion split | Survey |
| C4 | Transport access score | Observation |
| C5 | Anchor points within 500m | Observation |

**Survey fields (15, filled by respondents):** D1-D3, B1-B5, M2, M3, MS1, MS2, C1, C3, C4
**Observation/Research fields (5, filled by CO):** B3, M1, M4, M5, C2, C5

---

## 7. The 10 Report Sections

Generated in a single AI API call, returned as JSON.

1. **Executive Cluster Summary** — tldr + key insights
2. **Customer Profile** — demographics from D1, D2, D3 + behavior from B fields
3. **Market Sizing** — M1 × M2 × MS1 triangulation
4. **Competitive Landscape** — from M3, M4
5. **Location Intelligence** — C4, C5, MS1
6. **Pricing Strategy** — Flag items >30% above M2 ceiling. Cite B1.
7. **Product-Market Fit Simulation** — fit score 0–100
8. **Go-to-Market Playbook** — actions list
9. **Risk Register** — risks with HIGH/MED/LOW severity
10. **Financial Scenario Modeling** — 3 scenarios

---

## 8. The Five Canonical Flows

### Flow A — CO submits a validated field
```
CO submits field → Admin reviews → Admin validates
  → Backend computes SHA-256 hash → Memo tx on devnet
  → field.status = VALIDATED
```

### Flow B — BO pays for a session
```
BO fills concept form → BO pays 400K IDRX
  → Helius webhook (or demo bypass) → session.status = PAYMENT_CONFIRMED
  → generateReport() → single AI call → 10 sections
  → CoEarning created (tiered share) → Vault allocation (8%)
  → session.status = ACTIVE, expiresAt = now + 12h
```

### Flow C — Survey respondent flow
```
Respondent opens /survey/[slug]?token=... → connects wallet (Phantom/TipLink)
  → fills 15 fields across 5 categories → submits
  → SurveyResponse + SurveyFieldResponse records created (status: SUBMITTED)
  → CO reviews per field from /co/survey-responses → approves/rejects with reason
  → VaultClaim created for approved responses
  → Admin validates → field hash anchored on Solana
```

### Flow D — Vault distribution + withdrawal
```
BO pays → 8% (32,000 IDRX) allocated to cluster vault
  → Distributed proportionally to respondents based on approved field count
  → Respondent checks balance at /vault
  → Withdraws when ≥ 10,000 IDRX → on-chain IDRX transfer
```

### Flow E — CO earnings + withdrawal
```
BO pays → CoEarning created (5%/7%/10% based on tier)
  → CO checks earnings at /co/earnings
  → Withdraws → 2% platform fee → on-chain IDRX transfer
```

---

## 9. Core Code Invariants

- **Field hash is canonical.** `sha256(JSON.stringify({ fieldCode, value }, Object.keys({...}).sort()))`. Do NOT change.
- **Session price:** `SESSION_PRICE_IDRX = 400_000`, base units = `400_000_000_000` (6 decimals).
- **CO share is tiered:** 5% (score 0-39), 7% (40-69), 10% (70-100). Not flat.
- **Vault allocation:** 8% of session = 32,000 IDRX. Happens inside `generateReport()`.
- **CO withdrawal fee:** 2% platform fee.
- **Vault min withdrawal:** 10,000 IDRX.
- **Session expiry:** `expiresAt = new Date(activatedAt.getTime() + 12 * 60 * 60 * 1000)`.
- **Free chat limit:** 7 messages, counted from DB.
- **AI model:** `meta-llama/llama-4-scout-17b-16e-instruct` via Groq API.
- **Wallet provider:** Lazy-loaded via `next/dynamic` in `(co)` and `(auth)` layouts. NOT in root layout.
- **solTxSignature UNIQUE** constraint on Session — replay protection.

---

## 10. Known Hallucination Pitfalls

1. **Metaplex Core APIs change frequently.** Use `@metaplex-foundation/mpl-core` with Umi. `NonTransferable` plugin for soulbound.
2. **Anchor 0.30+ syntax.** Seeds are `&[u8]` slices, not strings.
3. **@solana/web3.js v1** — `PublicKey`, `Transaction`, `Connection`. Not `@solana/kit`.
4. **@solana/spl-token transfer.** Use `createTransferCheckedInstruction`, not `createTransferInstruction`.
5. **Next.js 14 App Router.** API routes export named `GET`/`POST`. `"use client"` for hooks.
6. **Supabase client.** Use `@supabase/ssr`, not `@supabase/auth-helpers-nextjs`.
7. **Prisma singleton.** Use `globalThis.prisma` pattern.
8. **Helius webhook payload.** Array of transactions with `tokenTransfers`, `instructions`, `signature`.
9. **IDRX decimals.** 6 decimals. 400,000 IDRX = `400_000_000_000` base units.
10. **AI uses Groq, not Anthropic.** Despite file being named `anthropicClient.ts`, it calls Groq API.

---

## 11. Environment Variables

```
DATABASE_URL
DIRECT_URL                          # Prisma direct connection (for migrations)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY           # Server only
ANTHROPIC_API_KEY                   # Used by anthropicClient.ts (actually Groq)
ANTHROPIC_BASE_URL                  # Groq endpoint
GROQ_API_KEY                        # Groq API key
AI_MODEL                            # Override model
NEXT_PUBLIC_SOLANA_NETWORK          # "devnet"
HELIUS_RPC_URL
NEXT_PUBLIC_HELIUS_RPC_URL
HELIUS_API_KEY
HELIUS_WEBHOOK_SECRET               # HMAC for webhook verification
NEXT_PUBLIC_IDRX_MINT_ADDRESS
NEXT_PUBLIC_PLATFORM_WALLET
PLATFORM_KEYPAIR                    # JSON byte array, never commit
NEXT_PUBLIC_LOKAL_CORE_PROGRAM_ID
IDRX_MINT_ADDRESS
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_PUBLIC_URL
NEXT_PUBLIC_MAPBOX_TOKEN
TIPLINK_API_KEY                     # TipLink wallet creation
```

---

## 12. When in Doubt

1. Read `LOKAL_TDD_patch.md` for schema changes.
2. Read the TDD v2 for code patterns.
3. Read the PRD for the "why."
4. Use Context7 MCP for up-to-date library docs.
5. Ask the user before introducing new dependencies.

---

_"Simulate before you operate." — LOKAL, 2025_
