# LOKAL — Product Requirements Document

### Indonesia's F&B Hyperlocal Market Intelligence Platform

**Version:** 2.0 | **Date:** April 2025 | **Status:** Draft — Hackathon MVP + Production Plan

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Market Context](#2-problem-statement--market-context)
3. [Product Vision & Positioning](#3-product-vision--positioning)
4. [Target Audience & User Personas](#4-target-audience--user-personas)
5. [Success Metrics & KPIs](#5-success-metrics--kpis)
6. [User Flows](#6-user-flows)
7. [Feature Requirements (Functional)](#7-feature-requirements-functional)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [MVP Scope & Hackathon Strategy](#9-mvp-scope--hackathon-strategy)
10. [Risks, Assumptions & Dependencies](#10-risks-assumptions--dependencies)
11. [Roadmap](#11-roadmap)
12. [Revision Log](#12-revision-log)

---

## 1. Executive Summary

**LOKAL** (Location-Oriented Knowledge for AI-powered Local intelligence) is a hyperlocal F&B market intelligence platform built on Solana. It enables aspiring Indonesian F&B business owners to simulate their business concept against verified, street-level local market data — before committing capital, signing a lease, or ordering inventory.

The platform operates on two sides:

- **Cluster Owners (COs)** — vetted local experts who research and submit verified field data about a specific geographic corridor ("cluster"). They are compensated per validated field and earn ongoing passive income from session revenue sharing.
- **Business Owners** — aspiring F&B entrepreneurs who explore a cluster through a free AI chat, then pay **Rp 400,000** to unlock a full 10-section business simulation report and a 12-hour AI consultation window tailored to their specific concept.

The entire data trail — field submissions, quality attestations, and CO credentials — is anchored on Solana via on-chain hashing and soulbound NFTs, making LOKAL's data trustworthy in a way that no centralized database can match.

**The pitch in one sentence:** Your uncle's matcha café failed because nobody told him Depok's price ceiling is Rp 28,000, not Rp 50,000. LOKAL tells you that before you sign the lease.

**Hackathon:** Superteam Indonesia — National Campus Hackathon, Frontier Colosseum track  
**Track:** Consumer Apps on Solana

---

## 2. Problem Statement & Market Context

### 2.1 The Founding Story

The founder's uncle opened a premium matcha café in Depok after seeing the matcha trend explode in Jakarta. Price point: Rp 50,000 per drink — matching premium Jakarta cafés. The café closed permanently within months. The Depok market's price ceiling for this category was Rp 25,000–30,000. He was copying a Jakarta trend into a market with completely different purchasing behavior. No tool existed to warn him.

This is not an isolated case. It is the default experience for most Indonesian F&B entrepreneurs.

### 2.2 Market Size & Growth

The Indonesian F&B sector is one of the largest and fastest-growing industries in the country:

- **4.85 million** F&B service businesses operating in Indonesia as of 2023, a **21.13% increase** since 2016 _(Source: BPS — Food and Beverage Service Activities Statistics 2023)_
- **6.4 million** accommodation and F&B MSMEs registered as of December 2024 _(Source: Kadin Indonesia / Ministry of MSMEs, 2024)_
- F&B sector grew **5.90% year-on-year in 2024**, contributing **IDR 1,531.4 trillion** to GDP — accounting for **6.92% of Indonesia's total GDP** _(Source: Business-Indonesia.org, 2024)_
- F&B is the **third-largest contributor** to national GDP in H1 2024, after wholesale trade and construction _(Source: BPS via CRIF Asia, 2024)_
- **9.8 million workers** employed in the F&B service sector as of 2023 _(Source: BPS, 2023)_

### 2.3 The Failure Crisis

Despite the market's size, failure rates among Indonesian F&B MSMEs are catastrophically high:

- **60–90% of F&B businesses in Indonesia fail within the first year** _(Source: Foodizz Survey; Kompasiana; CNN Indonesia)_
- **85% of F&B MSMEs fail within the first three years** _(Source: Medium, Dennis Trama, 2026)_
- **50–60% of all MSMEs stop operating within three years; 80% fail within five years** _(Source: Prof. Yuyun Wirasasmita, Universitas Padjajaran)_
- **25% fail within 2 years; 45% within 5 years; 65% within 10 years** _(Source: Kontrakhukum.com)_

The consistently cited root causes:

1. No market research — selling what the owner likes, not what the market wants
2. Wrong location — poor assessment of foot traffic and local purchasing power
3. Wrong pricing — copying price points from other areas without validating local willingness to pay
4. Trend-copying without local validation — replicating what works in Jakarta without understanding local behavior

LOKAL directly prevents all four.

### 2.4 Current Alternatives and Why They Fail

| Method                 | Cost                | Time Required | Hyperlocal? | Reliable?    |
| ---------------------- | ------------------- | ------------- | ----------- | ------------ |
| Gut feeling            | Free                | Instant       | No          | No           |
| Manual research        | Time only           | 3–6 months    | Possible    | Variable     |
| F&B consultant         | Rp 1.25M+/hour      | Days–weeks    | Sometimes   | Yes          |
| Generic market reports | Rp 500K–5M          | Immediate     | No          | Partially    |
| DIY surveys            | Time + skill        | Weeks         | Possible    | Variable     |
| **LOKAL**              | **Rp 400K/session** | **Minutes**   | **Yes**     | **Verified** |

### 2.5 The Core Insight

**Hyperlocal behavior is not transferable.** A food concept that thrives in Kemang does not automatically work in Ciputat. What sells at Rp 45,000 near a private university gate fails at Rp 35,000 near a public university gate. The street matters. The anchor point matters. The catchment demographic matters. No existing platform captures this at corridor granularity with verified, regularly-refreshed data.

---

## 3. Product Vision & Positioning

### 3.1 Vision Statement

> **LOKAL becomes the mandatory first step before opening any F&B business in Indonesia.** Every aspiring café owner, warung operator, and restaurant entrepreneur validates their concept here before signing a lease.

### 3.2 Tagline

> **"Simulate before you operate."**

### 3.3 Why F&B Only (Deliberate Niche)

LOKAL is an F&B-only platform. This is a strategic choice, not a limitation:

- The founding story is F&B. The uncle's matcha café is the pitch anchor — it only works if the platform is built around F&B.
- F&B is Indonesia's highest-growth and highest-failure sector simultaneously — the need is urgent.
- F&B data fields are well-defined and consistently collectible across all areas.
- "Indonesia's F&B business simulator" is a sharper positioning than any generic tool.
- Fashion, retail, and services require completely different data fields and research methods. Expanding too early dilutes quality and credibility.

Expansion beyond F&B is a Year 2 decision, only after the F&B model is proven.

### 3.4 Blockchain Rationale

LOKAL's core value proposition — trustworthy hyperlocal data — requires trust infrastructure that a centralized database cannot provide:

- **Data integrity:** On-chain hashing proves data was never tampered with after submission
- **CO credentials:** Soulbound NFTs create verifiable, non-sellable identity and reputation history
- **Payment transparency:** IDRX payments on Solana are fully auditable — the platform cannot deny or alter a confirmed payment
- **ZK quality signals:** Zero-knowledge proofs let users verify cluster quality without exposing raw competitive intelligence

Without blockchain, LOKAL is asking users to "trust us." With blockchain, trust is structural and independently verifiable.

---

## 4. Target Audience & User Personas

### 4.1 Primary User: Business Owner

**Demographic:** Indonesian entrepreneurs aged 22–45, seriously considering opening or expanding an F&B business. First-time founders to existing operators looking at a second location.

**Pain:** Doesn't know if their specific concept works at their specific target location. Can't afford manual research or consultants. Has seen friends or family lose money on a failed food business.

**Tech comfort:** Moderate. Uses GoPay, OVO, Dana daily. Does NOT have a crypto wallet and does not want to learn crypto. The platform must make crypto invisible — business owners pay like they pay for any other service.

**Payment UX:**

- Hackathon: Phantom wallet + IDRX (judges are crypto-native, acceptable for demo)
- Production: GoPay / OVO / bank transfer → IDRX conversion handled by platform backend, completely invisible to user

---

**Persona A — "Budi the First-Timer"**

> Budi, 27, marketing executive in Jakarta. Wants to open a specialty coffee shop near his childhood home in Bekasi. Has Rp 120M saved. Visited the area — it "feels right" — but doesn't know what price he can charge, who his real competitors are, or whether foot traffic near his target spot supports a Rp 45K coffee concept. F&B consultants are out of reach at Rp 1.25M/hour. Will use LOKAL to validate before committing.

---

**Persona B — "Sari the Expander"**

> Sari, 38, runs a successful warung nasi in Tangerang Selatan. Wants to open a second location in BSD where she's seen heavy F&B development. Knows that "it worked in Tangerang" doesn't mean "it works in BSD." Will use LOKAL to validate her second location before signing a lease.

---

### 4.2 Secondary User: Cluster Owner

**Demographic:** Indonesian adults aged 20–45 who are deeply embedded in a specific local area. Students, community figures, local business owners, part-time researchers.

**Motivation:** Earn IDRX for contributing local knowledge they already have. Passive income from session revenue share once their cluster is active.

**Tech comfort:** Low-moderate. Needs guided wallet setup during onboarding. Acceptable friction since they work with LOKAL directly and it's a one-time setup.

---

**Persona — "Rizky the Campus Local"**

> Rizky, 21, third-year student at Universitas Indonesia in Depok. Has lived near Jalan Margonda for three years. Knows every café, warung, and kaki lima on the strip. Knows when the post-lecture rush hits, what students will pay for coffee, which café openings lasted and which closed in 6 months. Applies as Cluster Owner for the Margonda corridor. Surveys classmates via WhatsApp group, supplements with his own observations. Earns IDRX per validated field + revenue share from every business owner session on his cluster.

---

### 4.3 Internal User: Platform Admin

**Who:** Core LOKAL team.

**Responsibilities:** Review CO applications, approve cluster proposals, spot-check submitted field evidence (20% sampling), resolve trust score disputes, update NFT metadata, manage quarterly refresh schedule, run AI quality tests before cluster goes live.

---

## 5. Success Metrics & KPIs

### 5.1 Hackathon Success (April 2025)

| Metric                                    | Target                                           |
| ----------------------------------------- | ------------------------------------------------ |
| Working MVP with no crashes               | Yes                                              |
| Active clusters on devnet                 | 1 (Jalan Margonda, Depok)                        |
| On-chain transactions visible on Explorer | ≥ 3 (payment + data hash + NFT mint)             |
| Report sections generated                 | ≥ 2 (Customer Profile + Pricing Strategy)        |
| ZK proof demonstrated                     | Proof B (data density) — at minimum conceptually |

### 5.2 90-Day Post-Launch Targets

| Category   | Metric                                    | Target                                |
| ---------- | ----------------------------------------- | ------------------------------------- |
| Conversion | Free-to-paid conversion rate              | ≥ 15% of users reaching message limit |
| Revenue    | Sessions per active cluster per month     | ≥ 10                                  |
| Quality    | Average session rating                    | ≥ 4.0 / 5.0                           |
| CO         | Time from approval to cluster Active      | ≤ 30 days                             |
| CO         | Quarterly refresh compliance              | ≥ 80% on time                         |
| CO         | Average trust score across all active COs | ≥ 65                                  |
| Business   | Gross margin                              | ≥ 85%                                 |

### 5.3 Unit Economics — Full Detailed Calculation

#### Per-Session Costs and Revenue

| Line Item                     | Amount         | Calculation Notes                                                                                                         |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Revenue**                   | **Rp 400,000** | Per paid session (400,000 IDRX)                                                                                           |
| AI API cost                   | Rp 17,000      | ~50 messages × ~3,000 tokens avg × Claude Sonnet pricing (~$3/M input, $15/M output) ≈ $1.05 ≈ Rp 17,000 at Rp 16,200/USD |
| Infrastructure                | Rp 5,000       | Hosting, DB, RPC — allocated per session assuming 200 sessions/month                                                      |
| CO session revenue share (8%) | Rp 32,000      | 8% × Rp 400,000                                                                                                           |
| **Total variable cost**       | **Rp 54,000**  |                                                                                                                           |
| **Gross profit per session**  | **Rp 346,000** | Gross margin: 86.5%                                                                                                       |

#### Fixed Costs Per Cluster Per Quarter

| Line Item                                                    | Amount           | Notes                                                     |
| ------------------------------------------------------------ | ---------------- | --------------------------------------------------------- |
| CO Tier 1 fields milestone (20 fields, Reputation Tier 1 CO) | Rp 100,000       | See payment table below — paid once on cluster activation |
| CO Tier 2 fields milestone (10 fields, Reputation Tier 1 CO) | Rp 80,000        | Rp 8,000 × 10 fields                                      |
| CO quarterly refresh completion bonus                        | Rp 75,000        | Flat bonus for on-time full refresh each quarter          |
| Platform infrastructure per cluster (Rp 5M ÷ 10 clusters)    | Rp 500,000       | Quarterly infra cost allocated per active cluster         |
| Admin time (Rp 15M quarterly salary ÷ 10 clusters)           | Rp 1,500,000     | Part-time admin reviewing and managing clusters           |
| **Total fixed cost per cluster per quarter**                 | **Rp 2,255,000** |                                                           |

#### Break-Even Calculation

```
Break-even sessions = Fixed cost ÷ Gross profit per session
Break-even sessions = Rp 2,255,000 ÷ Rp 346,000
Break-even sessions = 6.52 → 7 sessions per quarter per cluster

≈ 2–3 sessions per month per cluster
```

#### Lean Phase (Hackathon — No admin salary, minimal infra)

```
Lean fixed cost = Rp 100,000 (Tier 1) + Rp 80,000 (Tier 2) + Rp 75,000 (bonus) = Rp 255,000
Break-even (lean) = Rp 255,000 ÷ Rp 346,000 = 0.74 → 1 session

1 paid session covers the entire quarterly maintenance cost for 1 cluster.
```

#### Annual Projection (10 clusters, 10 sessions/cluster/month)

| Metric                         | Amount             |
| ------------------------------ | ------------------ |
| Monthly sessions               | 100                |
| Monthly gross revenue          | Rp 40,000,000      |
| Monthly variable COGS          | Rp 5,400,000       |
| Monthly CO session shares (8%) | Rp 3,200,000       |
| Monthly gross profit           | Rp 31,400,000      |
| Monthly infra + admin          | Rp 6,666,667       |
| **Net operating profit/month** | **~Rp 24,733,333** |

---

## 6. User Flows

### 6.1 Business Owner — Complete Flow

```
[LANDING]
User arrives → "Indonesia's F&B Business Simulator. Simulate before you operate."
CTAs: Browse Clusters | How It Works

[CLUSTER BROWSE]
Filter by: city → neighborhood → corridor
Cluster card shows:
  - Name + map thumbnail
  - Data freshness ("Updated 23 days ago")
  - ZK data density badge ("≥30 verified data points")
  - Confidence score (e.g. "87/100")
  - F&B subcategories covered
  - "Chat Free" CTA

[FREE CHAT — 7 MESSAGES]
No payment, no account required
Counter visible: "3/7 free messages used"
AI answers from verified cluster RAG data
Examples: "What's the average coffee price here?" / "Is this area good for premium F&B?"

[CONVERSION MOMENT]
Triggered by: hitting 7-message limit OR high-intent question ("Should I open here?" / "What price?")
Modal: "Get your full business simulation — Rp 400,000"
Includes: full 10-section report + 12-hour AI consultation window

[CONCEPT FORM — BEFORE PAYMENT]
Step 1 — F&B Subcategory:
  ○ Café / Coffee Shop
  ○ Restaurant (sit-down, full menu)
  ○ Bakery / Pastry Shop
  ○ Specialty Beverage Shop
  ○ Street Food / Booth / Gerobak
  ○ Cloud Kitchen / Delivery Only


Step 2 — Concept Details:
  Concept name (optional)
  Price positioning: Budget (<Rp 20K avg) / Mid (Rp 20–50K) / Premium (>Rp 50K)
  Target customer: [short text — "university students" / "office workers" / "families"]

Step 3 — Menu Builder (repeatable):
  [+ Add Item]
    Product name | Planned price (IDR) | Description (optional)
  Add as many items as needed

Step 4 — Specific Questions (optional):
  "Anything you want the report to focus on?"

[PAYMENT]
Hackathon: Phantom wallet → 400,000 IDRX transfer
Production: GoPay / OVO / bank transfer → IDRX conversion invisible to user
Backend: confirms transfer → opens session in PostgreSQL → starts report generation

[REPORT GENERATION — 30–60 seconds]
Each menu item gets individual price analysis vs. cluster ceiling:
  ✓ "Matcha Latte Rp 28K — within range (cluster ceiling: Rp 32K)"
  ✗ "Signature Matcha Rp 55K — 72% above ceiling. High failure risk."
Full 10-section report delivered; downloadable as PDF

[12-HOUR CONSULTATION WINDOW]
AI loaded with: concept type + menu + price targets + cluster data + report context
User asks freely:
  "What if I lower to Rp 30K?"
  "Which street in this cluster has best foot traffic for my concept?"
  "What marketing channels actually work here?"
Window timer visible: "Consultation closes in 11h 23m"

[POST-SESSION]
1–5 star rating prompt
Optional: flag incorrect advice (text field)
Report re-downloadable from account for 30 days
Feedback aggregated → maps to CO trust score
```

### 6.2 Cluster Owner — Complete Flow

```
[APPLICATION]
Track A — Platform-recruited:
  LOKAL reaches out via WhatsApp/email
  Candidate reviews offer and accepts → onboarding begins

Track B — Self-applied:
  Applicant fills proposal form:
    - Proposed cluster name + approximate boundaries
    - Length and nature of connection to the area
    - Qualifications (lived there X years, runs a business there, etc.)
    - 5 sample data points as quality demonstration
    - Contact preference

[ADMIN REVIEW — 48-HOUR SLA]
Core team evaluates:
  - Quality of 5 sample data points (specific? evidence-backed?)
  - Stated connection to the area (credible?)
  - Proposed cluster boundary (commercially sensible?)

Outcome:
  Approved → Onboarding begins
  Rejected → Feedback email + invitation to reapply

[ONBOARDING]
1. Guided Solana wallet setup (step-by-step, no crypto knowledge assumed)
2. IDRX wallet address verification
3. Training: field definitions, evidence standards, survey methodology
4. Access to Cluster Owner Community (WhatsApp/Telegram group)
5. Soulbound NFT minted to wallet:
     reputation_score: 0 | trust_score: 60 | status: "Seeding"

[DATA COLLECTION]
Three types of work (see Section 7.4 for field catalog):

Type A — Direct Observation (~40% of fields):
  CO visits competitor outlets → records menu prices → photos as evidence
  CO observes and counts foot traffic at different times → notes as evidence
  CO walks transport routes → times them → records score
  CO photographs commercial strips and anchor points

Type B — Survey / Interview (~40% of fields — COMPLEX fields):
  CO uses their existing networks:
    - RT/RW WhatsApp group
    - Campus group chats
    - Regular customers at their own business
    - Friends and community connections in the area
  CO distributes structured LOKAL survey link (one link per field type)
  TARGET: minimum 20–30 respondents per survey field
  Bias prevention rules:
    - Must include respondents from at least 3 different demographic groups
      (age range: at least 2 of 3 groups; income range: at least 2 of 3 groups)
    - At least 30% of respondents must not be from the same primary group
      (e.g. CO cannot survey only university students for a warung area)
    - CO declares respondent mix in submission form
  CO aggregates responses into a single summarized value before submitting
  (LOKAL stores aggregate only — no individual respondent PII stored)

Type C — Public Data (~20% of fields):
  BPS (bps.go.id) for population density and demographic baselines
  OLX / Lamudi / direct landlord inquiry for commercial rental pricing
  Local news / Pemkot / social media for development pipeline
  Google Maps for anchor point distances

[SUBMISSION FORM — PER FIELD]
For each field, CO submits:
  - Field ID (dropdown from approved catalog)
  - Value (the data point, formatted per field type)
  - Source type: Direct Observation / Survey (N respondents) / Interview / Public Record / Hybrid
  - Respondent count (if survey): minimum 20 required; CO declares demographic mix
  - Evidence: photo, screenshot, survey summary screenshot, or written notes
  - Confidence level: High / Medium / Low

On submission:
  SHA-256 hash generated: hash(field_id + value + co_wallet + timestamp)
  Hash stored on Solana via Memo program → tamper-proof audit trail
  Submission status: Pending

[ADMIN SPOT-CHECK]
~20% of submissions reviewed by admin
Admin checks: does evidence support the submitted value?
Approved → field marked Validated; CO queued for field reward
Rejected → CO notified; no reward; must resubmit with stronger evidence

[PAYMENT MILESTONE: CLUSTER GOES ACTIVE]
After all Tier 1 fields (20 fields) submitted and reviewed:
  Admin runs AI quality test:
    "I want to open a premium matcha café here. What price should I charge?"
    "Who are my main competitors in this area?"
  If AI gives coherent, specific, locally-grounded answers → PASS
  If AI gives vague or generic answers → identify weak fields, request CO to strengthen

On PASS:
  Cluster status → "Active"
  Cluster appears on platform for business owners
  CO receives Tier 1 milestone payment (see payment table in Section 9)
  NFT metadata updated → status: "Active"
  CO begins earning 8% session revenue share from all paid sessions on their cluster

[ONGOING MANAGEMENT]
Monthly: CO reviews session rating notifications; trust score updates
Quarterly: CO refreshes all fields (re-surveys, re-observes, re-checks competitors)
  On-time (within 7 days of quarterly deadline): +Rp 75,000 bonus + trust score +3
  Late (>2 weeks): trust score −2
Urgent flag: CO submits fast-track update within 7 days of major local event
  (e.g. new mall opens, major competitor closes, major price shift observed)
```

---

## 7. Feature Requirements (Functional)

### 7.1 Cluster Browse & Discovery

| ID   | Feature                                                                  | Priority |
| ---- | ------------------------------------------------------------------------ | -------- |
| F-01 | Cluster list with search by city/neighborhood/street name                | Must     |
| F-02 | Cluster card: name, map thumbnail, freshness, confidence score, ZK badge | Must     |
| F-03 | Filter by F&B subcategory                                                | Should   |
| F-04 | Cluster detail page with full metadata preview                           | Should   |
| F-05 | Map view of cluster geographic boundaries                                | Could    |

### 7.2 Free Chat Interface

| ID   | Feature                                          | Priority |
| ---- | ------------------------------------------------ | -------- |
| F-06 | Chat interface (no payment, no account required) | Must     |
| F-07 | Message counter "X/7 free messages used"         | Must     |
| F-08 | AI responses grounded in cluster RAG data        | Must     |
| F-09 | Conversion modal at limit or high-intent message | Must     |
| F-10 | No account required for free chat                | Should   |

### 7.3 Concept Form & Report

| ID   | Feature                                                                     | Priority |
| ---- | --------------------------------------------------------------------------- | -------- |
| F-11 | F&B subcategory dropdown (9 options)                                        | Must     |
| F-12 | Concept name, price tier, target customer inputs                            | Must     |
| F-13 | Menu builder — add/edit/remove products with name + price + description     | Must     |
| F-14 | Per-product price analysis vs cluster price ceiling and sensitivity cliff   | Must     |
| F-15 | Full 10-section report generation (see AI & Report Architecture, Section 9) | Must     |
| F-16 | Report PDF download                                                         | Should   |
| F-17 | Report accessible in account for 30 days post-session                       | Should   |
| F-18 | Optional "specific questions" text field                                    | Should   |

### 7.4 12-Hour Consultation Window

| ID   | Feature                                                                         | Priority |
| ---- | ------------------------------------------------------------------------------- | -------- |
| F-19 | Chat window reopens after report with full context (concept + cluster + report) | Must     |
| F-20 | Countdown timer visible in UI                                                   | Must     |
| F-21 | Session expires exactly 12 hours from payment confirmation                      | Must     |
| F-22 | Post-session 1–5 star rating with optional flag field                           | Must     |

### 7.5 Payment System

| ID   | Feature                                                   | Priority         |
| ---- | --------------------------------------------------------- | ---------------- |
| F-23 | Phantom wallet connect (Solana)                           | Must (hackathon) |
| F-24 | IDRX transfer detection via Solana RPC (Helius/QuickNode) | Must             |
| F-25 | Session record in PostgreSQL (NOT on-chain PDA)           | Must             |
| F-26 | Transaction confirmation with Solana Explorer link        | Should           |
| F-27 | GoPay / OVO / bank transfer fiat on-ramp                  | Post-MVP         |

### 7.6 Cluster Owner Toolset

| ID   | Feature                                                                  | Priority |
| ---- | ------------------------------------------------------------------------ | -------- |
| F-28 | CO application form (proposal + 5 sample data points)                    | Must     |
| F-29 | Admin review queue with evidence viewer                                  | Must     |
| F-30 | Field submission form (see flow above for full field list)               | Must     |
| F-31 | SHA-256 hashing + Solana Memo anchoring per submission                   | Must     |
| F-32 | Submission status tracker (Pending / Validated / Flagged / Rejected)     | Must     |
| F-33 | IDRX reward balance and payout history                                   | Must     |
| F-34 | Cluster dashboard (completeness %, trust score, session count, earnings) | Should   |
| F-35 | Quarterly refresh reminder notification                                  | Should   |
| F-36 | Shareable survey link generator per field type                           | Should   |

### 7.7 Blockchain Components

| ID   | Feature                                                            | Priority |
| ---- | ------------------------------------------------------------------ | -------- |
| F-37 | Soulbound NFT mint (Metaplex Core, non-transferable)               | Must     |
| F-38 | NFT metadata update by admin wallet only                           | Must     |
| F-39 | SHA-256 field hash via Solana Memo per submission                  | Must     |
| F-40 | ZK Proof B: cluster has ≥N validated data points (Light Protocol)  | Should   |
| F-41 | ZK Proof A: verified CO made submission without revealing identity | Could    |
| F-42 | ZK Proof C: ≥80% of data within last 90 days                       | Could    |

---

## 8. Reputation & Trust System

### 8.1 Two Separate Scores — Different Purposes

**Reputation Score (0–100)**

- Starts at 0 for all new Cluster Owners
- **Only increases, never decreases**
- Represents cumulative verified track record
- Increases with validated field submissions and on-time quarterly refreshes
- Think: career seniority — you can't un-earn a track record
- Unlocks: higher reward multiplier + ability to propose additional clusters

**Trust Score (0–100)**

- Starts at **60** for all approved COs (provisionally trusted — they passed admin review)
- Can increase or decrease based on recent performance
- Represents current reliability
- Think: current performance rating — volatile month-to-month
- Controls: submission review priority and cluster visibility to business owners

### 8.2 Reputation Tiers and What They Unlock

| Tier                 | Range  | Cluster Scope                       | Reward Multiplier | Additional Privileges                                                                 |
| -------------------- | ------ | ----------------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| Tier 1 — New         | 0–39   | Manages their approved cluster only | 1× base rate      | Cannot propose additional clusters                                                    |
| Tier 2 — Established | 40–69  | Can propose 1 additional cluster    | 1.3× base rate    | Can submit urgent field updates without pre-approval                                  |
| Tier 3 — Expert      | 70–100 | Can propose up to 3 clusters total  | 1.7× base rate    | "Expert Verified" badge on clusters; can recruit Research Assistants (future feature) |

**Note:** Reputation does NOT gate first cluster ownership. A new CO gets their approved cluster immediately. Reputation only gates additional clusters and reward multipliers.

### 8.3 Trust Score Thresholds

| Range  | Status    | Operational Effect                                 |
| ------ | --------- | -------------------------------------------------- |
| 80–100 | Trusted   | Admin spot-checks 20% of submissions only          |
| 60–79  | Standard  | Normal review flow                                 |
| 40–59  | Caution   | All submissions go to admin review queue (100%)    |
| 20–39  | Warning   | Cluster flagged; CO notified; all submissions held |
| < 20   | Suspended | Cannot submit until admin resolves appeal          |

### 8.4 Trust Score Change Events

| Event                                                       | Change  |
| ----------------------------------------------------------- | ------- |
| 5-star session rating from business owner                   | +2      |
| 4-star session rating                                       | +1      |
| Natural weekly recovery (prevents permanent exclusion)      | +1/week |
| On-time quarterly refresh completed                         | +3      |
| Admin-corrected submission                                  | −2      |
| 1-star or 2-star session rating traced to this CO's cluster | −3      |
| Formally rejected submission (evidenced misinformation)     | −5      |
| Late quarterly refresh (>2 weeks past deadline)             | −2      |

---

## 9. Business Model

### 9.1 Business Owner Pricing

| Tier                    | Price                | Includes                                             | Payment Method                      |
| ----------------------- | -------------------- | ---------------------------------------------------- | ----------------------------------- |
| Free                    | Rp 0                 | 7 free messages per cluster per account              | None                                |
| Pay-per-use             | Rp 400,000 / session | Full 10-section report + 12-hour AI consultation     | IDRX (Phantom) → GoPay/OVO post-MVP |
| Explorer (subscription) | Rp 1,200,000 / month | 4 credits/month, rollover ≤2 unused                  | Same                                |
| Operator (subscription) | Rp 3,000,000 / month | 12 credits/month, priority generation, email support | Same                                |
| Agency                  | Rp 8,000,000 / month | Unlimited credits, API access, white-label reports   | Same                                |

One credit = one session (report + 12-hour window). Credits are non-transferable in MVP.

### 9.2 Cluster Owner Payment Structure

#### Base Rate Per Field (Reputation Tier 1 CO)

| Field Tier    | Field Count | Per Field Rate | Total Milestone Payment                                   |
| ------------- | ----------- | -------------- | --------------------------------------------------------- |
| Tier 1 fields | 20 fields   | Rp 5,000       | **Rp 100,000** (paid when cluster goes Active)            |
| Tier 2 fields | 10 fields   | Rp 8,000       | **Rp 80,000** (paid within 30 days of Tier 2 completion)  |
| Tier 3 fields | 23 fields   | Rp 10,000      | **Rp 230,000** (paid within 30 days of Tier 3 completion) |

#### Reputation Multiplier Applied to Per-Field Rate

| Reputation Tier     | Multiplier | Tier 1 per field | Tier 2 per field | Tier 3 per field | Tier 1 total |
| ------------------- | ---------- | ---------------- | ---------------- | ---------------- | ------------ |
| Tier 1 (Rep 0–39)   | 1.0×       | Rp 5,000         | Rp 8,000         | Rp 10,000        | Rp 100,000   |
| Tier 2 (Rep 40–69)  | 1.3×       | Rp 6,500         | Rp 10,400        | Rp 13,000        | Rp 130,000   |
| Tier 3 (Rep 70–100) | 1.7×       | Rp 8,500         | Rp 13,600        | Rp 17,000        | Rp 170,000   |

#### Complex Field Premium (1.5× multiplier on top of base)

Complex fields require survey collection from 20–30 respondents and qualitative synthesis. They are identified with a "★ Complex" tag in the field catalog and receive 1.5× the standard field rate.

**Complex fields (survey-required):**

- Max willingness to pay by F&B subcategory ★
- Price sensitivity index ★
- Dining occasion split ★
- Digital payment adoption rate ★
- Delivery vs dine-in preference ★
- Social media influence on purchase decisions ★
- Brand loyalty score ★
- Food preference profile ★
- Aesthetic expectation ★
- Halal sensitivity level ★

Example: A Reputation Tier 1 CO submitting "Max willingness to pay" (a Tier 1 Complex field):
`Rp 5,000 × 1.5 (complex) = Rp 7,500 for that single field`

#### Session Revenue Share

### Updated Session Revenue Share

| Reputation Tier     | Previous Rate | New Rate | Per Session (Rp 400K) | Change     |
| ------------------- | ------------- | -------- | --------------------- | ---------- |
| Tier 1 (Rep 0–39)   | 8%            | **5%**   | Rp 20,000             | −Rp 12,000 |
| Tier 2 (Rep 40–69)  | 9%            | **7%**   | Rp 28,000             | −Rp 8,000  |
| Tier 3 (Rep 70–100) | 10%           | **10%**  | Rp 40,000             | No change  |

### Rationale for Change

- Larger gap between tiers (5% vs 10% = 2× difference) creates meaningful incentive to build reputation
- Old design (8% vs 10%) was too small a gap to motivate reputation growth
- Platform gross margin improves for Tier 1 CO sessions: 86.5% → 89.5%
- Tier 3 CO reward unchanged — Expert COs are fully rewarded for proven track record

### Updated Gross Profit Per Session by CO Tier

| CO Tier | Revenue | API Cost | Infra | CO Share     | Gross Profit | Margin |
| ------- | ------- | -------- | ----- | ------------ | ------------ | ------ |
| Tier 1  | Rp 400K | Rp 17K   | Rp 5K | Rp 20K (5%)  | **Rp 358K**  | 89.5%  |
| Tier 2  | Rp 400K | Rp 17K   | Rp 5K | Rp 28K (7%)  | **Rp 350K**  | 87.5%  |
| Tier 3  | Rp 400K | Rp 17K   | Rp 5K | Rp 40K (10%) | **Rp 338K**  | 84.5%  |

Paid monthly, accumulated from all sessions on the CO's cluster(s).

#### Quarterly Refresh Bonus

| Condition                                    | Bonus        |
| -------------------------------------------- | ------------ |
| All Tier 1 + Tier 2 fields refreshed on time | Rp 75,000    |
| Full catalog (all tiers) refreshed on time   | Rp 125,000   |
| Late (7–14 days past deadline)               | 50% of bonus |
| Very late (>14 days)                         | No bonus     |

#### Cluster Owner Community Bonus Pool

Top-performing COs recognized monthly and quarterly:

- Monthly "Top CO" leaderboard in community group (WhatsApp/Telegram)
- Quarterly bonus pool: Rp 1,500,000 split among top 3 COs by:
  - Sessions generated from their cluster (40% weight)
  - Trust score (30% weight)
  - Data completeness and freshness (30% weight)

### 9.3 Respondent Incentivization

Respondents are recruited and managed by the Cluster Owner. LOKAL does not pay respondents directly. The CO is responsible for their own respondent strategy:

**Suggested CO approaches:**

- Small token of appreciation from the CO's own reward (e.g. Rp 5,000 GoPay transfer, free coffee)
- Reciprocal survey exchange within existing community groups
- "Help your neighborhood" community framing — no payment needed if community trust exists
- For student COs: course credit framing (where applicable), or peer goodwill

**Bias prevention requirements (enforced in submission form):**

- Minimum 20 respondents per complex (survey) field
- CO must declare approximate respondent demographic mix: % under 25 / 25–40 / over 40
- CO must declare primary occupation split of respondents
- At least 30% of respondents must NOT be from the CO's primary personal network (e.g. if CO is a student, max 70% respondents can be fellow students)
- Platform flags clusters where demographic mix is too narrow (e.g. 100% students for a working-district cluster)

---

## 10. Cluster Definition

### 10.1 What a Cluster Is

## UPDATE 5 — Cluster Radius: Fixed at 1.5km

### Fixed Radius: 1.5km from Anchor Point

The cluster radius is fixed at **~1.5km from the center of the anchor point**. No range. Not 800m–1.5km. Always 1.5km.

**Rationale:**

- Simple and consistent — no ambiguity when drawing cluster boundaries
- 1.5km is approximately a 15–20 minute walk — the natural limit for F&B destination consideration
- Prevents arbitrary boundary-drawing debates per cluster
- At 1.5km radius: cluster area = π × 1.5² = ~7 km² — appropriate for a commercial corridor
  **Boundary drawn as:** A 1.5km radius circle centered on the anchor point's GPS coordinates, then the CO describes (in text) the commercial streets within that circle that the cluster actually covers. The GeoJSON polygon traces those streets, not a perfect circle.

**Example:**

> Cluster: Jalan Margonda — UI Gate area
> Anchor: UI Gate (main entrance, Jalan Margonda Raya)
> Radius: 1.5km from anchor GPS coordinates
> Coverage area description: "Jalan Margonda Raya from UI Gate heading south to Margo City Mall entrance; including Jalan Kukusan, Jalan Nusantara, and the commercial strip behind Stasiun Depok Baru within the 1.5km boundary."

### 10.2 Anchor Points That Define a Cluster

| Anchor Type             | Examples                                              | Typical Cluster Radius |
| ----------------------- | ----------------------------------------------------- | ---------------------- |
| University gate         | UI gate Depok, UGM gate Yogyakarta, ITS gate Surabaya | ~1.5km                 |
| Major mall              | Margo City, Grand Indonesia, Summarecon Mall Bekasi   | ~1.5km                 |
| Train station (KRL/MRT) | Depok Baru, Dukuh Atas, Lebak Bulus                   | ~1.5km                 |
| Traditional market      | Pasar Santa, Pasar Blok M, Pasar Atom Surabaya        | ~1.5km                 |
| Office district         | SCBD, Sudirman, Gatot Subroto corridor                | ~1.5km                 |
| Residential hub         | BSD Raya Utama, Alam Sutera Boulevard                 | ~1.5km                 |

### 10.3 Correct vs Incorrect Cluster Scoping

| Correct ✓                                   | Incorrect ✗         | Why                                        |
| ------------------------------------------- | ------------------- | ------------------------------------------ |
| "Jalan Margonda — UI Gate to Margo City"    | "Kota Depok"        | City too broad; no behavioral coherence    |
| "Kemang commercial zone, Jalan Kemang Raya" | "Jakarta Selatan"   | Administrative boundary, not catchment     |
| "BSD Raya Utama commercial strip"           | "Kecamatan Serpong" | Kecamatan mixes residential and commercial |
| "Dukuh Atas — Sudirman office corridor"     | "Central Jakarta"   | City too broad                             |

### 10.4 Cluster Metadata Schema

```
cluster_id:              unique slug (e.g. "depok-margonda-001")
cluster_name:            "Jalan Margonda — UI Gate to Margo City"
anchor_point:            "Universitas Indonesia Gate + Margo City Mall"
anchor_type:             University / Mall / Station / Market / Office / Residential
boundaries:              GeoJSON polygon
city:                    "Depok" (administrative reference)
cluster_owner_wallet:    [Solana PublicKey]
created_at:              [timestamp]
last_refreshed_at:       [timestamp]
data_completeness:       0–100 (Tier 1 fields completed / 20 × 100)
confidence_score:        0–100 (weighted avg of field confidence levels)
total_validated_fields:  [count]
status:                  Seeding | Active | Needs Refresh | Deprecated
zk_proof_hash:           [on-chain ZK attestation reference]
```

---

## 11. Detailed Data Field Catalog

### 11.1 Tier 1 Fields — Must Have Before Cluster Goes Active (20 Fields)

These are the minimum required to generate a coherent AI report. The cluster cannot go live without all 20 validated.

**BEHAVIORAL (5 fields)**

| #   | Field Name                                | Type                       | Source Method                  | Complex?  |
| --- | ----------------------------------------- | -------------------------- | ------------------------------ | --------- |
| B1  | Max willingness to pay by F&B subcategory | Quantitative               | Survey (20–30 respondents)     | ★ Complex |
| B2  | Price sensitivity index                   | Quantitative (scale 1–10)  | Survey (20–30 respondents)     | ★ Complex |
| B3  | Peak hours pattern                        | Qualitative + quantitative | Direct observation (3+ visits) | Standard  |
| B4  | Digital payment adoption rate             | Percentage                 | Survey (20–30 respondents)     | ★ Complex |
| B5  | Delivery vs dine-in preference split      | Percentage                 | Survey (20–30 respondents)     | ★ Complex |

**MARKET (5 fields)**

| #   | Field Name                       | Type                     | Source Method                                 | Complex? |
| --- | -------------------------------- | ------------------------ | --------------------------------------------- | -------- |
| M1  | F&B density by subcategory       | Count per zone           | Direct observation (full corridor walk)       | Standard |
| M2  | Average price by F&B subcategory | IDR range                | Direct observation (menu check at 5+ outlets) | Standard |
| M3  | Top 5 local competitors          | Structured profile       | Direct observation + interview                | Standard |
| M4  | Category saturation rating       | High/Medium/Low/Untapped | Observation + judgment                        | Standard |
| M5  | Recent closure case study        | Qualitative narrative    | Interview with locals/neighbors               | Standard |

**DEMOGRAPHIC — SIMPLIFIED (3 fields)**

| #   | Field Name                    | Type                           | Source Method              | Complex?  |
| --- | ----------------------------- | ------------------------------ | -------------------------- | --------- |
| D1  | Age distribution (simplified) | % Under 25 / 25–40 / Over 40   | Survey (20–30 respondents) | ★ Complex |
| D2  | Income bracket distribution   | % Under Rp 3M / 3–7M / Over 7M | Survey (20–30 respondents) | ★ Complex |
| D3  | Primary occupation mix        | Dominant group %               | Survey (20–30 respondents) | ★ Complex |

**MARKET SIGNALS (2 fields)**

| #   | Field Name                        | Type                             | Source Method                       | Complex? |
| --- | --------------------------------- | -------------------------------- | ----------------------------------- | -------- |
| MS1 | Foot traffic estimates            | Peak/off-peak volume description | Direct observation (3 time windows) | Standard |
| MS2 | Market gap / underserved category | Qualitative + evidence           | Observation + local interviews      | Standard |

**CULTURAL & OPERATIONAL (5 fields)**

| #   | Field Name                | Type                        | Source Method                        | Complex?  |
| --- | ------------------------- | --------------------------- | ------------------------------------ | --------- |
| C1  | Halal sensitivity level   | Scale 1–5                   | Survey (20–30 respondents)           | ★ Complex |
| C2  | Trend adoption lag        | Weeks estimate              | Interview with local business owners | Standard  |
| C3  | Dining occasion split     | % Quick/Hangout/Date/Family | Survey (20–30 respondents)           | ★ Complex |
| C4  | Transport access score    | Qualitative + distance      | Direct observation + timing          | Standard  |
| C5  | Anchor points within 500m | List with distance          | Direct observation + maps            | Standard  |

---

### 11.2 Tier 2 Fields — Collect Within First Active Month (10 Fields)

| #   | Field Name                         | Type                               | Source Method                  | Complex?  |
| --- | ---------------------------------- | ---------------------------------- | ------------------------------ | --------- |
| B6  | Brand loyalty score                | Scale 1–10                         | Survey (20–30 respondents)     | ★ Complex |
| B7  | Social media influence on purchase | Percentage                         | Survey (20–30 respondents)     | ★ Complex |
| B8  | Visit frequency                    | Times/week average                 | Survey (20–30 respondents)     | ★ Complex |
| M6  | New opening success rate           | % surviving 12+ months             | Research + local observation   | Standard  |
| M7  | Daily F&B market size estimate     | IDR/day rough estimate             | Calculation from M1 + M2 + MS1 | Standard  |
| I1  | Ojol driver density                | High/Medium/Low by time            | Direct observation             | Standard  |
| I2  | Parking availability               | Capacity description + cost        | Direct observation             | Standard  |
| I3  | Commercial rental per m²           | IDR/m²/month range                 | OLX/Lamudi + landlord inquiry  | Standard  |
| C6  | Food preference profile            | Local/Western, Savory/Sweet, Spice | Survey (20–30 respondents)     | ★ Complex |
| C7  | Community gathering patterns       | Where/when locals socialize        | Interview + local knowledge    | Standard  |

---

### 11.3 Tier 3 Fields — Quarterly Enrichment (23 Additional Fields)

| #   | Field Name                                         | Type                                             |
| --- | -------------------------------------------------- | ------------------------------------------------ |
| D4  | Education level (SMA/D3/S1+)                       | % distribution                                   |
| D5  | Family status                                      | % Single / Married without kids / With kids      |
| D6  | Resident vs commuter detail                        | % and peak commuter hours                        |
| D7  | Digital literacy score                             | Smartphone penetration + app usage               |
| D8  | Population density                                 | People per km² estimate                          |
| B9  | Weekend vs weekday behavioral delta                | Qualitative + quantitative comparison            |
| B10 | Aesthetic expectation (Instagram-able vs function) | Scale 1–5                                        |
| M8  | Price positioning map                              | Distribution: Budget / Mid / Premium             |
| M9  | Customer sentiment on top players                  | What locals love/hate — qualitative              |
| M10 | Key differentiators of winners                     | What top outlets do differently                  |
| M11 | Repeat customer rate estimate                      | % returning customers                            |
| M12 | Rental market signal                               | New lease activity — opportunity proxy           |
| I4  | Pedestrian friendliness score                      | Walkability of main commercial strips            |
| I5  | Internet quality                                   | Average speed (QRIS / digital menu viability)    |
| I6  | Development pipeline                               | Upcoming projects shifting foot traffic          |
| C8  | Seasonal behavior                                  | Ramadan, school year, harvest cycle impact       |
| C9  | Halal certification expectation                    | % expecting visible halal cert display           |
| B11 | Psychological pricing sensitivity                  | Does Rp 49K vs 50K matter?                       |
| M13 | Category success/fail pattern                      | Which concepts historically succeed/fail here    |
| D9  | Foreign/expat presence                             | % and impact on price expectations               |
| I7  | Electricity/utility reliability                    | Relevant for cloud kitchens                      |
| C10 | Religious event impact                             | Specific holidays driving or suppressing traffic |
| M14 | Franchise vs independent preference                | Which consumers prefer — qualitative             |

### 11.4 Additional Information on this Section

## Revised Design: Tier-Based Survey Links

Survey links are grouped by **data tier**, not by respondent type. CO must complete Tier 1 before unlocking Tier 2, and Tier 2 before Tier 3.

| Link               | Name                                | Covers                                                                    | Min Respondents |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------------- | --------------- |
| Tier 1 Survey Link | Local Consumer Insights — Essential | All survey-required fields in Tier 1 (B1, B2, B4, B5, C1, C3, D1, D2, D3) | 30              |
| Tier 2 Survey Link | Local Consumer Insights — Extended  | All survey-required fields in Tier 2 (B6, B7, B8, C6, C7)                 | 30              |
| Tier 3 Survey Link | Local Consumer Insights — Deep Dive | All survey-required fields in Tier 3 (B9, B10, B11, C8, M14, D5, D6, D9)  | 20              |

### Important: Survey Links Only Cover Survey Fields

**Not all fields require a survey link.** Each tier has two types of fields:

- **Survey fields** → collected via the tier's survey link (respondent answers)
- **Observation fields** → submitted directly by CO (CO goes out and observes/records)
  Both types must be completed before the next tier unlocks.

**Tier 1 survey fields (need Link 1):** B1, B2, B4, B5, C1, C3, D1, D2, D3
**Tier 1 observation fields (CO submits directly):** B3, M1, M2, M3, M4, M5, MS1, MS2, C4, C5

The survey link for Tier 1 is pre-built by LOKAL. CO does not design the survey — they only receive and distribute the link.

### Sequential Unlock Rules

```
Cluster lifecycle:

START → CO distributes Tier 1 Survey Link to 30+ respondents
         + CO submits Tier 1 observation fields directly

         ↓ All Tier 1 fields validated (survey + observation)

         → Tier 2 Survey Link unlocks
         → CO distributes Tier 2 Survey Link to 30+ respondents
         + CO submits Tier 2 observation fields

         ↓ All Tier 2 fields validated

         → Tier 3 Survey Link unlocks (quarterly enrichment cycle)

MINIMUM TO GO ACTIVE: Tier 1 fully complete
```

### 2-Layer Review Process

**Layer 1 — CO reviews raw respondent answers:**

- CO logs into LOKAL dashboard and sees all individual survey responses
- CO can flag or delete responses that are clearly invalid:
  - Duplicate submissions from same person
  - Nonsensical answers (e.g. "Rp 1" for willingness to pay)
  - Respondents who clearly don't know the area
- After CO cleanup: CO submits the cleaned response set to LOKAL
  **Layer 2 — AI outlier detection:**
- System automatically calculates distribution of submitted answers
- Flags statistical outliers (>2 standard deviations from median)
- Flags geographic implausibility (respondent claims to visit area but answers inconsistently)
- Admin ONLY reviews flagged items — not all submissions
- Target: admin reviews <15% of total submissions

### Survey Link Technical Spec

```
URL structure:  lokal.id/survey/{cluster_id}/tier{1|2|3}
Language:       Bahasa Indonesia only (respondent-facing)
Format:         Mobile-optimized, WhatsApp-shareable
Completion time: ~4 minutes (Tier 1), ~3 minutes (Tier 2), ~3 minutes (Tier 3)
Auth:           None — anonymous respondent, no login required
Duplicate guard: Device fingerprint — prevents same device submitting twice
Expiry:         30 days per collection cycle; resets on quarterly refresh
Storage:        Individual responses stored temporarily for CO review;
                deleted after CO submits cleaned set to LOKAL
                LOKAL's permanent storage = aggregated field values only (no PII)
```

---

## UPDATE 3 — Respondent Survey Question Format (Simplified)

**Add as:** New subsection inside Section 11A, after the survey link technical spec

### Principle: Human Language for Respondents

Respondents are regular locals — students, workers, residents. They cannot answer "Rate price sensitivity index on a scale of 1-10." Questions must use everyday Bahasa Indonesia with simple answer options. The platform converts their simple answers into structured field values automatically.

### Example Question Rewrites

| Field                                | Original (technical)                      | Simplified for Respondents                                                                                                                                              |
| ------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 — Max willingness to pay (coffee) | "Maximum IDR amount for coffee/beverages" | "Paling mahal berapa kamu mau bayar buat segelas kopi di sini? Pilih yang paling cocok:" → pilihan: < Rp 15K / Rp 15-25K / Rp 25-35K / Rp 35-50K / > Rp 50K             |
| B2 — Price sensitivity               | "Price sensitivity index 1-10"            | "Kalau harga naik Rp 5.000, kamu bakal gimana?" → Tetap beli / Mungkin masih beli / Cari tempat lain / Pasti cari yang lebih murah                                      |
| B4 — Digital payment adoption        | "% using QRIS/GoPay/OVO regularly"        | "Kamu biasanya bayar pakai apa kalau beli makan/minum di sini?" → GoPay/OVO/Dana / QRIS / Kartu / Tunai / Campuran                                                      |
| C1 — Halal sensitivity               | "Halal sensitivity scale 1-5"             | "Seberapa penting buat kamu bahwa tempat makan punya sertifikat halal?" → Sangat penting / Penting / Biasa aja / Nggak terlalu penting / Nggak penting                  |
| D1 — Age distribution                | "Age bracket"                             | "Kamu masuk kelompok usia mana?" → Di bawah 25 / 25–35 / 36–45 / Di atas 45                                                                                             |
| B6 — Brand loyalty                   | "Brand loyalty score"                     | "Kalau ada tempat makan/minum yang lebih murah buka dekat sini, kamu bakal pindah?" → Pasti pindah / Mungkin coba dulu / Tergantung kualitasnya / Tetap di tempat biasa |

### How Platform Converts Answers to Field Values

Example: Field B1 (Coffee price ceiling)

- Respondent answers are bucketed: 4 chose <Rp 15K, 8 chose Rp 15-25K, 14 chose Rp 25-35K, 4 chose Rp 35-50K, 0 chose >Rp 50K (n=30)
- Platform calculates: mode = Rp 25-35K; 60% in this range or lower
- CO sees this distribution, confirms it matches observations
- CO submits field B1 value: "Coffee/Beverage: Rp 22,000–32,000 (60th percentile ceiling Rp 30,000)"
- This structured value goes into the cluster database

---

## UPDATE 5 — Session Revenue Share

**Replace in:** Section 9.2 (Cluster Owner Payment Structure — Session Revenue Share table)

---

---

## 12. AI & Report Architecture

### 12.1 AI System Design

**Base model:** Claude Sonnet (Anthropic API — `claude-sonnet-4-20250514`)

**Architecture:** RAG (Retrieval-Augmented Generation)

- All validated cluster fields are embedded and stored in a vector database (Supabase pgvector or Pinecone)
- When a business owner pays and submits their concept form, the system retrieves the most relevant field embeddings for their concept type and cluster
- These retrieved facts are injected into the Claude system prompt as structured context
- Claude generates the report and consultation responses grounded exclusively in retrieved cluster data

**System prompt structure:**

```
You are LOKAL's hyperlocal market consultant for [cluster_name].
You have verified, local research data about this specific area.

CLUSTER DATA (verified, last updated [date]):
[retrieved field values, formatted per field type]

USER CONCEPT:
- Subcategory: [F&B type]
- Concept: [name + description]
- Price targets: [menu items + planned prices]
- Target customer: [description]
- Specific questions: [if provided]

INSTRUCTIONS:
- Answer ONLY from the cluster data provided above
- When data is insufficient to answer confidently, say so explicitly
- Quantify all recommendations with specific IDR ranges from the data
- Flag high-risk pricing decisions (items >30% above price ceiling)
- Never give generic Indonesia-wide advice — all advice must be cluster-specific
```

**Free tier system prompt:** Cluster data without user concept context. General questions about the area. Cannot generate full report.

**Paid tier system prompt:** Full cluster data + user concept + menu + price targets. Full report generation enabled.

### 12.2 Report Generation Pipeline

```
1. Payment confirmed (IDRX transfer detected)
2. Concept form data ingested
3. Vector similarity search: retrieve top-N relevant field embeddings for concept type
4. Per-product price analysis: compare each menu item vs cluster price ceiling + sensitivity cliff
5. Claude generates all 10 report sections in sequence
6. Report structured and formatted into HTML template
7. PDF generated via Puppeteer/similar → stored in Cloudflare R2
8. Report delivered to user (link + inline render)
9. 12-hour consultation window opens with full context loaded
```

Target generation time: 30–60 seconds. Async via BullMQ queue to prevent API timeout.

### 12.3 Full Report — 10 Sections

**Section 1: Executive Cluster Summary**

- Cluster ID, geographic bounds, data freshness date
- Overall confidence score (0–100) displayed prominently — data completeness × source quality weighted average
- Top 3 opportunities for their specific concept in this cluster
- Top 3 risks for their specific concept in this cluster
- Market readiness score (1–10) for their concept in this cluster
- AI confidence disclaimer — what it's most and least certain about

**Section 2: Customer Profile**

- Primary persona (name, age bracket, income, occupation, key behavior patterns)
- Secondary persona (10–15% of market)
- Price ceiling by F&B subcategory — the most critical single data point
- Decision drivers ranked by influence: taste, price, convenience, aesthetics, brand, social proof
- Digital readiness score (affects QRIS, digital menu, delivery-first viability)

**Section 3: Market Sizing**

- Total addressable customers in cluster
- Estimated daily F&B market size (IDR)
- Serviceable market for their specific concept type
- Peak opportunity windows by hour, day, and season

**Section 4: Competitive Landscape**

- Saturation index by F&B subcategory (visual: High / Medium / Low / Untapped)
- Direct competitors if user opens their concept here
- Indirect competitors (substitute categories)
- White space map — missing or underserved categories with evidence of demand
- Competitive moat recommendations specific to this cluster

**Section 5: Location Intelligence**

- Recommended micro-zones within the cluster (specific streets and intersections)
- Foot traffic description by time of day and day of week
- Anchor point analysis — which landmarks drive traffic and when
- Accessibility scoring
- Avoid zones with specific reasoning (not just "low traffic" — explain why that particular spot underperforms)

**Section 6: Pricing Strategy**

- Recommended price range for their specific concept with reasoning
- Price sensitivity cliff analysis — the exact price point where demand drops sharply
- Per-product analysis: each menu item flagged as Safe / Caution / High Risk vs cluster data
- Competitor price benchmarking with visual positioning
- Psychological pricing recommendations (does Rp 49K vs Rp 50K matter in this cluster?)
- Margin simulation at recommended prices given estimated local ingredient/rental costs

**Section 7: Product-Market Fit Simulation**

- Concept fit score (1–10) with specific reasoning for this cluster
- Menu recommendations based on local taste and preference data
- What to avoid based on historical failure patterns in this cluster
- Local adaptation suggestions (modifications that improve fit)
- Format recommendation: dine-in / take-away / delivery-first / hybrid — based on behavioral data

**Section 8: Go-to-Market Playbook**

- Opening strategy: soft vs hard launch with cluster-specific reasoning
- Marketing channels that actually work in this cluster (TikTok, RT/RW networks, mosque community, ojol driver partnerships, campus group chats — cluster-specific)
- Community activation tactics specific to this area
- First 30/60/90 day milestones
- 2–3 KPIs that matter most for this concept in this cluster

**Section 9: Risk Register**

- Top 5 risks with likelihood × impact matrix
- Mitigation strategy per risk — specific actions, not generic advice
- Red flags: conditions under which you should NOT open here
- Competitor response scenarios if user takes 10% market share
- Regulatory or zoning flags if any

**Section 10: Financial Scenario Modeling**

- Month 1–6 revenue projections: Optimistic / Base / Pessimistic
- Break-even analysis in units sold and time
- Key assumptions per scenario — fully listed
- Sensitivity analysis: which single assumption, if wrong, kills the model fastest
- Generated from structured data template (consistent, not free-form AI text)

---

## 13. Non-Functional Requirements

### 13.1 Performance

| Requirement                        | Target                           |
| ---------------------------------- | -------------------------------- |
| Free chat AI response time         | < 3 seconds per message          |
| Report generation time             | < 60 seconds                     |
| Page load time (P95)               | < 2 seconds                      |
| Solana transaction confirmation    | < 5 seconds                      |
| Concurrent paid sessions supported | ≥ 50 (MVP) → ≥ 500 (post-launch) |

### 13.2 Reliability

- Uptime: 99.5% (MVP) → 99.9% (post-launch)
- AI API fallback: if Anthropic API fails, queue request and notify user with ETA
- Solana RPC: Helius or QuickNode — never public endpoint for production
- Report PDFs cached immediately after generation; re-downloadable for 30 days

### 13.3 Security

- CO evidence (photos, screenshots): stored in Cloudflare R2 with private access
- Admin dashboard: 2FA required, role-based access control
- No raw respondent data stored — CO submits aggregated field values only
- Solana private keys: never stored by platform — users sign via their own wallet

### 13.4 Data Privacy

- Business owner concept data (menu, pricing, concept name): NOT used to improve AI for other users
- Cluster Owner identity: NOT exposed to business owners
- Respondent demographic data: stored as aggregate percentages only — no individual PII

### 13.5 Localization

- Primary language: Bahasa Indonesia
- Secondary language: English (for hackathon demo and international judges)
- All currency displayed as IDR (Rp) — IDRX displayed as Rp to business owners

---

## 14. MVP Scope & Hackathon Strategy

### 14.1 What Must Be in the Demo

| Feature                                              | Rationale                                             |
| ---------------------------------------------------- | ----------------------------------------------------- |
| 1 active cluster (Jalan Margonda, Depok)             | Real data, real story, real anchor                    |
| Free chat with 7-message limit and conversion prompt | Core monetization funnel                              |
| Concept form with menu builder                       | Personalizes the report                               |
| IDRX payment via Phantom (end-to-end, no bugs)       | Must work live in front of judges                     |
| Minimum Section 2 + Section 6 of report              | Customer Profile + Pricing Strategy are highest-value |
| SHA-256 field hash on Solana — visible on Explorer   | Proves blockchain is real, not decorative             |
| Soulbound NFT in CO wallet with metadata             | Visible credential — the trust layer                  |

### 14.2 Strong Differentiators (Build If Possible)

| Feature                                               | Score Impact                               |
| ----------------------------------------------------- | ------------------------------------------ |
| ZK Proof B (data density attestation, Light Protocol) | +3–5 points on Tech Feasibility            |
| All 10 report sections                                | Completes the product vision story         |
| CO cluster dashboard                                  | Completes the two-sided platform narrative |

### 14.3 Explicitly Out of Scope for Hackathon

- GoPay/fiat on-ramp (mention as production plan in pitch — explain HOW it solves the crypto barrier)
- Multiple clusters — all energy on one excellent cluster with real data
- ZK Proof A and C — architecture slides only
- Subscription tiers — mention in pitch deck, not in demo
- CO community leaderboard — roadmap slide

### 14.4 Demo Script (3 Minutes)

**Minute 1 — The Problem (30 seconds)**

> "Our uncle opened a premium matcha café in Depok. Price: Rp 50,000. He saw matcha going viral on TikTok in Jakarta, felt the opportunity, felt confident. 4 months later: permanently closed. The Depok market's price ceiling for this category is Rp 28,000. He didn't know. No tool existed to tell him."

**Minute 2 — The Solution (90 seconds)**

> Live: Open LOKAL → browse to Jalan Margonda cluster → show ZK data density badge and confidence score → enter free chat → ask "Is a premium matcha concept viable here?" → AI gives specific, data-grounded answer → hit message 7 → conversion modal → fill concept form (matcha café + Rp 50K Signature Matcha on menu) → pay 400K IDRX in Phantom → report generates.

> Pause on Pricing Strategy section: "Your Signature Matcha at Rp 50,000 is 79% above this cluster's price ceiling for this category. High failure risk. Recommend: Rp 27,000–30,000."

> "This is what would have saved the uncle."

**Minute 3 — The Trust Layer (60 seconds)**

> "Every number in that report comes from a verified local who lives and works there."
> Show Solana Explorer → data hash transaction. "No one — not even us — can silently change this."

> Show soulbound NFT in Phantom wallet. "Every Cluster Owner is credentialed. Their reputation is on-chain. Non-transferable. They can't sell it."

> Show ZK proof badge. "Users verify data quality before spending Rp 400,000. We prove the data is good — without exposing what the data actually says."

> Close: "60 to 90% of Indonesian F&B businesses fail in their first year. Most of them had a Rp 50,000 matcha problem. **Simulate before you operate.**"

### 14.5 Hackathon Score Estimate

| Criterion            | Weight | Score (without ZK) | Score (with ZK) | Weighted (with ZK) |
| -------------------- | ------ | ------------------ | --------------- | ------------------ |
| Impact Potential     | 35%    | 88                 | 88              | 30.8               |
| Tech Feasibility     | 25%    | 74                 | 85              | 21.25              |
| Innovation           | 20%    | 83                 | 86              | 17.2               |
| Business Feasibility | 20%    | 80                 | 82              | 16.4               |
| **Total**            |        | **81.9**           | **85.65**       | **85.65**          |

**To push toward 88–89:**

1. ZK Proof B working in demo (single biggest lever)
2. GitHub repo: clean README, Anchor program compiles and deploys on devnet
3. Pitch deck month-1 plan: "One cluster, 10 paying sessions, Rp 4M revenue" — not year-3 projections
4. Explicitly address the crypto barrier in pitch: "We know business owners don't have wallets — here's the GoPay on-ramp plan for production"

---

## 15. Risks, Assumptions & Dependencies

### 15.1 Risk Register

| Risk                                              | Likelihood | Impact | Mitigation                                                                                       |
| ------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------ |
| First cluster has thin/low-quality data for demo  | High       | High   | Team manually seeds Margonda data before demo day using direct observation                       |
| CO submits biased data (single demographic group) | Medium     | High   | Demographic mix declaration required in submission form; platform flags imbalanced clusters      |
| Business owners lack Phantom wallets              | High       | High   | Hackathon: acceptable. Production: GoPay on-ramp stated explicitly in pitch                      |
| AI gives wrong advice from thin data              | Medium     | High   | Confidence score + disclaimer on every report; feedback loop traces poor advice to source fields |
| Data goes stale between quarterly refreshes       | Medium     | Medium | Freshness indicator shown; urgent flag mechanism for major local changes                         |
| ZK implementation too complex for hackathon       | High       | Medium | Proof B as priority; partial demo acceptable; architecture slide for A and C                     |
| CO loses motivation before cluster goes Active    | Medium     | Medium | Clear payment milestones; 48hr admin review SLA; community group support                         |

### 15.2 Assumptions

- IDRX available on Solana devnet for testing (or simulated with test tokens)
- Anthropic Claude API access available and sufficient for hackathon load
- Jalan Margonda cluster can be seeded with real data by the team before demo day
- Hackathon judges will have or use Phantom wallet for the live demo payment
- At least one team member has Anchor/Solana smart contract experience

### 15.3 Dependencies

| Dependency                    | Risk if Unavailable                     |
| ----------------------------- | --------------------------------------- |
| Anthropic Claude API          | Core AI feature fails — critical        |
| Helius/QuickNode Solana RPC   | Demo transactions unreliable            |
| IDRX on Solana devnet         | Mock payment for hackathon              |
| Metaplex Core (soulbound NFT) | Fallback: basic SPL NFT                 |
| Light Protocol (ZK proofs)    | Drop ZK demo; architecture slide only   |
| Supabase (DB + pgvector)      | Fallback: Railway PostgreSQL + Pinecone |

---

## 16. Technical Stack

### Frontend

- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Wallet: Solana Wallet Adapter (Phantom, Backpack)
- Maps: Mapbox GL JS (cluster boundary visualization)
- State: Zustand

### Backend

- Runtime: Node.js (Next.js API routes)
- Database: PostgreSQL (Supabase)
- Vector DB: Supabase pgvector or Pinecone
- AI: Anthropic Claude API (`claude-sonnet-4-20250514`)
- RAG pipeline: LangChain or custom retrieval
- Queue: BullMQ (async report generation)
- File storage: Cloudflare R2 (report PDFs, CO evidence)

### Blockchain (Solana)

- Network: Devnet (hackathon) → Mainnet (production)
- Smart contracts: Anchor framework (Rust)
- Programs: (1) Data provenance — field hash + Memo anchoring; (2) NFT — soulbound CO credential via Metaplex Core
- RPC: Helius or QuickNode
- IDRX: existing SPL token (no custom mint)
- ZK: Light Protocol (post-MVP or hackathon stretch)

---

## 16. Appendix and Additional Information

# UPDATE 6 — Platform Recommendations for Data & Respondents

**Add as:** New Section — "Useful External Platforms" (can go in Appendix or after Section 10)

### Platforms for Cluster Owners and LOKAL Team

**For Respondent Recruitment (when CO's network is insufficient):**

| Platform            | Type                                                       | Pricing                                                | Use Case                                                                 |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| Populix / PopSurvey | Indonesian consumer panel (250K+ KTP-verified respondents) | From Rp 30K for 30 resp / 2Q; full survey ~Rp 150–250K | Primary backup for CO respondent recruitment; location-targetable        |
| Jakpat              | Indonesian mobile survey panel                             | From Rp 5,000/respondent/1–5Q                          | Real-time responses; good for urban areas; location + demographic filter |

**For Observation Field Cross-Checking:**

| Platform              | What It Provides                                                        | How to Use                                                               |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| GoFood (gofood.co.id) | Active F&B listings per area, menu prices, reviews                      | Admin cross-checks M2 (competitor pricing) and M3 (competitor existence) |
| GrabFood              | Same as GoFood; overlapping but different listing set                   | Use alongside GoFood for full competitive picture                        |
| Google Maps           | Outlet locations, operating hours, foot traffic heatmap (Popular Times) | Admin verifies M1 (density), C5 (anchor points), C4 (transport distance) |
| BPS (bps.go.id)       | Demographic baseline data by kelurahan/kecamatan                        | Cross-check D1, D2, D3 field submissions for plausibility                |

**For Public Market Data (supplementing CO observation):**

| Platform                                    | What It Provides                                                |
| ------------------------------------------- | --------------------------------------------------------------- |
| GoodStats (goodstats.id)                    | Compiled Indonesian market data across industries, well-sourced |
| Katadata (katadata.co.id)                   | Indonesian economic and business data, F&B industry coverage    |
| BPS Food & Beverage Report 2023 (bps.go.id) | Official government F&B business census data by province        |
| Euromonitor / CRIF Asia                     | F&B market sizing data — use for PRD and pitch deck sources     |

---

## 17. Glossary

| Term               | Definition                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Cluster            | A hyperlocal commercial catchment zone defined by walking distance to an anchor point, not administrative boundaries |
| Cluster Owner (CO) | The vetted local expert who owns and is accountable for all data in one cluster                                      |
| IDRX               | Regulated stablecoin pegged 1:1 to Indonesian Rupiah, live on Solana                                                 |
| Soulbound NFT      | Non-transferable NFT credential issued to verified COs on Solana                                                     |
| Reputation Score   | Cumulative track record (0–100), only increases, unlocks reward multipliers                                          |
| Trust Score        | Current reliability (0–100), fluctuates, controls submission review priority                                         |
| Complex Field      | A data field requiring survey collection from 20–30 respondents; receives 1.5× field rate                            |
| Session            | One 12-hour AI consultation window + full report, unlocked by 400,000 IDRX                                           |
| Tier 1 Fields      | 20 priority fields required before a cluster goes Active                                                             |
| RAG                | Retrieval-Augmented Generation — AI responses grounded in retrieved cluster data                                     |
| ZK Proof           | Zero-knowledge proof — proves a fact about cluster data without revealing the data itself                            |
| Price Ceiling      | The maximum price point this cluster's market will accept for a given F&B subcategory                                |
| Confidence Score   | 0–100 metric reflecting data completeness and source quality for a cluster                                           |

---

## 18. Revision Log

| Version | Date       | Changes                                                                                                                                                                                                                  |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0.1     | April 2025 | Initial brainstorm and problem framing                                                                                                                                                                                   |
| 0.2     | April 2025 | Blockchain architecture, ZK design                                                                                                                                                                                       |
| 0.3     | April 2025 | Redesigned CM role → Cluster Owner; new reputation system                                                                                                                                                                |
| 0.4     | April 2025 | Narrowed to F&B niche; concept form with menu builder                                                                                                                                                                    |
| 1.0     | April 2025 | Full PRD with market data, unit economics, user flows                                                                                                                                                                    |
| 2.0     | April 2025 | Added: Reputation & Trust System, Business Model with detailed payment tables, Cluster Definition, Full Data Field Catalog (Tier 1/2/3), AI & Report Architecture, respondent incentivization, complex field definitions |
| 3.0     | May 2025   | Added: Survey system with per-field CO review, Vault mechanism (8% revenue share to respondents), CO withdrawal with 2% platform fee, TipLink wallet integration, two demo clusters (Margonda + BSD Serpong)            |

---

## 19. Survey System (v3.0)

### 19.1 Overview

LOKAL's survey system enables Cluster Owners to collect field data from local respondents via a shareable form link. The system is designed for mobile-first, low-friction data collection with wallet-based reward distribution.

### 19.2 Survey Flow

```
CO generates survey link → Shares via WhatsApp/social
    ↓
Respondent opens link → Connects wallet (Phantom or TipLink Gmail)
    ↓
Fills 15 survey fields across 5 categories → Submits
    ↓
CO reviews per field from /co/survey-responses → Approves/rejects with reason
    ↓
Admin validates approved fields → Field hash anchored on Solana
    ↓
Vault allocation when BO pays → Respondents earn IDRX rewards
```

### 19.3 Survey Fields (15 fields, 5 categories)

| Category | Fields | Question Style |
|----------|--------|----------------|
| **Data Diri** (Demographic) | D1, D2, D3 | Simple select options |
| **Kebiasaan** (Behavioural) | B1, B2, B3, B4, B5 | Category prices, scales, multi-select |
| **Pasar** (Market) | M2, M3 | Category dropdown + price, text list |
| **Sinyal Pasar** (Market Signals) | MS1, MS2 | Select, free text |
| **Budaya & Akses** (Cultural) | C1, C3, C4 | Scale, multi-select, select |

### 19.4 Wallet Connection for Respondents

Respondents must connect a wallet before submitting:

- **Phantom** — Standard Solana wallet for crypto-native users
- **TipLink** — Email-based wallet creation (Gmail → auto-creates Solana wallet, respondent doesn't need to understand crypto)

### 19.5 CO Review Process

CO reviews responses **per field** (not per respondent):

- View all responses for a specific field (e.g., all D1 answers)
- Approve or reject individual responses with reason
- Bulk accept for specific fields (D1-D3, B2, B4, B5, C1, C3)
- Rejection threshold: >15% triggers admin audit

### 19.6 CO Rejection Constraints

| Rule | Enforcement |
|------|-------------|
| Must provide rejection reason | Required field when rejecting |
| Cannot reject >15% without admin audit | Flagging system warns CO |
| All raw responses stored | Even rejected ones visible to admin |
| CO decisions are auditable | Admin can override CO rejections |

---

## 20. Vault Mechanism (v3.0)

### 20.1 Overview

The vault is a per-cluster reward pool funded by 8% of every BO session payment. It distributes IDRX proportionally to respondents based on their approved field contributions.

### 20.2 Revenue Distribution Per Session

| Recipient | Amount | Rate |
|-----------|--------|------|
| Platform | Rp 340,000-360,000 | 85-90% |
| CO (tiered) | Rp 20,000-40,000 | 5-10% based on reputation |
| **Respondent Vault** | **Rp 32,000** | **8% (fixed)** |

### 20.3 Vault Distribution Formula

```
respondent_reward = (vault_allocation / total_approved_fields) × respondent_approved_fields
```

**Example:**
- Vault allocation: 32,000 IDRX
- Total approved fields across all respondents: 50
- Respondent A contributed 5 approved fields
- Respondent A's reward: (32,000 / 50) × 5 = 3,200 IDRX

### 20.4 Withdrawal Mechanics

| Parameter | Value |
|-----------|-------|
| Minimum withdrawal | 10,000 IDRX |
| Platform fee | 0% (respondents) |
| CO withdrawal fee | 2% |
| Withdrawal method | On-chain IDRX transfer |
| Distribution | Cumulative across multiple BO sessions |

### 20.5 CO Withdrawal

COs can withdraw their earnings from `/co/earnings`:

- Earnings accumulate from session revenue share (5%/7%/10% based on tier)
- 2% platform fee on withdrawal
- Minimum withdrawal: 10,000 IDRX
- On-chain IDRX transfer to CO's wallet

---

## 21. Two Demo Clusters (v3.0)

| Cluster | Location | Anchor | Character |
|---------|----------|--------|-----------|
| **Jalan Margonda** | Depok | UI Gate + Margo City | Student-dominated, price-sensitive |
| **The Breeze BSD** | Tangerang | The Breeze BSD City | Affluent professionals, higher spending |

Both clusters are pre-seeded with 20 Tier 1 fields each, providing contrast for the demo.

---

_LOKAL — "Simulate before you operate."_
_Superteam Indonesia — National Campus Hackathon — Frontier Colosseum 2025_
