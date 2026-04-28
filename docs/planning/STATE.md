# LOKAL — Development State Tracker
> **Last Updated:** Day 7 (2026-04-26) | *Update this file every session.*
> **Session Note:** T-09 through T-13 all completed (Phase 2 Blockchain Core done). IDRX decimals updated to 6 (devnet mint: 4piP71B...). CO soulbound NFT minted on devnet. Anchor client smoke-tested with real devnet txs.

---

## How to Use

- Update `Status` column when starting or completing a ticket
- Add `Notes` for blockers, decisions, or important context
- `BLOCKED` = dependency not done yet, or external blocker
- Do NOT mark `DONE` unless all acceptance criteria in PLAN.md pass

**Status Values:** `PENDING` | `IN_PROGRESS` | `DONE` | `BLOCKED` | `SKIPPED`

---

## Phase 0 — Project Initialization (Days 1–2)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-00 | Git + Next.js Scaffolding | Daffa | DONE | next.config.mjs, tailwind, tsconfig complete |
| T-01 | Prisma Schema + Migration | Daffa | DONE | schema v2.1 (8 tables). SQL in prisma/migrations/. Apply via Supabase SQL editor — see notes |
| T-02 | Anchor Workspace Init | Dylan | DONE | — |
| T-03 | Supabase Auth + Middleware | Daffa | DONE | @supabase/ssr; server.ts, client.ts, middleware.ts complete. User sync to Prisma added (syncUser.ts + /api/auth/sync). |
| T-04 | Constants, Types, Utilities | Daffa | DONE | fields.ts, pricing.ts, cluster.ts, session.ts, report.ts in src/lib/constants/. CLAUDE_MODEL=qwen3.5-plus. |

