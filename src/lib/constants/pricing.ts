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

// ── Cluster Owner revenue share ───────────────────────────────────────────

/** CO revenue share rate: 5% flat of session price for MVP */
export const CO_SESSION_SHARE_RATE = 0.05;

/** CO revenue share per session in IDRX: 5% × Rp 400,000 = Rp 20,000 */
export const CO_SESSION_SHARE_IDRX = Math.round(SESSION_PRICE_IDRX * CO_SESSION_SHARE_RATE); // 20,000
