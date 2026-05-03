// src/lib/constants/pricing.ts

/** IDRX token has 6 decimal places */
export const IDRX_DECIMALS = 6;

/** Display price in IDRX units (human-readable) */
export const SESSION_PRICE_IDRX = 400_000;

/** On-chain transfer amount in base units: 400,000 × 10^6 = 400,000,000,000 */
export const SESSION_PRICE_BASE_UNITS = 400_000_000_000;

/** Session consultation window: 12 hours in milliseconds */
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

/** Free chat message limit before conversion modal appears */
export const FREE_MESSAGE_LIMIT = 7;

/** Claude model — FROZEN. Never change without explicit team decision. */
export const CLAUDE_MODEL = 'qwen3.5-plus';

/** Minimum menu items required on concept form */
export const MIN_MENU_ITEMS = 1;

/** Maximum free clusters available without payment */
export const MAX_FREE_CLUSTERS = 1;

// ── Cluster Owner revenue share (tiered per PRD §9.2) ─────────────────────

/** Reputation tiers and their session revenue share rates */
export const CO_REPUTATION_TIERS = [
  { tier: 1, label: 'Tier 1', minScore: 0,  maxScore: 39,  shareRate: 0.05, shareIdrx: 20000, multiplier: 1.0 },
  { tier: 2, label: 'Tier 2', minScore: 40, maxScore: 69,  shareRate: 0.07, shareIdrx: 28000, multiplier: 1.3 },
  { tier: 3, label: 'Tier 3', minScore: 70, maxScore: 100, shareRate: 0.10, shareIdrx: 40000, multiplier: 1.7 },
] as const;

/** Resolve a CO's reputation tier from their coScore */
export function getCoTier(coScore: number) {
  return CO_REPUTATION_TIERS.find(
    (t) => coScore >= t.minScore && coScore <= t.maxScore,
  )!;
}

/** CO session share in IDRX for a given coScore */
export function getCoShareByIdrx(coScore: number): number {
  return getCoTier(coScore).shareIdrx;
}

/** Legacy flat rate — deprecated, use getCoTier() instead */
export const CO_SESSION_SHARE_RATE = 0.05;

/** Legacy flat amount — deprecated, use getCoShareByIdrx() instead */
export const CO_SESSION_SHARE_IDRX = 20_000;

// ── Respondent Vault System ─────────────────────────────────────

/** Percentage of session revenue allocated to respondent vault (8%) */
export const VAULT_ALLOCATION_RATE = 0.08;

/** Amount in IDRX allocated to vault per session (8% of 400,000) */
export const VAULT_ALLOCATION_IDRX = SESSION_PRICE_IDRX * VAULT_ALLOCATION_RATE; // 32,000

/** Amount in base units allocated to vault per session */
export const VAULT_ALLOCATION_BASE_UNITS = SESSION_PRICE_BASE_UNITS * VAULT_ALLOCATION_RATE; // 32,000,000,000

/** Minimum IDRX balance required for manual withdrawal */
export const VAULT_MIN_WITHDRAWAL_IDRX = 10_000;

/** CO rejection threshold before admin review is triggered (15%) */
export const CO_REJECTION_THRESHOLD_RATE = 0.15;

/** Minimum number of responses before rejection threshold applies */
export const CO_REJECTION_THRESHOLD_MIN_RESPONSES = 5;

// ── Helper Functions ────────────────────────────────────────────

/**
 * Calculate vault allocation for a session
 * @param sessionPriceIdrx - Session price in IDRX (default: 400,000)
 * @returns Vault allocation in IDRX
 */
export function calculateVaultAllocation(sessionPriceIdrx: number = SESSION_PRICE_IDRX): number {
  return Math.floor(sessionPriceIdrx * VAULT_ALLOCATION_RATE);
}

/**
 * Calculate per-respondent reward from vault
 * @param vaultBalance - Total vault balance in IDRX
 * @param totalApprovedFields - Total number of approved field responses
 * @param respondentApprovedFields - Number of fields this respondent contributed
 * @returns Reward amount in IDRX for this respondent
 */
export function calculateRespondentReward(
  vaultBalance: number,
  totalApprovedFields: number,
  respondentApprovedFields: number
): number {
  if (totalApprovedFields === 0) return 0;
  return Math.floor((vaultBalance / totalApprovedFields) * respondentApprovedFields);
}

/**
 * Check if CO rejection rate exceeds threshold
 * @param rejectedCount - Number of rejected responses
 * @param totalCount - Total number of responses reviewed
 * @returns true if threshold exceeded
 */
export function isRejectionThresholdExceeded(rejectedCount: number, totalCount: number): boolean {
  if (totalCount < CO_REJECTION_THRESHOLD_MIN_RESPONSES) return false;
  return (rejectedCount / totalCount) > CO_REJECTION_THRESHOLD_RATE;
}