**Phase 0 Progress:** 5 / 5 tickets done (T-02 is Dylan's Anchor track — anchor/.git removed, source now tracked in main repo)

---

## Phase 1 — Foundation UI (Days 2–3)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-05 | Wallet Adapter Provider | Daffa | DONE | SolanaWalletProvider created. Root layout updated. All wallet-adapter packages already installed. |
| T-06 | UI Component Library | Daffa | DONE | Button (loading+danger), Badge, Card, Modal, InputField, LoadingSpinner, ProgressBar all done. |
| T-07 | Seed Margonda Cluster Shell | Daffa | DONE | Seed run: admin@lokal.id, ClusterOwner e26ed832, Cluster depok-margonda-001 (SEEDING). prisma.config.ts updated with seed command. |

**Phase 1 Progress:** 3 / 3 tickets done

---

## Phase 2 — Blockchain Core (Days 4–7)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-08 | Anchor Program `lokal_core` | Dylan | DONE | Deployed at 4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ |
| T-09 | Anchor Tests | Dylan | DONE | 3/3 tests pass on devnet. anchor/tests/lokal-core.ts. |
| T-10 | Field Hash Utility | Dylan | DONE | 9/9 vitest tests pass. Golden value frozen. src/lib/solana/fieldHash.ts |
| T-11 | IDRX Payment Tx Builder | Dylan | DONE | IDRX decimals = 6, base units = 400_000_000_000. Platform ATA created: DSoCo1x... 5/5 tests pass. |
| T-12 | Metaplex Core NFT Minting | Dylan | DONE | NFT minted at 6VpbFiLLJas1CRV8wWD6LKe6pMejUX4wa5ZYgGfoufp3. PermanentFreezeDelegate (soulbound). Check Phantom NFT tab on devnet. |
| T-13 | Anchor Client (TypeScript) | Dylan | DONE | anchorClient.ts smoke-tested. initializeCluster + anchorFieldHash both hit devnet. |

**Phase 2 Progress:** 6 / 6 tickets done ✅

---

## Phase 3 — Data Layer + Free Chat (Days 8–12)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-14 | Cluster API Routes | Daffa | DONE | GET /api/clusters + GET /api/clusters/[slug]. Slug validation, no raw values exposed, categoryBreakdown computed server-side, Cache-Control headers set. |
| T-15 | Seed Margonda 20 Tier 1 Fields | Dylan | DONE | 20 fields seeded, cluster ACTIVE, confidenceScore=87, dataCompleteness=100. B1 ceiling=Rp28K (matcha Rp50K = 78.6% above = "79%"). API returns keyStats. UI pages updated to fetch from /api/clusters. |
| T-16 | Admin Field Validation API | Dylan | DONE | POST /api/admin/fields (APPROVE/REJECT + on-chain hash anchor + cluster stat recompute). POST /api/admin/clusters (create + optional initOnChain). tsc clean. |
| T-17 | Cluster Browser + Mapbox | Daffa | DONE | /clusters RSC (Prisma direct), ClusterCard, ClusterStats, ClusterMap (mapbox-gl dynamic import, 1.5km circle, MapPlaceholder fallback). tsc clean. |
| T-18 | Free Chat AI + API Route | Daffa | PENDING | Needs T-01, T-04, T-15 |
| T-19 | Free Chat UI | Daffa | PENDING | Needs T-06, T-17, T-18 |
| T-20 | Admin Field Review UI | Daffa | PENDING | Needs T-06, T-16 |

**Phase 3 Progress:** 4 / 7 tickets done

---

## Phase 4 — Payment + Report Generation (Days 13–17)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-21 | Session + Concept Form API | Daffa | PENDING | Needs T-01, T-03 |
| T-22 | Concept Form UI + Menu Builder | Daffa | PENDING | Needs T-06, T-21 |
| T-23 | Payment Button Component | Daffa | PENDING | Needs T-05, T-11, T-21 |
| T-24 | Helius Webhook Payment Detection | Dylan | PENDING | Needs T-01, T-04 |
| T-25 | Report Generator (Single Claude Call) | Daffa | PENDING | Needs T-01, T-18 |
| T-26 | R2 Storage + PDF Generation | Daffa | PENDING | Needs T-25 |

**Phase 4 Progress:** 0 / 6 tickets done

---

## Phase 5 — Session Flow + Consultation (Days 18–21)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-27 | Report Viewer Page | Daffa | PENDING | Needs T-06, T-21, T-25, T-26 |
| T-28 | Paid Consultation Chat | Daffa | PENDING | Needs T-18, T-27 |
| T-29 | Payment Verification Fallback | Dylan | PENDING | Needs T-21, T-24 |
| T-30 | Business Owner Dashboard | Daffa | PENDING | Needs T-06, T-21 |

**Phase 5 Progress:** 0 / 4 tickets done

---

## Phase 6 — Demo Polish + Testing (Days 22–24)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-31 | Landing Page (Demo-Ready) | Daffa | PENDING | Needs T-06, T-17 |
| T-32 | On-Chain Hash Anchoring Demo | Dylan | PENDING | Needs T-15, T-16, T-12, T-13 |
| T-33 | E2E Integration Test + Runbook | Daffa | PENDING | Needs all previous |

**Phase 6 Progress:** 0 / 3 tickets done

---

## Phase 7 — Buffer + Final Prep (Days 25–26)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-34 | Bug Fixes + Error State Polish | Both | PENDING | Needs T-33 |
| T-35 | README + Repository Cleanup | Dylan | PENDING | Needs T-34 |

**Phase 7 Progress:** 0 / 2 tickets done

---

## Overall Progress

| Phase | Done | Total | % |
|-------|------|-------|---|
| 0 — Initialization | 5 | 5 | 100% |
| 1 — Foundation UI | 3 | 3 | 100% |
| 2 — Blockchain Core | 6 | 6 | 100% ✅ |
| 3 — Data Layer + Chat | 0 | 7 | 0% |
| 4 — Payment + Reports | 0 | 6 | 0% |
| 5 — Session Flow | 0 | 4 | 0% |
| 6 — Demo Polish | 0 | 3 | 0% |
| 7 — Final Prep | 0 | 2 | 0% |
| **TOTAL** | **14** | **36** | **38.9%** |

---

## Demo Day Checklist (TDD §13)

- [ ] Landing page loads, looks polished, <3s load time
- [ ] Margonda cluster shows on map with 1.5km circle
- [ ] Cluster detail page shows completeness + confidence score
- [ ] Free chat: Claude cites field codes (B1, M3, etc.)
- [ ] Message 7 triggers conversion modal
- [ ] Concept form submits (F&B type, menu, target customer)
- [ ] Phantom opens with 400,000 IDRX
- [ ] Payment confirms on devnet within 5s
- [ ] Session activates within 10s of payment
- [ ] "Generating report..." UI shows during 20–40s wait
- [ ] Report renders all 10 sections
- [ ] Section 6 shows: "Rp 50,000 Signature Matcha is 79% above price ceiling"
- [ ] PDF downloads successfully
- [ ] 12-hour paid chat opens and responds

### Blockchain Proof Points
- [x] Solana Explorer: field hash Memo transaction visible — tx 2vk2v6SRQs... (B1, Margonda)
- [ ] Solana Explorer: IDRX payment tx with sessionId in Memo — needs T-23/T-24
- [x] Phantom: CO soulbound NFT in Dylan's wallet — 6VpbFiLLJas1CRV8wWD6LKe6pMejUX4wa5ZYgGfoufp3 (devnet)
- [x] Phantom: NFT shows as non-transferable — PermanentFreezeDelegate plugin set

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Day 0 | 36 tickets across 8 phases | Scoped for 26-day sprint, 1-2h per ticket |
| Day 2 | Prisma v7 + prisma.config.ts + PrismaPg adapter | npm installed Prisma 7.7.0; v7 requires config file and driver adapter (no url in schema.prisma) |
| Day 2 | T-01 migration: apply SQL manually via Supabase SQL editor | WSL2 blocks port 5432 (direct); pooler auth failed — SQL saved to prisma/migrations/20260419000000_init/ |
| Day 0 | No pgvector/RAG | One cluster, 20 fields, direct prompt injection is sufficient |
| Day 0 | Single Claude call for report | Simpler, faster, cheaper than 10 per-section calls |
| Day 0 | @react-pdf/renderer not Puppeteer | Zero infra overhead, no headless Chrome needed |
| Day 0 | IDRX decimals = 2, base units = 40_000_000 | Original spec — overridden Day 7 |
| Day 7 | IDRX decimals = 6, base units = 400_000_000_000 | Devnet IDRX mint (4piP71B...) has 6 decimals. Updated pricing.ts, CLAUDE.md, idrxTransfer.ts. |
| Day 7 | CO soulbound NFT: PermanentFreezeDelegate (not NonTransferable) | mpl-core plugin confirmed via Context7 + package inspection. NFT at 6VpbFiL... |
| Day 7 | NEXT_PUBLIC_HELIUS_RPC_URL (not HELIUS_RPC_URL) | .env.local uses NEXT_PUBLIC_ prefix. anchorClient.ts and mintCoNft.ts handle both. |

---

## Active Blockers

*None currently. Update this section when blockers arise.*

---

*STATE.md is the source of truth for ticket progress. Update it every work session.*
