# CLAUDE.md — LOKAL

> **Read this first. Every time. Before any task.**
> This file is the anchor. When in doubt, trust this over your training data.
> **Schema is now v2.1 — 8 tables, not 7. See Section 3 cut list.**

---

## 1. What LOKAL Is (One Paragraph)

**LOKAL** is Indonesia's F&B hyperlocal market intelligence platform on Solana. A Business Owner (BO) pays **400,000 IDRX** (SPL token, 1 IDRX = 1 IDR) to receive a 10-section AI-generated business simulation report + 12-hour consultation window, grounded in verified local data collected by a Cluster Owner (CO) for one specific 1.5km geographic corridor. CO submissions are SHA-256 hashed and anchored on Solana via the Memo program. COs hold soulbound NFT credentials (Metaplex Core, NonTransferable plugin). **Tagline: "Simulate before you operate."**

**Hackathon:** Superteam Indonesia — Frontier Colosseum 2025, Consumer Apps on Solana track. **26-day deadline. 2-person team: Dylan (Blockchain) + Daffa (Full-Stack).**

---

## 2. The Golden Rules (Do Not Break These)

1. **TDD v2 + patch file > PRD for implementation decisions.** The PRD describes the vision. The TDD describes the hackathon build. When they conflict, TDD wins for the next 26 days.
2. **One cluster, not many.** Demo cluster = Jalan Margonda, Depok. All 20 Tier 1 fields seeded by Dylan. Do not scaffold multi-cluster flows.
3. **No RAG / pgvector / LangChain / BullMQ in MVP.** The TDD explicitly cut these. Fields fit in a single Claude prompt. One cluster, ~20 fields, direct injection. Adding retrieval infrastructure burns days for zero demo benefit.
4. **One Anchor program, not two.** `lokal_core` handles both `initialize_cluster` and `anchor_field_hash`. Two deployments = two headaches.
5. **NFT minting is TypeScript (Metaplex Core JS SDK), not Rust.** Do not write a custom NFT Anchor program.
6. **Single Claude API call for the whole 10-section report.** JSON response, all sections at once. No per-section calls, no queue.
7. **Payment detection is Helius webhook + HMAC verification.** Polling is fallback only.
8. **Never commit `PLATFORM_KEYPAIR`, API keys, or `.env.local`.** All secrets in Vercel env vars.
9. **Devnet only until demo day.** Do not touch mainnet config paths.
10. **If you (Claude) don't know a current API, use Context7 MCP or web-search. Do not guess.** Solana, Anchor, Metaplex, and Helius APIs change; your memory is stale.
11. **Schema is v2.1 — 8 tables.** `co_earnings` is restored. Write a `CoEarning` record inside `generateReport()` on every successful report. See `LOKAL_TDD_patch.md` for exact code.

---

## 3. Stack (Authoritative — Do Not Substitute)

| Layer            | Choice                                                | Notes for you                                                                |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Framework        | **Next.js 14 (App Router)**                           | Not Pages Router. Not Remix.                                                 |
| Language         | **TypeScript** everywhere except `/anchor/programs/*` |                                                                              |
| Styling          | **Tailwind CSS**                                      | No Chakra, no Material UI.                                                   |
| State            | **Zustand**                                           | No Redux. No Jotai.                                                          |
| Forms            | **React Hook Form**                                   | Required for the menu builder.                                               |
| DB               | **Supabase Postgres** via **Prisma ORM**              | Not Drizzle. Not raw SQL in app code.                                        |
| Auth             | **Supabase Auth** (email + Google OAuth)              |                                                                              |
| AI               | **Anthropic Claude API**, model `qwen3.5-plus`        | Hardcode this model string. Do not substitute.                               |
| Wallet           | **@solana/wallet-adapter** (Phantom target)           |                                                                              |
| Map              | **Mapbox GL JS**                                      |                                                                              |
| Anchor framework | **Anchor (Rust, stable)**                             | **NOT Quasar. Quasar is beta and unaudited — death for a 26-day hackathon.** |
| NFT standard     | **Metaplex Core** with `NonTransferable` plugin       | Soulbound. Minted from TS backend via Umi.                                   |
| SPL              | **IDRX** (existing mint, do not create one)           | 6 decimals. Amount = `400_000_000_000` base units.                           |
| RPC              | **Helius devnet**                                     | Webhooks for payment detection. Never public RPC.                            |
| PDF              | **@react-pdf/renderer**                               | Server-side render to buffer, upload to R2. **No Puppeteer.**                |
| Storage          | **Cloudflare R2**                                     | For PDFs + CO evidence photos.                                               |
| Deploy           | **Vercel**                                            | Edge runtime compatible routes where possible.                               |

