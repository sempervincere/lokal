'use client';

import { useState } from 'react';
import { Globe, X, Check, Link2 } from 'lucide-react';
import { T, CO_FIELDS } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';

type FieldEntry = typeof CO_FIELDS[0];

// Demo cluster slug — will be dynamic when API is ready (T-14)
const CLUSTER_SLUG = 'depok-margonda-001';

export default function COFieldsPage() {
  const [filter, setFilter] = useState('all');
  const [formBuilderField, setFormBuilderField] = useState<FieldEntry | null>(null);
  const [surveyLinkCopied, setSurveyLinkCopied] = useState(false);

  const validated = CO_FIELDS.filter(f => f.status === 'VALIDATED').length;
  const filtered = filter === 'all' ? CO_FIELDS : CO_FIELDS.filter(f => f.status === filter);

  const surveyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/survey/${CLUSTER_SLUG}`
    : `https://lokal.id/survey/${CLUSTER_SLUG}`;

  function copySurveyLink() {
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setSurveyLinkCopied(true);
      setTimeout(() => setSurveyLinkCopied(false), 2000);
    });
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', position: 'relative' }}>
      {formBuilderField && <FormBuilderModal field={formBuilderField} onClose={() => setFormBuilderField(null)} />}

      {/* ── Single survey link banner ─────────────────────────────────── */}
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
          <div style={{ fontSize: 13, color: T.g500 }}>{validated}/20 field tervalidasi</div>
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
              <tr key={f.code}
                style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = T.c100)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, fontWeight: 700, color: T.p600 }}>{f.code}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{f.name}</div>
                  {f.complex && <Badge variant="info" style={{ marginTop: 4, fontSize: 9 }}>★ Complex</Badge>}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontSize: 12, color: T.g500 }}>{f.complex ? 'Survei' : 'Observasi'}</span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: f.status === 'VALIDATED' ? T.g700 : T.g500, maxWidth: 180 }}>
                  {f.value}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <Badge variant={f.status === 'VALIDATED' ? 'active' : 'seeding'} style={{ fontSize: 10 }}>
                    {f.status === 'VALIDATED' ? 'Tervalidasi' : 'Pending'}
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
                    {f.complex && (
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

function FormBuilderModal({ field, onClose }: { field: FieldEntry; onClose: () => void }) {
  const questions = field.complex
    ? [
        { id: 1, text: `Berapa maksimal yang bersedia kamu bayar untuk kategori ${field.name}?`, type: 'range' },
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
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>Form Builder</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>
              Template untuk field:{' '}
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700, color: T.p600 }}>{field.code}</span>
              {' — '}{field.name}
            </div>
          </div>
          <button onClick={onClose} style={{ background: T.c200, border: 'none', borderRadius: 8, padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={T.g700} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Questions */}
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

          {/* Respondent requirements */}
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

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Simpan & Tutup</Button>
        </div>
      </div>
    </div>
  );
}
