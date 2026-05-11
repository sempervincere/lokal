# LOKAL

> Hyperlocal F&B market intelligence — verified on Solana, powered by AI.

LOKAL solves a real problem: F&B entrepreneurs in Indonesia lose capital opening in the wrong location because they lack reliable local data. LOKAL fixes this by deploying on-the-ground data collectors who anchor verified market data on Solana, making it tamper-proof and queryable via AI.

Built for [Colosseum Frontier Hackathon 2025](https://colosseum.org).

---

## How It Works

**Business Owner (BO)** — wants to open an F&B outlet. Pays per AI consultation session (in IDRX) to ask specific questions: *"What's the price ceiling for coffee in this area? How many competitors? What's the foot traffic like?"*

**Cluster Owner (CO)** — boots on the ground. Collects field data (prices, traffic, competitors) in a designated area, submits to the platform, earns a share of IDRX revenue each time their data is consumed.

**On-chain verification** — each field data entry is SHA-256 hashed and anchored to Solana via a Memo instruction. Immutable proof that data existed and was verified at a specific timestamp. CO credentials are minted as soulbound NFTs (Metaplex Core) — non-transferable, revocable by platform only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Supabase |
| ORM | Prisma v7 with PrismaPg adapter |
| Auth | Supabase Auth (Email + Google OAuth + Wallet) |
| Blockchain | Solana Devnet via Helius RPC |
| On-chain Program | Anchor 0.30+ (Rust) — field hash anchoring |
| NFT | Metaplex Core (soulbound CO credential) |
| Payment Token | IDRX (SPL token, Indonesian Rupiah stablecoin, 6 decimals) |
| AI | Anthropic Claude (streaming) |
| Webhooks | Helius — detects IDRX payments on-chain, unlocks sessions |

---

## On-Chain Program

**Program ID:** `4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ` (Solana Devnet)

Two instructions:

| Instruction | What it does |
|---|---|
| `initialize_cluster` | Creates a PDA-based `ClusterRecord` account for a geographic cluster |
| `anchor_field_hash` | Writes `LOKAL\|<slug>\|<field_code>\|<sha256>\|<timestamp>` into a Memo instruction — immutable on-chain proof |

The program verifies the caller is the cluster authority before anchoring. Each anchoring increments a `validated_field_count` on the cluster account.

---

## Project Structure

```
LOKAL/
├── anchor/                          # Anchor program (Rust)
│   └── programs/lokal-core/src/
│       ├── lib.rs                   # Program entrypoint, declare_id!
│       ├── state.rs                 # ClusterRecord account schema
│       ├── instructions/
│       │   ├── initialize_cluster.rs
│       │   └── anchor_field_hash.rs
│       └── error.rs
├── prisma/
│   ├── schema.prisma                # Database schema (source of truth)
│   └── seed.ts
├── scripts/
│   ├── seed-margonda.ts             # Seeds Margonda cluster (idempotent)
│   ├── seed-bsd-serpong.ts          # Seeds BSD Serpong cluster
│   ├── mint-co-nft.ts               # Mints CO soulbound credential NFT
│   └── mint-demo-co.ts
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Login, register, OAuth callback
│   │   ├── (co)/co/                 # Cluster Owner dashboard
│   │   ├── (public)/                # Landing page
│   │   ├── admin/                   # Admin panel
│   │   └── api/                     # All API routes
│   ├── lib/
│   │   ├── prisma.ts                # Singleton Prisma client
│   │   ├── solana/                  # Anchor client, IDRX transfer, NFT mint
│   │   └── supabase/                # Server + client helpers
│   └── middleware.ts                # Session refresh + route protection
└── docs/                            # PRD, TDD, setup guide
```

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (via Supabase or local)
- Solana CLI + Anchor 0.30+
- A Helius account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/your-username/lokal.git
cd lokal
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

# Helius (Solana RPC + Webhooks)
HELIUS_RPC_URL=
NEXT_PUBLIC_HELIUS_RPC_URL=
HELIUS_API_KEY=
HELIUS_WEBHOOK_SECRET=

# IDRX Token + Platform Wallet
NEXT_PUBLIC_IDRX_MINT_ADDRESS=
IDRX_MINT_ADDRESS=
NEXT_PUBLIC_PLATFORM_WALLET=
PLATFORM_KEYPAIR=    # JSON array of secret key bytes — server-side only

# Program
NEXT_PUBLIC_LOKAL_CORE_PROGRAM_ID=4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI
ANTHROPIC_API_KEY=
```

### 3. Push database schema

```bash
npx tsx node_modules/.bin/prisma db push --config prisma.config.ts
```

### 4. Seed cluster data

```bash
npx tsx scripts/seed-margonda.ts
npx tsx scripts/seed-bsd-serpong.ts
```

### 5. Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Scripts

| Command | Purpose |
|---|---|
| `npx tsx scripts/seed-margonda.ts` | Seed Margonda Depok cluster (idempotent) |
| `npx tsx scripts/seed-bsd-serpong.ts` | Seed BSD Serpong cluster |
| `npx tsx scripts/mint-co-nft.ts` | Mint soulbound NFT credential for a CO |
| `npx tsx scripts/clear-user-sessions.ts` | Clear all sessions for a specific user |
| `npx tsx scripts/verify-state.ts` | Verify on-chain cluster state |

---

## API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/clusters` | GET | Public | List active clusters |
| `/api/waitlist` | POST | Public | Join waitlist |
| `/api/sessions` | POST | BO | Create a new paid consultation session |
| `/api/chat` | POST | BO | Free AI chat (up to 7 messages) |
| `/api/chat/paid` | POST | BO | Paid session AI chat (streaming) |
| `/api/co/earnings` | GET | CO | Earnings history and total |
| `/api/co/withdraw` | POST | CO | Withdraw IDRX to wallet (2% platform fee) |
| `/api/co/fields` | GET/POST | CO | Submit and view field data |
| `/api/webhooks/helius` | POST | HMAC | Confirm IDRX payment, unlock session |
| `/api/admin/users` | GET | Admin | User management |
| `/api/admin/clusters` | GET/POST | Admin | Cluster management |

---

## Database Model

```
User ──→ Session ──→ Message
                └──→ Report
                └──→ ConceptForm

User ──→ ClusterOwner ──→ Cluster ──→ ClusterFieldValue
                     └──→ CoEarning

WaitlistSubmission (standalone)
```

---

## Payment Flow

1. BO selects cluster → creates session via `/api/sessions` → receives IDRX transfer address
2. BO sends IDRX from their wallet to platform wallet
3. Helius webhook fires → `/api/webhooks/helius` validates with `timingSafeEqual` → marks session as `PAYMENT_CONFIRMED`
4. BO can now use paid AI chat
5. CO earns a share → withdraws via `/api/co/withdraw` (2% platform fee, minimum 10,000 IDRX)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all env vars under Settings → Environment Variables
4. Update Supabase Site URL to your Vercel domain
5. Update Google OAuth redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Update Helius webhook URL: `https://your-vercel-app.vercel.app/api/webhooks/helius?secret=YOUR_SECRET`

---

## Security

- Helius webhook validated with `crypto.timingSafeEqual` (timing-attack resistant)
- `PLATFORM_KEYPAIR` is server-side only — never exposed to client
- All CO and admin routes double-protected: middleware redirect + role check in each handler
- Withdrawal marks specific earning IDs as paid to prevent double-spend on concurrent requests
- Replay protection on webhooks: signature checked against existing sessions before processing

---

## License

MIT — free to use, modify, and distribute.

---

Built for Superteam Indonesia · Frontier Colosseum 2025.