### Things we explicitly cut (do NOT reintroduce)

- pgvector / RAG embeddings → direct field injection is enough for one cluster
- LangChain → 40 lines of fetch does the same
- BullMQ / Redis / Railway worker → async Vercel route, 60s timeout is fine for 5 demo users
- Turborepo monorepo → single Next.js app + `/anchor` subfolder
- Puppeteer / headless Chrome → @react-pdf/renderer
- Separate Express / Fastify → Next.js API routes
- Dual `reputation_score` + `trust_score` → one `co_score` (0–100) for MVP _(post-hackathon migration documented in LOKAL_TDD_patch.md)_
- Tiered CO share rate (5%/7%/10%) → flat 5% (`CO_SESSION_SHARE_RATE`) for MVP
- Full 53-field catalog → 20 Tier 1 fields only
- `transactions` table → `session.solTxSignature` is sufficient audit trail for demo
- `survey_responses` table → Margonda is manually seeded
- `data_fields` master catalog → inlined in `cluster_field_values`
- `admin_users` extended profile → `user.role === 'ADMIN'` check is sufficient

---

## 4. Repository Layout

```
lokal/
├── anchor/                        # Dylan's territory
│   └── programs/lokal-core/src/lib.rs
├── prisma/
│   ├── schema.prisma              # 8 tables — includes co_earnings (v2.1)
│   └── seed.ts                    # Margonda cluster shell
├── scripts/
│   └── seed-margonda.ts           # Manually seeds 20 Tier 1 fields with REAL data
├── src/
│   ├── app/
│   │   ├── (public)/              # Landing, cluster browse, cluster detail + free chat
│   │   ├── (auth)/session/[id]/   # Paid report viewer + 12h chat
│   │   ├── admin/                 # Field review queue
│   │   └── api/                   # chat, sessions, webhooks/helius, admin
│   ├── components/
│   │   ├── cluster/               # ClusterCard, ClusterMap, ClusterStats
│   │   ├── chat/                  # ChatWindow, ConversionModal
│   │   ├── session/               # ConceptForm, PaymentButton, ReportViewer
│   │   └── pdf/ReportDocument.tsx # @react-pdf/renderer component
│   ├── lib/
│   │   ├── ai/                    # freeChat.ts, paidChat.ts, reportGenerator.ts
│   │   ├── solana/                # idrxTransfer.ts, fieldHash.ts, mintCoNft.ts, anchorClient.ts
│   │   ├── pdf/generateReportPdf.ts
│   │   ├── storage/r2.ts
│   │   ├── prisma.ts              # Singleton client
│   │   └── constants/
│   │       ├── fields.ts          # TIER_1_FIELD_CODES
│   │       └── pricing.ts         # SESSION_PRICE_IDRX, CO_SESSION_SHARE_RATE
│   └── types/
├── .planning/
│   ├── PLAN.md                    # 36-ticket dev plan
│   └── STATE.md                   # Ticket status (update every session)
├── LOKAL_TDD_v2.md                # Base TDD
├── LOKAL_TDD_patch.md             # ← Schema v2.1 patch (co_earnings + deferred items)
└── .env.local                     # Never committed
```

---

## 5. Domain Vocabulary (Use These Terms Exactly)

- **Cluster** — A 1.5km radius F&B catchment zone anchored to a landmark. Not an admin zone.
- **Cluster Owner (CO)** — The local researcher who owns a cluster's data. Earns per validated field + session revenue share.
- **Business Owner (BO)** — The paying user. Pays 400K IDRX for one session.
- **Session** — One paid unit: full 10-section report + 12h consultation window.
- **Field** — A single data point identified by code (B1, M3, C5, etc.). 20 in Tier 1.
- **Complex field** — Requires survey of 20–30 respondents. ~40% of fields.
- **Field hash** — SHA-256 over `{ fieldCode, value }` with sorted keys. Anchored on Solana via Memo program.
- **Confidence Score (0–100)** — How complete/validated a cluster's data is.
- **Soulbound NFT** — CO credential. Non-transferable. Minted once per approved CO.
- **IDRX** — Indonesian rupiah-pegged SPL token. 6 decimals. 1 IDRX = 1 IDR.
- **Price ceiling** — Max price this cluster will bear for a given F&B subcategory. The uncle's matcha problem.
- **CO earnings** — Revenue share credited to CO per session (5% flat = 20,000 IDRX). Tracked in `co_earnings` table.

