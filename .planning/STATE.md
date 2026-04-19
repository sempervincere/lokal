# LOKAL — Development State Tracker
> **Last Updated:** Day 2 (2026-04-19) | *Update this file every session.*

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
| T-02 | Anchor Workspace Init | Dylan | PENDING | — |
| T-03 | Supabase Auth + Middleware | Daffa | DONE | @supabase/ssr installed; server.ts, client.ts, middleware.ts, auth/callback route, login page complete |
| T-04 | Constants, Types, Utilities | Daffa | PENDING | Needs T-00 |

**Phase 0 Progress:** 2 / 5 tickets done

---

## Phase 1 — Foundation UI (Days 2–3)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-05 | Wallet Adapter Provider | Daffa | PENDING | Needs T-00, T-03 |
| T-06 | UI Component Library | Daffa | PENDING | Needs T-00 |
| T-07 | Seed Margonda Cluster Shell | Daffa | PENDING | Needs T-01 |

**Phase 1 Progress:** 0 / 3 tickets done

---

## Phase 2 — Blockchain Core (Days 4–7)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-08 | Anchor Program `lokal_core` | Dylan | PENDING | Needs T-02 |
| T-09 | Anchor Tests | Dylan | PENDING | Needs T-08 |
| T-10 | Field Hash Utility | Dylan | PENDING | Needs T-00 |
| T-11 | IDRX Payment Tx Builder | Dylan | PENDING | Needs T-00, T-04 |
| T-12 | Metaplex Core NFT Minting | Dylan | PENDING | Needs T-00 |
| T-13 | Anchor Client (TypeScript) | Dylan | PENDING | Needs T-08 (IDL) |

**Phase 2 Progress:** 0 / 6 tickets done

---

## Phase 3 — Data Layer + Free Chat (Days 8–12)

| Ticket | Title | Owner | Status | Blocker / Notes |
|--------|-------|-------|--------|-----------------|
| T-14 | Cluster API Routes | Daffa | PENDING | Needs T-01, T-04 |
| T-15 | Seed Margonda 20 Tier 1 Fields | Dylan | PENDING | Needs T-01, T-04, T-07 |
| T-16 | Admin Field Validation API | Dylan | PENDING | Needs T-01, T-10, T-13 |
| T-17 | Cluster Browser + Mapbox | Daffa | PENDING | Needs T-06, T-14 |
| T-18 | Free Chat AI + API Route | Daffa | PENDING | Needs T-01, T-04, T-15 |
| T-19 | Free Chat UI | Daffa | PENDING | Needs T-06, T-17, T-18 |
| T-20 | Admin Field Review UI | Daffa | PENDING | Needs T-06, T-16 |

**Phase 3 Progress:** 0 / 7 tickets done

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
| 0 — Initialization | 3 | 5 | 60% |
| 1 — Foundation UI | 0 | 3 | 0% |
| 2 — Blockchain Core | 0 | 6 | 0% |
| 3 — Data Layer + Chat | 0 | 7 | 0% |
| 4 — Payment + Reports | 0 | 6 | 0% |
| 5 — Session Flow | 0 | 4 | 0% |
| 6 — Demo Polish | 0 | 3 | 0% |
| 7 — Final Prep | 0 | 2 | 0% |
| **TOTAL** | **3** | **36** | **8%** |

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
- [ ] Solana Explorer: field hash Memo transaction visible
- [ ] Solana Explorer: IDRX payment tx with sessionId in Memo
- [ ] Phantom: CO soulbound NFT in Dylan's wallet
- [ ] Phantom: NFT shows as non-transferable

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
| Day 0 | IDRX decimals = 2, base units = 40_000_000 | Critical invariant — verify in every payment-related ticket |

---

## Active Blockers

*None currently. Update this section when blockers arise.*

---

*STATE.md is the source of truth for ticket progress. Update it every work session.*
