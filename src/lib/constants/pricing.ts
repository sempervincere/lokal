// src/lib/constants/pricing.ts

/** IDRX token has 2 decimal places (NOT 6 like USDC) */
export const IDRX_DECIMALS = 2;

/** Display price in IDRX units (human-readable) */
export const SESSION_PRICE_IDRX = 400_000;

/** On-chain transfer amount in base units: 400,000 × 10^2 = 40,000,000 */
export const SESSION_PRICE_BASE_UNITS = 40_000_000;

/** Session consultation window: 12 hours in milliseconds */
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

/** Free chat message limit before conversion modal appears */
export const FREE_MESSAGE_LIMIT = 7;

/** Claude model — FROZEN. Never change without explicit team decision. */
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

/** Minimum menu items required on concept form */
export const MIN_MENU_ITEMS = 1;

/** Maximum free clusters available without payment */
export const MAX_FREE_CLUSTERS = 1;