---

## 6. The 20 Tier 1 Field Codes (Memorize These)

| Code | Name                                      | Method      |
| ---- | ----------------------------------------- | ----------- |
| B1   | Max willingness to pay by F&B subcategory | Survey      |
| B2   | Price sensitivity index                   | Survey      |
| B3   | Peak hours pattern                        | Observation |
| B4   | Digital payment adoption rate             | Survey      |
| B5   | Delivery vs dine-in preference split      | Survey      |
| M1   | F&B density by subcategory                | Observation |
| M2   | Average price by F&B subcategory          | Observation |
| M3   | Top 5 local competitors                   | Observation |
| M4   | Category saturation rating                | Observation |
| M5   | Recent closure case study                 | Research    |
| D1   | Age distribution                          | Survey      |
| D2   | Income bracket distribution               | Survey      |
| D3   | Primary occupation mix                    | Survey      |
| MS1  | Foot traffic estimates                    | Observation |
| MS2  | Market gap / underserved category         | Observation |
| C1   | Halal sensitivity level                   | Survey      |
| C2   | Trend adoption lag                        | Research    |
| C3   | Dining occasion split                     | Survey      |
| C4   | Transport access score                    | Observation |
| C5   | Anchor points within 500m                 | Observation |

The field catalog lives in `src/lib/constants/fields.ts`. Report sections MUST cite these codes (e.g., "Based on field B1, the coffee price ceiling is Rp 30,000").

---

## 7. The 10 Report Sections

Generated in a single Claude API call, returned as JSON. Keys are literally `section1` through `section10`. Required per TDD §6.2.

1. **Executive Cluster Summary** — tldr + key insights
2. **Customer Profile** — demographics from D1, D2, D3 + behavior from B fields
3. **Market Sizing** — M1 × M2 × MS1 triangulation
4. **Competitive Landscape** — from M3, M4
5. **Location Intelligence** — C4, C5, MS1
6. **Pricing Strategy** — **The hero section.** Flag items >30% above M2 ceiling. Cite B1. This is the matcha-café moment in the demo.
7. **Product-Market Fit Simulation** — fit score 0–100 with rationale
8. **Go-to-Market Playbook** — actions list
9. **Risk Register** — risks with HIGH/MED/LOW severity + mitigation
10. **Financial Scenario Modeling** — 3 scenarios (pessimistic/realistic/optimistic)

---

## 8. The Three Canonical Flows

### Flow A — CO submits a validated field

```
CO submits field → Admin reviews evidence → Admin validates
  → Backend computes SHA-256(`{fieldCode, value}` sorted)
  → Call Anchor program `anchor_field_hash` → Memo tx on devnet
  → Update DB: field.status = VALIDATED, field.solTxSignature = <sig>
  → (Eventually) cluster.confidenceScore recomputed
```

### Flow B — BO pays for a session

```
BO clicks "Unlock Full Report"
  → Frontend calls createPaymentTransaction(wallet, sessionId)
    → SPL transfer 400,000 IDRX → platform wallet
    → Memo instruction with sessionId
  → Phantom signs + submits
  → Helius webhook fires → POST /api/webhooks/helius
    → HMAC verify → extract sessionId from Memo
    → Amount check (must be 400,000 IDRX)
    → Dedup by solTxSignature UNIQUE constraint
    → session.status = PAYMENT_CONFIRMED
    → generateReport(sessionId)  // fire-and-forget
  → Report gen: single Claude call → JSON → render PDF → upload R2
    → session.status = ACTIVE, expiresAt = now + 12h
    → co_earnings record created (type: SESSION_SHARE, amount: 20,000 IDRX)
  → Frontend polls /api/sessions/[id] every 3s → redirect on ACTIVE
```

### Flow C — CO credential issuance

