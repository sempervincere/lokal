'use client';

import { useEffect, useState } from 'react';
import { Globe, X, Check, Link2 } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TIER_1_FIELD_CODES } from '@/lib/constants/field';

interface FieldData {
  id: string;
  fieldCode: string;
  fieldName: string;
  collectionMethod: string;
  isComplex: boolean;
  status: string;
  value: unknown;
}

function formatFieldValue(field: FieldData): string {
  const v = field.value;
  if (!v) return '—';
  if (typeof v === 'string') return v;
  try {
    const obj = v as Record<string, unknown>;

    if (field.fieldCode === 'B1' && obj.subcategories) {
      const subs = obj.subcategories as Record<string, { min: number; max: number }>;
      return Object.entries(subs).map(([k, s]) =>
        `${k}: Rp ${s.min.toLocaleString('id')}–${s.max.toLocaleString('id')}`
      ).join(', ');
    }
    if (field.fieldCode === 'B3' && obj.weekday) {
      return `Peak: ${obj.intensity || '—'}`;
    }
    if (field.fieldCode === 'B4' && typeof obj.adoption_rate === 'number') {
      return `${obj.adoption_rate}% (${(obj.primary_apps as string[])?.join(', ') || ''})`;
    }
    if (field.fieldCode === 'B5' && typeof obj.delivery_pct === 'number') {
      return `Delivery ${obj.delivery_pct}% / Dine-in ${obj.dine_in_pct}%`;
    }
    if (field.fieldCode === 'M1' && typeof obj.total_outlets === 'number') {
      return `${obj.total_outlets} outlet`;
    }
    if (field.fieldCode === 'M2' && obj.by_category) {
      const cats = obj.by_category as Record<string, { avg: number }>;
      return Object.entries(cats).map(([k, c]) => `${k}: Rp ${c.avg.toLocaleString('id')}`).join(', ');
    }
    if (field.fieldCode === 'M3' && Array.isArray(obj.competitors)) {
      return `${(obj.competitors as Array<{ name: string }>).map(c => c.name).join(', ')}`;
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
        .sort((a, b) => b[1] - a[1]).slice(0, 2)
        .map(([k, v]) => `${v}% ${k}`).join(', ');
    }
    if (field.fieldCode === 'C4' && typeof obj.score === 'number') return `${obj.score}/10`;
    if (field.fieldCode === 'C5' && Array.isArray(obj.points)) {
      return `${(obj.points as Array<{ name: string }>).map(p => p.name).join(', ')}`;
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

export default function COFieldsPage() {
  const [fields, setFields] = useState<FieldData[]>([]);
  const [clusterSlug, setClusterSlug] = useState('depok-margonda-001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [formBuilderField, setFormBuilderField] = useState<FieldData | null>(null);
  const [surveyLinkCopied, setSurveyLinkCopied] = useState(false);

  useEffect(() => {
    fetch('/api/co/fields')
      .then(r => { if (!r.ok) throw new Error('Gagal memuat'); return r.json(); })
      .then(data => {
        setFields(data.fields);
        setClusterSlug(data.clusterSlug);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const surveyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/survey/${clusterSlug}`
    : `https://lokal.id/survey/${clusterSlug}`;

  function copySurveyLink() {
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setSurveyLinkCopied(true);
      setTimeout(() => setSurveyLinkCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: T.danger, marginBottom: 8 }}>{error}</div>
      </div>
    );
  }

  const validated = fields.filter(f => f.status === 'VALIDATED').length;
  const filtered = filter === 'all' ? fields : fields.filter(f => f.status === filter);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', position: 'relative', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {formBuilderField && <FormBuilderModal field={formBuilderField} onClose={() => setFormBuilderField(null)} />}

      <div style={{
        background: T.p100, border: `1px solid ${T.p600}22`, borderRadius: 14,
        padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.p600, marginBottom: 4 }}>Link Survei Cluster — Semua 20 Field Tier 1</div>
          <div style={{
            fontSize: 12, color: T.g500, fontFamily: 'var(--font-mono), monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{surveyUrl}</div>
        </div>
        <button onClick={copySurveyLink} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9,
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
          background: surveyLinkCopied ? T.success : T.p600, color: T.c50, flexShrink: 0, transition: 'background 200ms',
        }}>
          <Link2 size={14} color={T.c50} />
          {surveyLinkCopied ? 'Tersalin!' : 'Salin Link'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Data Fields — Tier 1</div>
          <div style={{ fontSize: 13, color: T.g500 }}>{validated}/{fields.length} field tervalidasi</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ id: 'all', label: 'Semua' }, { id: 'VALIDATED', label: 'Tervalidasi' }, { id: 'PENDING', label: 'Pending' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 12,
              fontWeight: 600, fontFamily: 'inherit', transition: 'all 150ms',
              background: filter === f.id ? T.p600 : T.c200, color: filter === f.id ? T.c50 : T.g700,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ProgressBar value={validated} max={20} label="Progress Tier 1" color={T.p600} />
      </div>

      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
              {['Code', 'Nama Field', 'Metode', 'Nilai', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={f.fieldCode}
                style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = T.c100)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, fontWeight: 700, color: T.p600 }}>{f.fieldCode}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{f.fieldName}</div>
                  {f.isComplex && <Badge variant="info" style={{ marginTop: 4, fontSize: 9 }}>★ Complex</Badge>}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontSize: 12, color: T.g500 }}>{f.collectionMethod === 'SURVEY' ? 'Survei' : f.collectionMethod === 'OBSERVATION' ? 'Observasi' : f.collectionMethod === 'RESEARCH' ? 'Riset' : f.collectionMethod}</span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: f.status === 'VALIDATED' ? T.g700 : T.g500, maxWidth: 220 }}>
                  {formatFieldValue(f)}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <Badge variant={f.status === 'VALIDATED' ? 'active' : 'seeding'} style={{ fontSize: 10 }}>
                    {f.status === 'VALIDATED' ? 'Tervalidasi' : f.status === 'PENDING' ? 'Pending' : f.status}
                  </Badge>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setFormBuilderField(f)} style={{
                      background: f.status === 'VALIDATED' ? T.c200 : T.p100, border: 'none', borderRadius: 7,
                      padding: '6px 12px', fontSize: 11, fontWeight: 600,
                      color: f.status === 'VALIDATED' ? T.g500 : T.p600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      {f.status === 'VALIDATED' ? 'Edit' : 'Submit'}
                    </button>
                    {f.isComplex && (
                      <button onClick={() => setFormBuilderField(f)} style={{
                        background: T.e100, border: 'none', borderRadius: 7, padding: '6px 10px',
                        fontSize: 11, fontWeight: 600, color: T.e600, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Globe size={11} color={T.e600} /> Buat Form
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormBuilderModal({ field, onClose }: { field: FieldData; onClose: () => void }) {
  const questions = field.isComplex
    ? [
        { id: 1, text: `Berapa maksimal yang bersedia kamu bayar untuk kategori ${field.fieldName}?`, type: 'range' },
        { id: 2, text: 'Seberapa sering kamu mengunjungi tempat F&B di area ini?', type: 'choice' },
        { id: 3, text: 'Apa metode pembayaran yang paling sering kamu gunakan?', type: 'choice' },
      ]
    : [
        { id: 1, text: 'Kapan jam ramai pengunjung di area ini menurut pengamatanmu?', type: 'choice' },
        { id: 2, text: 'Apakah ada catatan tambahan untuk data ini?', type: 'text' },
      ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: T.c50, borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(26,26,26,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>Form Builder</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>
              Template untuk field:{' '}
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700, color: T.p600 }}>{field.fieldCode}</span>
              {' — '}{field.fieldName}
            </div>
          </div>
          <button onClick={onClose} style={{ background: T.c200, border: 'none', borderRadius: 8, padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={T.g700} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pertanyaan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions.map((q, i) => (
                <div key={q.id} style={{ background: T.c100, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.c50 }}>{i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.g900, lineHeight: 1.5 }}>{q.text}</div>
                    <Badge variant={q.type === 'range' ? 'info' : q.type === 'choice' ? 'active' : 'neutral'} style={{ fontSize: 10, marginTop: 6 }}>
                      {q.type === 'range' ? 'Skala / Angka' : q.type === 'choice' ? 'Pilihan Ganda' : 'Teks Bebas'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: T.p100, borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, marginBottom: 8 }}>Persyaratan Responden (dari LOKAL)</div>
            {[
              'Minimum 20 responden per field survei',
              'Mix demografis: min. 2 dari 3 kelompok usia',
              'Maks. 70% dari jaringan primermu sendiri',
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: T.p600, marginBottom: 4 }}>
                <Check size={13} color={T.p600} style={{ flexShrink: 0, marginTop: 1 }} />{r}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Simpan & Tutup</Button>
        </div>
      </div>
    </div>
  );
}
