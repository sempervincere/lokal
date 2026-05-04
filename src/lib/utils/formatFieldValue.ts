/**
 * src/lib/utils/formatFieldValue.ts
 *
 * Shared formatter for ClusterFieldValue JSON data.
 * Extracted from the CO fields page for reuse in admin review queue.
 */

export interface FieldValueInput {
  fieldCode: string;
  value: unknown;
}

export function formatFieldValue(field: FieldValueInput): string {
  const v = field.value;
  if (!v) return '—';
  if (typeof v === 'string') return v;

  try {
    const obj = v as Record<string, unknown>;

    // Handle aggregated survey data
    if (obj.aggregated) {
      const agg = obj.aggregated as Record<string, any>;
      if (agg.distribution) {
        const entries = Object.entries(agg.distribution as Record<string, number>);
        const top = entries.sort((a, b) => b[1] - a[1])[0];
        return top ? `${top[0]} (${top[1]})` : '-';
      }
      if (agg.average !== undefined) return `${agg.average}/10`;
      if (agg.byCategory) {
        return Object.entries(agg.byCategory as Record<string, { avg: number }>)
          .slice(0, 2)
          .map(([k, c]) => `${k}: Rp ${c.avg.toLocaleString('id')}`)
          .join(', ');
      }
      if (agg.topCompetitors) {
        return (agg.topCompetitors as Array<{ name: string }>)
          .slice(0, 3)
          .map((c) => c.name)
          .join(', ');
      }
    }

    // Legacy format handling per field code
    if (field.fieldCode === 'B1' && obj.subcategories) {
      const subs = obj.subcategories as Record<string, { min: number; max: number }>;
      return Object.entries(subs)
        .map(([k, s]) => `${k}: Rp ${s.min.toLocaleString('id')}–${s.max.toLocaleString('id')}`)
        .join(', ');
    }
    if (field.fieldCode === 'B3' && obj.weekday) {
      return `Peak: ${obj.intensity || '—'}`;
    }
    if (field.fieldCode === 'B4' && typeof obj.adoption_rate === 'number') {
      return `${obj.adoption_rate}% (${((obj.primary_apps as string[])?.join(', ')) || ''})`;
    }
    if (field.fieldCode === 'B5' && typeof obj.delivery_pct === 'number') {
      return `Delivery ${obj.delivery_pct}% / Dine-in ${obj.dine_in_pct}%`;
    }
    if (field.fieldCode === 'M1' && typeof obj.total_outlets === 'number') {
      return `${obj.total_outlets} outlet`;
    }
    if (field.fieldCode === 'M2' && obj.by_category) {
      const cats = obj.by_category as Record<string, { avg: number }>;
      return Object.entries(cats)
        .map(([k, c]) => `${k}: Rp ${c.avg.toLocaleString('id')}`)
        .join(', ');
    }
    if (field.fieldCode === 'M3' && Array.isArray(obj.competitors)) {
      return `${(obj.competitors as Array<{ name: string }>).map((c) => c.name).join(', ')}`;
    }
    if (field.fieldCode === 'M4') return `${obj.overall}`;
    if (field.fieldCode === 'D1' && obj.age_bands) {
      return (obj.dominant as string) || '';
    }
    if (field.fieldCode === 'D2' && obj.brackets) return (obj.dominant as string) || '';
    if (field.fieldCode === 'D3' && obj.mix) return (obj.dominant as string) || '';
    if (field.fieldCode === 'MS1' && typeof obj.hourly_peak === 'number') {
      return `Peak ${obj.hourly_peak} org/jam`;
    }
    if (field.fieldCode === 'MS2' && obj.primary_gap) return obj.primary_gap as string;
    if (field.fieldCode === 'C1' && typeof obj.score === 'number') return `${obj.score}/5`;
    if (field.fieldCode === 'C2' && typeof obj.lag_weeks === 'number') return `${obj.lag_weeks} minggu dari Jakarta`;
    if (field.fieldCode === 'C3' && obj.occasions) {
      return Object.entries(obj.occasions as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k, v]) => `${v}% ${k}`)
        .join(', ');
    }
    if (field.fieldCode === 'C4' && typeof obj.score === 'number') return `${obj.score}/10`;
    if (field.fieldCode === 'C5' && Array.isArray(obj.points)) {
      return `${(obj.points as Array<{ name: string }>).map((p) => p.name).join(', ')}`;
    }
    if (field.fieldCode === 'B2' && typeof obj.index === 'number') return `${obj.index}/10`;
    if (field.fieldCode === 'M5' && Array.isArray(obj.cases)) {
      return `${(obj.cases as unknown[]).length} kasus`;
    }

    return JSON.stringify(v).slice(0, 80) + (JSON.stringify(v).length > 80 ? '...' : '');
  } catch {
    return String(v).slice(0, 80);
  }
}