```
Admin approves CO application
  → Backend loads platform keypair (env: PLATFORM_KEYPAIR)
  → Metaplex Core `create` call via Umi
    → asset name: `LOKAL CO — ${coName}`
    → metadata URI: R2 JSON with coName, clusterSlug
    → plugins: [{ type: "NonTransferable" }]
  → Store mint address + tx signature on ClusterOwner record
  → CO sees NFT in Phantom
```

---

## 9. Core Code Invariants

- **Field hash is canonical.** Always: `sha256(JSON.stringify({ fieldCode, value }, Object.keys({...}).sort()))`. Do not change the serialization — every existing hash becomes invalid.
- **Payment price constant.** `SESSION_PRICE_IDRX = 400_000` in IDR, `400_000_000_000` in base units (6 decimals). Lives in `src/lib/constants/pricing.ts`.
- **CO share rate constant.** `CO_SESSION_SHARE_RATE = 0.05`. `CO_SESSION_SHARE_IDRX = 20_000`. Lives in `src/lib/constants/pricing.ts`.
- **Session expiry is exactly 12 hours.** `expiresAt = new Date(activatedAt.getTime() + 12 * 60 * 60 * 1000)`.
- **Free chat limit is 7 messages, counted from DB.** Never trust the client's count. Query: `SELECT count(*) FROM messages WHERE sessionId = ? AND isFree = true`.
- **Claude model string is frozen:** `"claude-sonnet-4-20250514"`.
- **sessionId in Memo** is the only link between on-chain payment and DB session. If it's missing, the payment is skipped (admin-review case).
- **solTxSignature has a UNIQUE constraint.** This is the replay-protection mechanism. Do not drop it.
- **Every successful `generateReport()` must write one `CoEarning` record.** See `LOKAL_TDD_patch.md` Patch 1 for the exact `prisma.coEarning.create()` call inside `$transaction`.

---

## 10. Known Hallucination Pitfalls (Things You, Claude, Get Wrong)

When working on this project you have historically made these mistakes. Before writing code in these areas, **verify with Context7 MCP or web-search first**:

1. **Metaplex Core APIs change frequently.** The "old" Token Metadata / Candy Machine APIs you may remember are wrong. We use **Metaplex Core** (`@metaplex-foundation/mpl-core`) with Umi. The `NonTransferable` plugin is how soulbound works — NOT `@metaplex-foundation/js`.
2. **Anchor 0.30+ syntax.** `declare_id!`, Context, and account constraints have evolved. `#[account(init, payer = ..., space = ..., seeds = [...], bump)]` — seeds are `&[u8]` slices, not strings.
3. **@solana/web3.js v2 vs v1.** We use classic **web3.js v1** style (`PublicKey`, `Transaction`, `Connection`). Not the new `@solana/kit` tree-shakeable API.
4. **@solana/spl-token transfer.** Use `createTransferCheckedInstruction` (checks decimals) — never `createTransferInstruction` (legacy, unsafe).
5. **Next.js 14 App Router.** API routes export named `GET`/`POST` functions, not `handler`. Pages are RSC by default — anything with hooks needs `"use client"`.
6. **Supabase client in Next.js.** Use `@supabase/ssr` for App Router, NOT `@supabase/auth-helpers-nextjs` (deprecated).
7. **Prisma singleton in Next.js dev.** Use `globalThis.prisma` pattern or hot-reload creates dozens of connections.
8. **Helius webhook payload shape.** It is an **array** of transactions, each with `tokenTransfers`, `instructions`, `signature`. Memo data is base64 inside the Memo program instruction.
9. **IDRX decimals.** This devnet IDRX mint has 6 decimals (same as USDC). Rp 400,000 = `400_000_000_000` base units. Constant: `SESSION_PRICE_BASE_UNITS = 400_000_000_000`.
10. **Vercel function timeout.** Default is 10s on Hobby, 60s on Pro. Report generation needs Pro tier OR must be moved to a background job. The TDD assumes Pro.

**When unsure about any Solana/Anchor/Metaplex API, run `context7` first.** Do not reconstruct APIs from memory.

---

## 11. What the Hackathon Demo Must Do (In Order)

These checkboxes are what wins. Everything else is optional.

