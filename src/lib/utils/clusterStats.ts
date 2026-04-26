/**
 * clusterStats.ts — Pure utility to derive display-ready stats from raw field values.
 * No Node.js-only APIs — safe for use in Next.js API routes and client components.
 */

export interface ClusterKeyStats {
  priceCeiling: number | null;      // B1 primary_ceiling
  willingness: number | null;       // same as priceCeiling (B1)
  digitalPayment: number | null;    // B4 adoption_rate
  peakHour: string | null;          // B3 peak_label
  dominantAge: string | null;       // D1 dominant_label
  halal: number | null;             // C1 score
  deliveryPct: number | null;       // B5 delivery_pct
  footTrafficPeak: number | null;   // MS1 hourly_peak
  trafficLevel: string;             // derived from MS1 hourly_peak
  saturationLevel: string;          // M4 label
  primaryGap: string | null;        // MS2 primary_gap
  categories: string[];             // derived from M1 breakdown keys
  priceRangeLabel: string | null;   // B1 primary_label
}

type RawField = { fieldCode: string; value: unknown; status: string };

function safeObj(v: unknown): Record<string, unknown> {
  if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

function safeNum(v: unknown): number | null {
  if (typeof v === 'number' && isFinite(v)) return v;
  return null;
}

function safeStr(v: unknown): string | null {
  if (typeof v === 'string' && v.length > 0) return v;
  return null;
}

/**
 * Maps M1 breakdown keys to human-readable Indonesian category labels.
 */
const CATEGORY_LABEL_MAP: Record<string, string> = {
  cafe_coffee: 'Café',
  warung_kopi: 'Warung Kopi',
  restaurant: 'Restaurant',
  bubble_tea: 'Minuman Spesial',
  cloud_kitchen: 'Cloud Kitchen',
  bakery: 'Bakery',
  street_food: 'Street Food',
};

/**
 * Derives a traffic level label from hourly peak foot traffic.
 */
function trafficLevelFromPeak(peak: number | null): string {
  if (peak === null) return 'Tidak Diketahui';
  if (peak >= 1000) return 'Sangat Tinggi';
  if (peak >= 600) return 'Tinggi';
  if (peak >= 300) return 'Sedang';
  return 'Rendah';
}

/**
 * Derives display-ready cluster stats from an array of raw field values.
 * Only uses fields with status === 'VALIDATED'.
 */
export function deriveClusterStats(fields: RawField[]): ClusterKeyStats {
  // Index validated fields by code for O(1) lookup
  const validated = new Map<string, unknown>();
  for (const f of fields) {
    if (f.status === 'VALIDATED') {
      validated.set(f.fieldCode, f.value);
    }
  }

  // B1 — Max willingness to pay
  const b1 = safeObj(validated.get('B1'));
  const priceCeiling = safeNum(b1.primary_ceiling);
  const priceRangeLabel = safeStr(b1.primary_label);

  // B3 — Peak hours
  const b3 = safeObj(validated.get('B3'));
  const peakHour = safeStr(b3.peak_label);

  // B4 — Digital payment
  const b4 = safeObj(validated.get('B4'));
  const digitalPayment = safeNum(b4.adoption_rate);

  // B5 — Delivery split
  const b5 = safeObj(validated.get('B5'));
  const deliveryPct = safeNum(b5.delivery_pct);

  // D1 — Age distribution
  const d1 = safeObj(validated.get('D1'));
  const dominantAge = safeStr(d1.dominant_label);

  // C1 — Halal sensitivity
  const c1 = safeObj(validated.get('C1'));
  const halal = safeNum(c1.score);

  // MS1 — Foot traffic
  const ms1 = safeObj(validated.get('MS1'));
  const footTrafficPeak = safeNum(ms1.hourly_peak);
  const trafficLevel = trafficLevelFromPeak(footTrafficPeak);

  // MS2 — Market gap
  const ms2 = safeObj(validated.get('MS2'));
  const primaryGap = safeStr(ms2.primary_gap);

  // M4 — Saturation
  const m4 = safeObj(validated.get('M4'));
  const saturationLevel = safeStr(m4.label) ?? safeStr(m4.overall) ?? 'Tidak Diketahui';

  // M1 — Categories derived from breakdown keys
  const m1 = safeObj(validated.get('M1'));
  const breakdown = safeObj(m1.breakdown);
  const categories: string[] = Object.keys(breakdown)
    .filter((k) => safeNum(breakdown[k]) !== null && (breakdown[k] as number) > 0)
    .map((k) => CATEGORY_LABEL_MAP[k] ?? k);

  return {
    priceCeiling,
    willingness: priceCeiling, // same field per spec
    digitalPayment,
    peakHour,
    dominantAge,
    halal,
    deliveryPct,
    footTrafficPeak,
    trafficLevel,
    saturationLevel,
    primaryGap,
    categories,
    priceRangeLabel,
  };
}
