# LOKAL — Complete Setup & Tooling Guide

> **Environment:** Ubuntu on WSL2 · **Target:** 26-day Frontier Colosseum hackathon
> **Read Part 1 before installing anything.** Skip repos marked ❌. Install repos marked ✅ in the order shown.

---

## Part 1 — Repo Analysis: What to Install, What to Skip

You gave me 17 repos. Not all help. Some will hurt. Here is the ruthless triage.

### The Decision Matrix

| #   | Repo                                        | Verdict                      | Tier                                                                                           | Why                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **upstash/context7**                        | ✅ **INSTALL**               | S — Critical                                                                                   | MCP server giving Claude up-to-date library docs. Kills hallucination on Solana/Anchor/Metaplex/Next.js APIs. This is your single highest-leverage install.                                                                                          |
| 2   | **supabase/cli**                            | ✅ **INSTALL**               | S — Critical                                                                                   | Your DB platform. Migrations, type gen, local dev, RLS policies. Non-negotiable.                                                                                                                                                                     |
| 3   | **Vercel CLI**                              | ✅ **INSTALL**               | S — Critical                                                                                   | Your deploy target. `vercel env`, `vercel dev`, `vercel logs` during demo debugging.                                                                                                                                                                 |
| 4   | **microsoft/playwright-cli**                | ✅ **INSTALL**               | A — High                                                                                       | End-to-end test the demo flow. Record the 3-minute demo as a Playwright script — if it passes green 10 times, you're safe on stage.                                                                                                                  |
| 5   | **cli/cli** (`gh`)                          | ✅ **INSTALL**               | A — High                                                                                       | Two-person team, many PRs. `gh pr create`, `gh pr checks`, `gh repo view` saves hours.                                                                                                                                                               |
| 6   | **anthropics/knowledge-work-plugins**       | ⚠️ **CHERRY-PICK**           | B — Medium                                                                                     | Most plugins are business ops (sales, HR, legal). Only three are relevant — see §Part 3.                                                                                                                                                             |
| 7   | **sendaifun/skills**                        | ✅ **INSTALL (cherry-pick)** | S — Critical                                                                                   | Gold mine for Solana skills. Install `helius`, `metaplex`, `light-protocol`, `solana-kit`, `solana-agent-kit`, `vulnhunter`. Skip the DeFi ones (Drift, Kamino, Raydium, Meteora, Orca) — not in your stack.                                         |
| 8   | **msitarzewski/agency-agents**              | ⚠️ **CHERRY-PICK**           | B — Medium                                                                                     | 144 agents, 90% irrelevant. Pick ~6 — see §Part 3.                                                                                                                                                                                                   |
| 9   | **HKUDS/CLI-Anything**                      | ❌ **SKIP**                  | Low priority for this hackathon. You already have specialized CLIs for every critical surface. |
| 10  | **VoltAgent/awesome-claude-code-subagents** | ✅ **INSTALL (cherry-pick)** | A — High                                                                                       | Install 5–7 subagents via `claude plugin`. See §Part 3.                                                                                                                                                                                              |
| 11  | **VoltAgent/awesome-agent-skills**          | ⚠️ **BROWSE ONLY**           | C — Low                                                                                        | Broad grab-bag. Your specialized skills (sendaifun, quasar-skill) cover the specific needs. Don't install wholesale.                                                                                                                                 |
| 12  | **blueshift-gg/quasar**                     | ❌ **DO NOT INSTALL**        | DANGER                                                                                         | Quasar is beta, unaudited, and replaces Anchor. Your TDD committed to Anchor. Switching frameworks 26 days before a hackathon = guaranteed death. Revisit Quasar in v2 post-hackathon.                                                               |
| 13  | **HKUDS/LightRAG**                          | ❌ **SKIP**                  | NOT NEEDED                                                                                     | TDD §3 explicitly cut RAG. One cluster, 20 fields, direct prompt injection. Installing this adds embeddings infrastructure for zero demo benefit.                                                                                                    |
| 14  | **HKUDS/RAG-Anything**                      | ❌ **SKIP**                  | NOT NEEDED                                                                                     | Multi-modal RAG (images + text). You don't ingest images into RAG — CO evidence photos go to R2 for human review, not for the AI.                                                                                                                    |
| 15  | **rohitdevsol/quasar-skill**                | ❌ **SKIP**                  | DANGER                                                                                         | Skill for Quasar. You're using Anchor. Installing this teaches Claude the wrong framework.                                                                                                                                                           |
| 16  | **sendaifun/solana-new**                    | ✅ **INSTALL**               | S — Critical                                                                                   | Aka "superstack." Contains `colosseum-copilot` skill, specifically designed for your hackathon. Plus scaffold-project, build-with-claude, submit-to-hackathon, create-pitch-deck. **This is the single most valuable meta-tool for your situation.** |
| 17  | **VoltAgent/awesome-design-md**             | ⚠️ **BROWSE ONLY**           | C — Low                                                                                        | Good for landing-page polish in the final week. Not a priority for Days 1–21.                                                                                                                                                                        |