1. Landing page loads, looks polished, <3s load time
2. Cluster browser shows Margonda with map + 1.5km circle
3. Cluster detail page shows data completeness + confidence score
4. Free chat: Claude answers a question using specific field codes (e.g., "B1 indicates Rp 28,000 ceiling")
5. Message 7 triggers conversion modal
6. Concept form submits (F&B type, menu items with prices, target customer)
7. "Unlock Full Report" button opens Phantom with 400,000 IDRX
8. Payment confirms on devnet within 5s
9. Session activates within 10s of payment
10. "Generating report…" UI during 20–40s wait
11. Report renders all 10 sections
12. **Section 6 shows the money line: "Your Rp 50,000 Signature Matcha is 79% above this cluster's price ceiling for this category."**
13. PDF downloads
14. 12-hour paid chat window opens and responds

### Blockchain proof points (non-negotiable)

- Solana Explorer tab open showing: field hash Memo tx ✅
- Solana Explorer tab open showing: IDRX payment tx with sessionId in Memo ✅
- Phantom wallet open showing: CO soulbound NFT in Dylan's wallet ✅
- NFT is non-transferable (verified in Phantom UI) ✅

---

## 12. Division of Labor (Critical for Coordination)

| Dylan (Blockchain + Backend Solana) | Daffa (Full-Stack Web)                              |
| ----------------------------------- | --------------------------------------------------- |
| `/anchor/` program                  | Next.js app scaffolding                             |
| `mintCoNft.ts`                      | Prisma schema, Supabase setup                       |
| `idrxTransfer.ts`                   | Cluster browser + Mapbox                            |
| `fieldHash.ts`                      | Free chat UI                                        |
| `anchorClient.ts`                   | Concept form + menu builder                         |
| `/api/webhooks/helius`              | `PaymentButton.tsx`                                 |
| Seed Margonda data (20 fields)      | Report viewer + PDF                                 |
| Solana Explorer bookmarks for demo  | `/api/sessions/[id]/report`                         |
| —                                   | `co_earnings` write in `reportGenerator.ts` (Daffa) |

**If you're not sure whose area a task is in, check the file path.** `/anchor/**` and `src/lib/solana/**` → Dylan. Everything else → Daffa.

---

## 13. Environment Variables (Never Commit)

Required in `.env.local` and Vercel:

```
DATABASE_URL                         # Supabase pooled Postgres URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY            # Server only
ANTHROPIC_API_KEY
NEXT_PUBLIC_SOLANA_NETWORK           # "devnet"
HELIUS_RPC_URL
HELIUS_API_KEY
HELIUS_WEBHOOK_SECRET                # For HMAC
NEXT_PUBLIC_IDRX_MINT_ADDRESS
NEXT_PUBLIC_PLATFORM_WALLET
PLATFORM_KEYPAIR                     # JSON byte array, never commit
NEXT_PUBLIC_LOKAL_CORE_PROGRAM_ID
IDRX_MINT_ADDRESS                    # Server copy
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_PUBLIC_URL
NEXT_PUBLIC_MAPBOX_TOKEN
```

---

## 14. When in Doubt

1. **Read `LOKAL_TDD_patch.md` first** for schema changes (v2.1).
2. **Read the TDD v2.** It has the code patterns already written.
3. **Read the PRD.** It has the "why."
4. **Use Context7 MCP** for up-to-date library docs (Solana, Anchor, Metaplex, Next.js, Prisma, Supabase).
5. **Ask the user** before introducing new dependencies, changing the schema, or touching the blockchain program.
6. **Never invent an API.** If you can't remember exactly how a Metaplex or Anchor call is shaped, look it up.

---

## 15. Tone & Style

- **Code over prose.** When answering technical questions, write the code, then explain.
- **Specific over generic.** "In `src/lib/solana/fieldHash.ts`, line 8" > "somewhere in the hashing code."
- **Indonesian context matters.** Prices are `Rp 400.000` format in UI strings, but `400000` in code. Copy is in Bahasa Indonesia for end users, English for admin/dev.
- **26 days to demo.** Every suggestion should pass the filter: "Does this ship a better demo in 26 days?" If no, flag it as post-hackathon.

---

_"Simulate before you operate." — LOKAL, 2025_

---

## 16. Available Agents, Skills & CLI Tools

