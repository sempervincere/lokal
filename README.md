# LOKAL

Data lapangan F&B, terverifikasi blockchain, untuk pengusaha yang tidak mau rugi modal di lokasi yang salah.

---

## Apa ini?

LOKAL adalah platform intelijen pasar hyperlokal untuk industri F&B Indonesia. Sebelum buka warung, kafe, atau resto baru — kamu bisa cek dulu: price ceiling di kawasan itu berapa? Kompetitor sudah ada berapa? Trafficnya seperti apa?

Data dikumpulkan langsung dari lapangan oleh Cluster Owner (CO), disimpan on-chain di Solana, dan bisa diakses lewat AI consultant yang bisa jawab pertanyaan spesifik soal bisnismu.

Dibangun untuk [Colosseum Frontier Hackathon 2025](https://colosseum.org).

---

## Siapa penggunanya?

**Business Owner (BO)** — orang yang mau buka usaha F&B. Mereka bayar per sesi untuk konsultasi AI dengan data lokal yang terverifikasi.

**Cluster Owner (CO)** — orang di lapangan. Mereka kumpulkan data harga, traffic, dan kompetitor di kawasan tertentu, submit ke blockchain, dan dapat bagian revenue setiap kali data mereka dipakai.

---

## Stack Teknis

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router), React 19 |
| Styling | Vanilla CSS-in-JS (no Tailwind) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma v7 dengan driver adapter PrismaPg |
| Auth | Supabase Auth (Email + Google OAuth) |
| Blockchain | Solana Devnet via Helius RPC |
| Program | Anchor 0.30+ (Rust, field verification on-chain) |
| NFT | Metaplex Core (soulbound CO credential) |
| Token | IDRX (SPL token, 6 decimals) |
| AI | Groq / Llama-4 Scout |

---

## Struktur Project

```
LOKAL/
├── anchor/                 # On-chain Anchor program (Rust)
├── prisma/
│   ├── schema.prisma       # Database schema — source of truth
│   └── seed.ts             # Base seed data
├── scripts/
│   ├── seed-margonda.ts    # Seeds Margonda cluster data
│   ├── clear-user-sessions.ts
│   └── mint-co-nft.ts      # Mints CO credential NFT
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login, register, callback
│   │   ├── (co)/co/        # Cluster Owner dashboard
│   │   ├── (public)/       # Landing page
│   │   ├── admin/          # Admin panel
│   │   └── api/            # All API routes
│   ├── components/
│   ├── lib/
│   │   ├── prisma.ts       # Singleton Prisma client
│   │   ├── solana/         # Anchor client, IDRX transfer, NFT mint
│   │   └── supabase/       # Client + server helpers
│   └── middleware.ts       # Session refresh + route protection
├── prisma.config.ts        # Prisma v7 config with PrismaPg adapter
└── .env.local              # Local env (never committed)
```

---

## Setup Lokal

### 1. Clone dan install

```bash
git clone https://github.com/your-username/lokal.git
cd lokal
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Isi semua variabel yang ada di `.env.example`. Variabel wajib:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
SUPABASE_SESSION_URL=

# Helius (Solana RPC)
NEXT_PUBLIC_HELIUS_RPC_URL=
HELIUS_RPC_URL=
HELIUS_WEBHOOK_SECRET=

# IDRX Token
NEXT_PUBLIC_IDRX_MINT_ADDRESS=
NEXT_PUBLIC_PLATFORM_WALLET=
PLATFORM_KEYPAIR=    # JSON array — platform wallet secret key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Push schema ke database

```bash
# Di WSL
npx tsx node_modules/.bin/prisma db push --config prisma.config.ts
```

### 4. Seed data Margonda

```bash
npx tsx scripts/seed-margonda.ts
```

### 5. Jalankan dev server

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## Scripts

| Command | Fungsi |
|---|---|
| `npx tsx scripts/seed-margonda.ts` | Seed data cluster Margonda (idempotent, aman dijalankan ulang) |
| `npx tsx scripts/clear-user-sessions.ts` | Hapus semua sesi user tertentu tanpa hapus akun |
| `CO_NAME="..." CO_WALLET="..." npx tsx scripts/mint-co-nft.ts` | Mint NFT credential untuk CO |

---

## API Routes

| Route | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/clusters` | GET | Public | Daftar cluster aktif |
| `/api/waitlist` | POST | Public | Daftar waitlist |
| `/api/sessions` | POST | BO | Buat sesi konsultasi baru |
| `/api/chat` | POST | BO | Kirim pesan AI |
| `/api/co/earnings` | GET | CO | Riwayat dan total pendapatan |
| `/api/co/withdraw` | POST | CO | Tarik IDRX ke wallet |
| `/api/co/fields` | GET/POST | CO | Data field cluster |
| `/api/webhooks/helius` | POST | Signed | Konfirmasi pembayaran IDRX |
| `/api/admin/users` | GET | Admin | Manajemen pengguna |

---

## Model Database Utama

```
User → Session → Message
           └──→ Report
           └──→ ConceptForm

User → ClusterOwner → Cluster → ClusterFieldValue
                  └──→ CoEarning

WaitlistSubmission (standalone, no FK)
```

---

## Deployment ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan semua env vars di Vercel → Settings → Environment Variables
4. Update Supabase Site URL ke URL Vercel
5. Update Google OAuth redirect URI ke `https://your-project.supabase.co/auth/v1/callback`
6. Update Helius webhook URL ke `https://your-project.vercel.app/api/webhooks/helius`

---

## Keamanan

- Webhook Helius divalidasi dengan `crypto.timingSafeEqual` (tahan timing attack)
- `PLATFORM_KEYPAIR` hanya diakses server-side, tidak pernah dikirim ke client
- Semua route CO dan admin diproteksi oleh middleware + role check di API level
- Waitlist API idempotent — email yang sama tidak akan dobel insert

---

## Lisensi

MIT — bebas dipakai, dimodifikasi, dan didistribusikan.

---

Dibangun dengan serius oleh tim LOKAL untuk Superteam Indonesia · Frontier Colosseum 2025.