### Quick-Read Summary

- **Install everything tier S+A** in Part 2 (that's 9 repos/tools).
- **Cherry-pick** from the three large repos in Part 3.
- **Never install** Quasar, Quasar-skill, LightRAG, RAG-Anything.

---

## Part 2 — Step-by-Step Installation (Ubuntu WSL2)

Order matters. Install roughly top-to-bottom. Everything assumes you're in your WSL2 Ubuntu terminal, not Windows cmd/PowerShell.

### Step 0 — WSL2 Base Environment Sanity Check

```bash
# Verify you're actually in WSL2
uname -a  # should mention "microsoft" and "WSL2"

# Update the system
sudo apt update && sudo apt upgrade -y

# Essentials (probably already there)
sudo apt install -y build-essential curl wget git pkg-config libssl-dev libudev-dev

# Check you can reach the internet through WSL
ping -c 2 github.com
```

### Step 1 — Node.js 20+ (Required by basically everything)

Use `nvm` so you can switch between node versions per project.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload your shell
source ~/.bashrc   # or ~/.zshrc if using zsh

# Install Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v   # v20.x.x
npm -v
```

Install `pnpm` globally (superstack uses it):

```bash
npm install -g pnpm
```

### Step 2 — Rust + Cargo (for Anchor)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# accept defaults
source "$HOME/.cargo/env"

rustc --version
cargo --version
```

### Step 3 — Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH (the installer usually does this; verify)
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

solana --version

# Point to devnet
solana config set --url https://api.devnet.solana.com

# Generate a keypair for dev (save the seed phrase!)
solana-keygen new --outfile ~/.config/solana/id.json

# Airdrop devnet SOL
solana airdrop 2
```

### Step 4 — Anchor (stable, NOT Quasar)

```bash
# Anchor uses avm (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --force

# Install the latest stable Anchor
avm install latest
avm use latest

anchor --version   # expect 0.30.x or newer
```

### Step 5 — Claude Code (the heart of your workflow)

```bash
npm install -g @anthropic-ai/claude-code

# Log in
claude
# Follow the prompts to authenticate

# Verify plugin system is available
claude plugin --help
```

### Step 6 — Context7 MCP (Tier S — Critical)

Context7 is an MCP server. It runs as a subprocess of Claude Code and gives you live documentation for libraries, eliminating hallucinations on Solana/Anchor/Next.js/Prisma/Metaplex APIs.

```bash
# Run this once from inside Claude Code:
claude mcp add --transport http context7 https://mcp.context7.com/mcp

# Verify it registered
claude mcp list
```

When writing code, prefix with "use context7" or Claude will auto-invoke it:

```
> Implement the idrxTransfer.ts using @solana/spl-token. use context7
```

### Step 7 — Supabase CLI (Tier S)

```bash
# Official install (WSL/Linux)
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz \
  | tar -xz -C /tmp
sudo mv /tmp/supabase /usr/local/bin/supabase

supabase --version

# Log in
supabase login

# Later, inside the lokal repo root:
supabase init
supabase link --project-ref <your-project-ref>
```

### Step 8 — Vercel CLI (Tier S)

```bash
npm install -g vercel

vercel --version
vercel login

# Later, inside lokal/:
vercel link
vercel env pull .env.local   # pull all env vars from Vercel dashboard
```

### Step 9 — GitHub CLI (Tier A)

```bash
# Official install for Debian/Ubuntu
(type -p wget >/dev/null || sudo apt install wget -y) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh -y

gh --version
gh auth login   # choose HTTPS + browser auth
```

### Step 10 — Playwright (Tier A — demo rehearsal tool)

Install inside your project (not globally):

```bash
cd ~/code/lokal   # or wherever you cloned the lokal repo

# After you've scaffolded Next.js
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps   # --with-deps grabs required browser libs on Ubuntu
```

You'll use this in Days 22–24 to script the full demo flow and rehearse it automatically.

### Step 11 — Superstack (sendaifun/solana-new) — Tier S

This is the single most important install after Context7. It gives you the `colosseum-copilot` skill which knows what Colosseum judges look for, plus project scaffold, build, pitch-deck, and hackathon-submission skills.

```bash
curl -fsSL https://www.solana.new/setup.sh | bash
```

This installs 77 skills + knowledge base to `~/.claude/skills/` and `~/.codex/skills/`. Nothing writes to PATH.

Inside Claude Code, test it:

```
> /colosseum-copilot What pattern wins Consumer Apps tracks on Solana?
> /find-next-crypto-idea  # (don't run this seriously — you already have your idea)
> /scaffold-project       # useful for Day 1
> /submit-to-hackathon    # for Day 24+
```

### Step 12 — Solana Skills from sendaifun/skills (Tier S — cherry-picked)

These are separate from superstack and more granular. Install only what LOKAL uses.

```bash
mkdir -p ~/.claude/skills
cd /tmp && git clone https://github.com/sendaifun/skills.git sendai-skills
cd sendai-skills/skills

# Copy only the skills LOKAL needs
cp -r helius          ~/.claude/skills/
cp -r metaplex        ~/.claude/skills/
cp -r light-protocol  ~/.claude/skills/   # for ZK Proof B stretch goal
cp -r solana-kit      ~/.claude/skills/
cp -r solana-agent-kit ~/.claude/skills/
cp -r vulnhunter      ~/.claude/skills/   # security audit before demo

# OPTIONAL but nice
cp -r pyth            ~/.claude/skills/   # if you ever need price feeds

# Intentionally SKIP (not relevant to LOKAL):
# drift, kamino, raydium, orca, meteora, sanctum, pumpfun, lulo, ranger-finance,
# debridge, magicblock, squads, switchboard, surfpool, dflow, pinocchio-development,
# coingecko, solana-kit-migration
```

Verify:

```bash
ls ~/.claude/skills/
# expect: helius metaplex light-protocol solana-kit solana-agent-kit vulnhunter
```

### Step 13 — VoltAgent Subagents (Tier A — cherry-picked)

Subagents are isolated-context specialists Claude delegates to. Install only those that map to LOKAL roles:

```bash
# From inside Claude Code:
claude plugin marketplace add VoltAgent/awesome-claude-code-subagents

# Install ONLY these (see Part 3 for rationale):
claude plugin install voltagent-core-dev      # frontend/backend/fullstack developer agents
claude plugin install voltagent-lang          # includes typescript-pro, nextjs-developer, react-specialist, rust-engineer, sql-pro
claude plugin install voltagent-qa-sec        # code-reviewer, security-auditor, debugger
claude plugin install voltagent-data-ai       # prompt-engineer for Claude prompt work
claude plugin install voltagent-dev-exp       # documentation-engineer, refactoring-specialist

# Intentionally SKIP:
# voltagent-infra    (no Kubernetes/Terraform in your stack)
# voltagent-domains  (no embedded/IoT/game/fintech — blockchain-developer is the only win and sendai covers it)
# voltagent-biz      (no sales/legal agents needed)
# voltagent-meta     (useful later, not urgent)
# voltagent-research (nice-to-have, install in week 4 if needed)
```

### Step 14 — Anthropic Knowledge Work Plugins (Tier B — cherry-picked)

Only three plugins here are relevant to a technical team of two:

```bash
# From inside Claude Code:
claude plugin marketplace add anthropics/knowledge-work-plugins

# These three only:
claude plugin install engineering@knowledge-work-plugins
claude plugin install design@knowledge-work-plugins           # if Daffa wants UI patterns
claude plugin install product-management@knowledge-work-plugins  # useful for pitch deck + submission

# SKIP everything else (sales, legal, HR, finance, enterprise-search, bio-research, etc.)
```

### Step 15 — Agency Agents (Tier B — cherry-picked)

From the 144 agents, only ~6 help LOKAL. Install selectively:

```bash
cd /tmp && git clone https://github.com/msitarzewski/agency-agents.git
cd agency-agents

mkdir -p ~/.claude/agents

# The six that earn their keep:
cp engineering/engineering-rapid-prototyper.md    ~/.claude/agents/
cp engineering/engineering-frontend-developer.md  ~/.claude/agents/
cp engineering/engineering-backend-architect.md   ~/.claude/agents/
cp testing/testing-reality-checker.md             ~/.claude/agents/   # "is this really production-ready?"
cp testing/testing-evidence-collector.md          ~/.claude/agents/   # visual QA with screenshots
cp product/product-sprint-prioritizer.md          ~/.claude/agents/   # 26-day sprint triage

# Skip the rest. 138 agents you will never invoke is pure context pollution.
```

---

## Part 3 — Why These Specific Cherry-Picks

### From sendaifun/skills — the 6 picked

| Skill                | LOKAL use case                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **helius**           | You use Helius for devnet RPC + webhooks. Its DAS API shapes, webhook payloads, and Enhanced Transactions format change often. This skill keeps Claude current. |
| **metaplex**         | You mint the CO soulbound NFT via Metaplex Core. This is the specific SDK you're using. Without this skill, Claude regresses to old Token Metadata patterns.    |
| **light-protocol**   | Your stretch goal is ZK Proof B (data density attestation). Light Protocol is your only realistic ZK path on Solana.                                            |
| **solana-kit**       | If you ever migrate to the modern `@solana/kit` SDK (v2), this has the patterns. For MVP you're on web3.js v1, but good to have.                                |
| **solana-agent-kit** | If the "12-hour AI consultation" ever needs agentic Solana actions (e.g., "book me a consult"), this is the skill.                                              |
| **vulnhunter**       | Before demo day, run this against your Anchor program to catch the standard vulnerabilities.                                                                    |

### From VoltAgent subagents — why these plugins

| Plugin                 | Relevant agents inside                                                     | LOKAL use case                               |
| ---------------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| **voltagent-core-dev** | frontend-developer, backend-developer, fullstack-developer, api-designer   | Core build work                              |
| **voltagent-lang**     | typescript-pro, nextjs-developer, react-specialist, rust-engineer, sql-pro | Language-specific depth for Next.js + Anchor |
| **voltagent-qa-sec**   | code-reviewer, security-auditor, debugger, error-detective, qa-expert      | Days 22–26 polish + demo prep                |
| **voltagent-data-ai**  | prompt-engineer                                                            | Tuning the 10-section report prompt          |
| **voltagent-dev-exp**  | documentation-engineer, refactoring-specialist, git-workflow-manager       | Clean README + final commits                 |

### From agency-agents — why these six

| Agent                  | When to summon it                                             |
| ---------------------- | ------------------------------------------------------------- |
| **rapid-prototyper**   | Days 1–7 — ship the bone structure fast                       |
| **frontend-developer** | Daffa's daily work partner                                    |
| **backend-architect**  | Sanity-check API route design                                 |
| **reality-checker**    | Day 22 — "is this actually production-ready?" audit           |
| **evidence-collector** | Days 23–25 — generate demo screenshots with receipts          |
| **sprint-prioritizer** | Any day you feel overwhelmed — it re-triages your 26-day plan |

---

## Part 4 — First-Run Checklist (Day 1 Boot Sequence)

Once everything is installed, do this exact sequence:

```bash
# 1. Create the project
cd ~/code
npx create-next-app@latest lokal \
  --typescript --tailwind --app --eslint \
  --src-dir --import-alias "@/*" --no-turbo
cd lokal

# 2. Init git + push to GitHub
git init && git add . && git commit -m "initial scaffold"
gh repo create lokal --private --source=. --push

# 3. Initialize Anchor workspace
anchor init anchor --no-git  # the --no-git avoids a nested repo
mv anchor/programs anchor/programs-tmp
# (Merge the Anchor subfolder structure per TDD §8)

# 4. Install exact dependencies from TDD
pnpm add @anthropic-ai/sdk @solana/web3.js @solana/spl-token @solana/spl-memo \
         @solana/wallet-adapter-react @solana/wallet-adapter-react-ui \
         @solana/wallet-adapter-wallets \
         @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults \
         @metaplex-foundation/mpl-core \
         @prisma/client prisma \
         @supabase/supabase-js @supabase/ssr \
         @react-pdf/renderer \
         zustand react-hook-form zod \
         mapbox-gl @types/mapbox-gl

pnpm add -D @playwright/test

# 5. Supabase project linked
supabase init
supabase link --project-ref <ref>
npx prisma init

# 6. Vercel project linked
vercel link

# 7. Context7 sanity check — inside Claude Code:
# > use context7 to show me the current @solana/spl-token createTransferCheckedInstruction signature

# 8. Ask colosseum-copilot what to focus on first:
# > /colosseum-copilot I have 26 days. What do judges value most for Consumer Apps?
```

---

## Part 5 — How to Use All This Daily

**Don't install everything then forget it exists.** Routine:

1. **Start each coding session** inside your `lokal/` directory with `claude` (Claude Code auto-loads CLAUDE.md + installed skills + subagents).
2. **Before writing any Solana/Metaplex/Anchor code:** prompt with "use context7" so the docs are fetched fresh.
3. **When stuck on a Solana question:** invoke the specific skill — "use the helius skill to explain webhook payload shape."
4. **Before merging a PR:** ask the `code-reviewer` subagent to audit it.
5. **End of every sprint day:** ask `sprint-prioritizer` to re-rank what's left against the 26-day deadline.
6. **Day 22:** run `reality-checker` against the whole app.
7. **Day 24:** record the demo with Playwright. Run it 10x. If it's green every time, you're safe.
8. **Day 25:** run `/submit-to-hackathon` (superstack skill) to get submission checklist.
9. **Day 26:** `/create-pitch-deck` for the final pitch.

---

## Part 6 — Emergency Troubleshooting (WSL2-Specific Gotchas)

| Symptom                                            | Fix                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `anchor build` is incredibly slow                  | Move project into the WSL filesystem (`~/code/...`), NOT `/mnt/c/...`. NTFS interop is the killer. |
| Phantom wallet extension can't see your dev server | Run `pnpm dev -- --hostname 0.0.0.0` and browse from Windows to `http://localhost:3000`.           |
| Solana RPC timeout in WSL                          | Default WSL2 DNS can flake. Add to `/etc/resolv.conf`: `nameserver 8.8.8.8`.                       |
| Helius webhook never fires locally                 | `ngrok http 3000` in a second WSL terminal. Register the ngrok URL in Helius dashboard.            |
| `cargo` eats all your RAM                          | Edit `.cargo/config.toml`: `[build] jobs = 2`. WSL2 VMs often can't handle parallel rustc.         |
| Git line endings fight Prettier                    | `git config --global core.autocrlf input` in WSL.                                                  |

---

## Part 7 — What NOT To Do (Learned From Hackathon Corpses)

1. **Do not switch Anchor → Quasar "because it's faster."** Quasar is beta. The CU savings don't matter when your demo crashes.
2. **Do not add pgvector / LightRAG / RAG-Anything midway.** The TDD cut retrieval for a reason. One cluster, direct injection, done.
3. **Do not deploy to mainnet before demo.** Devnet only. IDRX amounts, program IDs, wallet addresses — all devnet.
4. **Do not install every subagent available.** Context bloat hurts Claude more than it helps. The 20-ish skills + agents above is the sweet spot.
5. **Do not commit `PLATFORM_KEYPAIR`, `.env.local`, or `target/deploy/*-keypair.json`.** Add them to `.gitignore` on Day 1.
6. **Do not rewrite the Anchor program in the last week.** Freeze `lokal_core` on Day 17. Bug fixes only after that.
7. **Do not let the report prompt balloon past 6000 tokens.** 20 fields fit. Keep it that way.

---

_LOKAL — Built lean. Built to demo. Built to win._