Quick-reference for every AI context you can invoke. Use the agent best matched to the work at hand. Always use `context7` before writing any Solana/Anchor/Metaplex/Prisma API call.

### Agents (14) — `.claude/agents/`

| Agent                    | Model  | Use When                                                        |
| ------------------------ | ------ | --------------------------------------------------------------- |
| `nextjs-developer`       | sonnet | App Router pages, API routes, middleware, server actions        |
| `frontend-developer`     | sonnet | UI components, Tailwind styling, accessibility, landing pages   |
| `backend-developer`      | sonnet | API logic, DB queries, webhook handlers, background jobs        |
| `fullstack-developer`    | sonnet | Cross-layer features touching DB + API + UI together            |
| `typescript-pro`         | sonnet | Advanced types, generics, type-level programming, strict mode   |
| `react-specialist`       | sonnet | React 18+ patterns, state management, streaming UI, performance |
| `rust-engineer`          | sonnet | Anchor programs, Rust systems code, ownership patterns          |
| `sql-pro`                | sonnet | Prisma schema design, migration strategy, query optimization    |
| `code-reviewer`          | sonnet | PR review, code quality audits, architecture review             |
| `security-auditor`       | opus   | Security audits — read-only, no code changes                    |
| `debugger`               | sonnet | Bug diagnosis, root cause analysis, error trace investigation   |
| `prompt-engineer`        | sonnet | Tuning report generator prompt, free/paid chat prompts          |
| `documentation-engineer` | sonnet | README, DEMO_RUNBOOK, API docs, guides                          |
| `refactoring-specialist` | sonnet | Code cleanup, deduplication, removing technical debt            |

### Skills (8) — `.claude/skills/`

| Skill              | Use When                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `helius`           | Webhook payload shape, DAS API, Enhanced Transactions, priority fees, tx history           |
| `metaplex`         | Metaplex Core NFT minting, NonTransferable plugin, Umi framework — **always use for T-12** |
| `light-protocol`   | ZK Compression for Proof B stretch goal                                                    |
| `solana-kit`       | `@solana/kit` modern SDK patterns (note: MVP uses web3.js v1)                              |
| `solana-agent-kit` | If paid chat ever needs agentic Solana actions                                             |
| `vulnhunter`       | Security vulnerability scan before demo day (run on T-35)                                  |
| `pyth`             | Price feed oracle — not used in MVP, available for post-hackathon                          |
| `context7`         | **Always run first** for Solana/Anchor/Metaplex/Next.js/Prisma/Supabase API questions      |

### CLI Tools

| Tool             | Invoke                                        | Use When                                             |
| ---------------- | --------------------------------------------- | ---------------------------------------------------- |
| **Context7 MCP** | `npx ctx7@latest library <name> "<question>"` | Before ANY library API call                          |
| **Supabase CLI** | `supabase`                                    | Migrations, type generation, local dev, RLS policies |
| **Vercel CLI**   | `vercel`                                      | Deploy, `vercel env pull`, `vercel logs`             |
| **Anchor CLI**   | `anchor build / deploy / test`                | Build/deploy Solana program, run Anchor tests        |
| **Solana CLI**   | `solana`                                      | Keypair management, devnet airdrop, config           |
| **GitHub CLI**   | `gh pr create / gh pr checks`                 | PR management for 2-person team                      |

### How to Invoke an Agent for a Ticket

```
> /[agent-name] Implement T-XX: [ticket title].
>
> Context: [paste key dependencies and what they produced]
>
> Deliverables:
> - src/path/to/file.ts
> - src/path/to/other.ts
>
> Acceptance Criteria:
> [paste from PLAN.md]
>
> Use context7 for any [Solana/Prisma/Next.js] API questions.
```

### Planning Files

- `.planning/PLAN.md` — Full 36-ticket development plan with acceptance criteria
- `.planning/STATE.md` — Ticket status tracking (update every session)

### IMPORTANT NOTES

Always use Context7 documentations so you can get better context and always up to date with the documentations so you won't hallucinate

### Appendix

#### Add to `src/lib/constants/pricing.ts`

```typescript
export const CO_SESSION_SHARE_RATE = 0.05; // 5% of session price to CO
export const CO_SESSION_SHARE_IDRX = SESSION_PRICE_IDRX * CO_SESSION_SHARE_RATE; // 20,000
```
