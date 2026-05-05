'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link2, Copy, Check, Users, ExternalLink, ClipboardList, Eye, Search, BarChart3, MapPin, ShieldCheck, Plus, X, Loader2, ImageIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter, useSearchParams } from 'next/navigation';

interface SurveyResponses {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface FieldData {
  id: string | null;
  fieldCode: string;
  fieldName: string;
  collectionMethod: string;
  isComplex: boolean;
  isSurveyField: boolean;
  status: string;
  value: unknown;
  evidencePhotoUrl: string | null;
  evidenceNote: string | null;
  surveyResponses: SurveyResponses;
  canBulkAccept: boolean;
}

interface ClusterInfo {
  id: string;
  slug: string;
  name: string;
}

const METHOD_ICON: Record<string, React.ReactNode> = {
  SURVEY: <ClipboardList size={14} color={T.p600} />,
  OBSERVATION: <Eye size={14} color={T.info} />,
  RESEARCH: <Search size={14} color={T.warning} />,
};

const METHOD_LABEL: Record<string, string> = {
  SURVEY: 'Survei',
  OBSERVATION: 'Observasi',
  RESEARCH: 'Riset',
};

function formatFieldValue(field: FieldData): string {
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
        return (agg.topCompetitors as Array<{ name: string }>).slice(0, 3).map(c => c.name).join(', ');
      }
    }

    // Legacy format handling
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlClusterSlug = searchParams.get('cluster');

  const [fields, setFields] = useState<FieldData[]>([]);
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [clusterSlug, setClusterSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [surveyLink, setSurveyLink] = useState('');
  const [surveyLinkCopied, setSurveyLinkCopied] = useState(false);
  const [surveyStats, setSurveyStats] = useState({
    totalResponses: 0,
    pendingCount: 0,
    approvedCount: 0,
  });

  // Submission modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Lock container scroll + auto-scroll to top when submit modal opens
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (submitModalOpen) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      el.style.overflow = 'hidden';
    } else {
      el.style.overflow = 'auto';
    }
    return () => { el.style.overflow = 'auto'; };
  }, [submitModalOpen]);

  const fetchData = useCallback(() => {
    setLoading(true);
    const slugParam = urlClusterSlug ? `?clusterSlug=${encodeURIComponent(urlClusterSlug)}` : '';
    fetch(`/api/co/fields${slugParam}`)
      .then(r => { if (!r.ok) throw new Error('Gagal memuat'); return r.json(); })
      .then(data => {
        setFields(data.fields);
        setClusters(data.clusters || []);
        setClusterSlug(data.clusterSlug);
        setSurveyLink(data.surveyLink || '');

        const totalResponses = data.fields.reduce((sum: number, f: FieldData) =>
          sum + (f.surveyResponses?.total || 0), 0) / 15;
        const pendingCount = data.fields.reduce((sum: number, f: FieldData) =>
          sum + (f.surveyResponses?.pending || 0), 0);
        const approvedCount = data.fields.reduce((sum: number, f: FieldData) =>
          sum + (f.surveyResponses?.approved || 0), 0);

        setSurveyStats({
          totalResponses: Math.round(totalResponses),
          pendingCount,
          approvedCount,
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [urlClusterSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function copySurveyLink() {
    navigator.clipboard.writeText(surveyLink).then(() => {
      setSurveyLinkCopied(true);
      setTimeout(() => setSurveyLinkCopied(false), 2000);
    });
  }

  const switchCluster = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('cluster', slug);
    router.push(`/co/fields?${params.toString()}`);
  };

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

  // Build tabs list: real clusters + placeholder for visualization
  const activeCluster = clusterSlug ? clusters.find(c => c.slug === clusterSlug) || clusters[0] : clusters[0];
  const allTabs: ClusterInfo[] = clusters.length > 1
    ? clusters
    : activeCluster
      ? [
          activeCluster,
          { id: 'placeholder-1', slug: 'jakarta-kemang-001', name: 'Kemang' },
          { id: 'placeholder-2', slug: 'bsd-raya-001', name: 'BSD Raya' },
        ]
      : [];

  return (
    <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', position: 'relative', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {/* Cluster Switcher Tabs — always visible */}
      {allTabs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allTabs.map((c) => {
              const isActive = c.slug === clusterSlug;
              const isPlaceholder = c.id.startsWith('placeholder');
              return (
                <button
                  key={c.slug}
                  onClick={() => !isPlaceholder && switchCluster(c.slug)}
                  disabled={isPlaceholder}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    fontFamily: 'inherit', border: 'none', cursor: isPlaceholder ? 'not-allowed' : 'pointer', transition: 'all 150ms',
                    background: isActive ? T.p600 : isPlaceholder ? T.c100 : '#fff',
                    color: isActive ? '#fff' : isPlaceholder ? T.g500 : T.g700,
                    boxShadow: isActive ? '0 2px 8px rgba(27,122,101,0.25)' : `inset 0 0 0 1px ${T.c200}`,
                    opacity: isPlaceholder ? 0.6 : 1,
                  }}
                >
                  <MapPin size={14} />
                  <span>{c.name}</span>
                  {isActive && <ShieldCheck size={14} style={{ opacity: 0.8 }} />}
                  {isPlaceholder && (
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: T.c200, color: T.g500 }}>
                      SOON
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Survey Link Section */}
      {surveyLink && (
        <div style={{
          background: T.p100, border: `1px solid ${T.p600}22`, borderRadius: 14,
          padding: '16px 20px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.p600, marginBottom: 4 }}>
                Link Survey Cluster
              </div>
              <div style={{
                fontSize: 12, color: T.g500, fontFamily: 'var(--font-mono), monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {surveyLink}
              </div>
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

          {/* Survey Stats */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color={T.p600} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>{surveyStats.totalResponses}</div>
                <div style={{ fontSize: 11, color: T.g500 }}>Total Responden</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: T.warning + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.warning }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>{surveyStats.pendingCount}</div>
                <div style={{ fontSize: 11, color: T.g500 }}>Pending Review</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={16} color={T.success} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>{surveyStats.approvedCount}</div>
                <div style={{ fontSize: 11, color: T.g500 }}>Diterima</div>
              </div>
            </div>

            {surveyStats.pendingCount > 0 && (
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (clusterSlug) params.set('cluster', clusterSlug);
                  router.push(`/co/survey-responses?${params.toString()}`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  background: T.e600, color: T.c50, marginLeft: 'auto', transition: 'background 200ms',
                }}
              >
                <ExternalLink size={14} color={T.c50} />
                Review Survey ({surveyStats.pendingCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fields Section Header */}
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

      {/* Submit Data Button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => { setSubmitModalOpen(true); setSubmitSuccess(null); setSubmitError(null); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            color: T.c50, background: T.p600, cursor: 'pointer',
            transition: 'all 150ms',
          }}
        >
          <Plus size={16} />
          Submit Data Field
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ProgressBar value={validated} max={20} label="Progress Tier 1" color={T.p600} />
      </div>

      {/* Fields Table */}
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
              {['Code', 'Nama Field', 'Metode', 'Nilai', 'Status', 'Survey'].map(h => (
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
                  {f.isSurveyField && (
                    <Badge variant="info" style={{ marginTop: 4, fontSize: 9 }}>Survey</Badge>
                  )}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.g500 }}>
                    {METHOD_ICON[f.collectionMethod] || <BarChart3 size={14} color={T.g500} />}
                    {METHOD_LABEL[f.collectionMethod] || f.collectionMethod}
                  </span>
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
                  {f.isSurveyField && f.surveyResponses ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: T.g500 }}>
                        {f.surveyResponses.total} respon
                      </span>
                      {f.surveyResponses.pending > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: T.warning,
                          background: T.warning + '15', padding: '2px 6px', borderRadius: 4,
                        }}>
                          {f.surveyResponses.pending} pending
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: T.g500 }}>CO isi</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submission Modal */}
      {submitModalOpen && (
        <SubmitFieldModal
          fields={fields}
          onClose={() => setSubmitModalOpen(false)}
          onSuccess={(msg) => {
            setSubmitSuccess(msg);
            setSubmitModalOpen(false);
            fetchData();
          }}
          onError={(msg) => setSubmitError(msg)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Submit Field Modal
   ═══════════════════════════════════════════════════════════════════════════ */

interface SubmitFieldModalProps {
  fields: FieldData[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function SubmitFieldModal({ fields, onClose, onSuccess, onError }: SubmitFieldModalProps) {
  // Only non-survey fields that are PENDING or don't exist yet
  const submittableFields = fields.filter(f =>
    !f.isSurveyField && f.status !== 'VALIDATED'
  );

  const [selectedCode, setSelectedCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');

  // Dynamic value state per field type
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryRows, setCategoryRows] = useState<{ category: string; value: string }[]>([]);

  const selectedField = submittableFields.find(f => f.fieldCode === selectedCode);

  function resetForm() {
    setTextValue('');
    setNumberValue('');
    setTextareaValue('');
    setTags([]);
    setTagInput('');
    setCategoryRows([]);
    setEvidenceNote('');
    setEvidencePhotoUrl('');
  }

  function getPayloadValue(): any {
    if (!selectedField) return null;
    const code = selectedField.fieldCode;

    switch (code) {
      case 'B3':
        return { peak_hours: textValue, note: evidenceNote };
      case 'M1':
        return {
          by_category: Object.fromEntries(
            categoryRows.filter(r => r.category.trim()).map(r => [r.category, { count: parseInt(r.value) || 0 }])
          ),
          total_outlets: categoryRows.reduce((sum, r) => sum + (parseInt(r.value) || 0), 0),
        };
      case 'M2':
        return {
          by_category: Object.fromEntries(
            categoryRows.filter(r => r.category.trim()).map(r => [r.category, { avg: parseInt(r.value) || 0 }])
          ),
        };
      case 'M3':
        return { competitors: tags.map(name => ({ name })) };
      case 'M4':
        return { overall: parseInt(numberValue) || 0 };
      case 'M5':
        return { cases: [{ story: textareaValue, date: new Date().toISOString() }] };
      case 'MS1':
        return { hourly_peak: parseInt(numberValue) || 0 };
      case 'MS2':
        return { primary_gap: textValue };
      case 'C2':
        return { lag_weeks: parseInt(numberValue) || 0 };
      case 'C4':
        return { score: parseInt(numberValue) || 0 };
      case 'C5':
        return { points: tags.map(name => ({ name })) };
      default:
        return textValue;
    }
  }

  async function handleSubmit() {
    if (!selectedField) return;
    const value = getPayloadValue();
    if (value === null || value === undefined || value === '') {
      onError('Nilai field wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/co/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldCode: selectedField.fieldCode,
          value,
          evidenceNote: evidenceNote || undefined,
          evidencePhotoUrl: evidencePhotoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal submit');
      onSuccess(`Field ${selectedField.fieldCode} berhasil disubmit!`);
    } catch (e: any) {
      onError(e.message || 'Gagal submit field');
    } finally {
      setSubmitting(false);
    }
  }

  function addTag() {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  function addCategoryRow() {
    setCategoryRows([...categoryRows, { category: '', value: '' }]);
  }

  function updateCategoryRow(index: number, field: 'category' | 'value', val: string) {
    const updated = [...categoryRows];
    updated[index][field] = val;
    setCategoryRows(updated);
  }

  function removeCategoryRow(index: number) {
    setCategoryRows(categoryRows.filter((_, i) => i !== index));
  }

  // Determine input type based on field code
  function renderFieldInput() {
    if (!selectedField) return null;
    const code = selectedField.fieldCode;

    // Number fields (1-10 rating)
    if (code === 'M4' || code === 'C4') {
      return (
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
            Rating (1–10) <span style={{ color: T.danger }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="range"
              min={1}
              max={10}
              value={numberValue || 5}
              onChange={(e) => setNumberValue(e.target.value)}
              style={{ flex: 1, accentColor: T.p600 }}
            />
            <span style={{ fontSize: 18, fontWeight: 800, color: T.p600, minWidth: 32, textAlign: 'center' }}>
              {numberValue || 5}
            </span>
          </div>
          <div style={{ fontSize: 11, color: T.g500, marginTop: 4 }}>
            {code === 'M4' ? '1 = sangat tidak padat, 10 = sangat padat' : '1 = sangat buruk, 10 = sangat baik'}
          </div>
        </div>
      );
    }

    // Number fields (count)
    if (code === 'MS1') {
      return (
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
            Estimasi orang per jam (peak) <span style={{ color: T.danger }}>*</span>
          </label>
          <input
            type="number"
            value={numberValue}
            onChange={(e) => setNumberValue(e.target.value)}
            placeholder="Contoh: 120"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
              fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
            }}
          />
        </div>
      );
    }

    // Number fields (weeks)
    if (code === 'C2') {
      return (
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
            Lag dari Jakarta (minggu) <span style={{ color: T.danger }}>*</span>
          </label>
          <input
            type="number"
            value={numberValue}
            onChange={(e) => setNumberValue(e.target.value)}
            placeholder="Contoh: 4"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
              fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
            }}
          />
        </div>
      );
    }

    // Textarea (long text)
    if (code === 'M5') {
      return (
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
            Cerita / Kasus Penutupan <span style={{ color: T.danger }}>*</span>
          </label>
          <textarea
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Ceritakan kasus penutupan bisnis F&B di area ini..."
            rows={4}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
              fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none', resize: 'vertical',
            }}
          />
        </div>
      );
    }

    // Tag input (list of items)
    if (code === 'M3' || code === 'C5') {
      return (
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
            {code === 'M3' ? 'Daftar Kompetitor' : 'Daftar Anchor Points'} <span style={{ color: T.danger }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder={code === 'M3' ? 'Nama kompetitor...' : 'Nama tempat...'}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
                fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              onClick={addTag}
              style={{
                padding: '10px 16px', borderRadius: 10, border: 'none',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.c50, background: T.p600, cursor: 'pointer',
              }}
            >
              Tambah
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {tags.map(tag => (
              <span key={tag} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 8, background: T.p100, color: T.p600,
                fontSize: 12, fontWeight: 600,
              }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.p600, padding: 0, display: 'flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Category table (M1, M2)
    if (code === 'M1' || code === 'M2') {
      return (
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
            {code === 'M1' ? 'Jumlah Outlet per Subkategori' : 'Harga Rata-rata per Subkategori'} <span style={{ color: T.danger }}>*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {categoryRows.map((row, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={row.category}
                  onChange={(e) => updateCategoryRow(idx, 'category', e.target.value)}
                  placeholder="Subkategori (e.g., Kopi)"
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${T.c200}`,
                    fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
                  }}
                />
                <input
                  type="number"
                  value={row.value}
                  onChange={(e) => updateCategoryRow(idx, 'value', e.target.value)}
                  placeholder={code === 'M1' ? 'Jumlah' : 'Harga (Rp)'}
                  style={{
                    width: 120, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${T.c200}`,
                    fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
                  }}
                />
                <button onClick={() => removeCategoryRow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger, padding: 4 }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addCategoryRow}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8, border: `1.5px dashed ${T.p600}`,
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.p600, background: 'transparent', cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Tambah Baris
          </button>
        </div>
      );
    }

    // Default text input
    return (
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
          Nilai <span style={{ color: T.danger }}>*</span>
        </label>
        <input
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Masukkan nilai..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
            fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.c50, borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: `1px solid ${T.c200}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>Submit Data Field</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>Isi data observasi atau riset untuk cluster ini</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g500, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Field Selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
              Pilih Field <span style={{ color: T.danger }}>*</span>
            </label>
            <select
              value={selectedCode}
              onChange={(e) => { setSelectedCode(e.target.value); resetForm(); }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
                fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Pilih field...</option>
              {submittableFields.map(f => (
                <option key={f.fieldCode} value={f.fieldCode}>
                  {f.fieldCode} — {f.fieldName} ({METHOD_LABEL[f.collectionMethod]})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Input */}
          {selectedCode && renderFieldInput()}

          {/* Evidence Note */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
              Catatan Evidence
            </label>
            <textarea
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              placeholder="Jelaskan bagaimana data ini dikumpulkan..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
                fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          {/* Evidence Photo — placeholder */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
              Foto Evidence
            </label>
            <div
              style={{
                padding: '24px 20px', borderRadius: 12, border: `1.5px dashed ${T.c200}`,
                background: T.c100, textAlign: 'center', cursor: 'not-allowed', opacity: 0.7,
              }}
            >
              <ImageIcon size={28} color={T.g500} style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: T.g500 }}>Upload Gambar</div>
              <div style={{ fontSize: 11, color: T.g500, marginTop: 4 }}>Fitur upload akan tersedia segera</div>
            </div>
          </div>

          {/* Evidence Photo URL (optional manual input) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
              URL Foto (opsional)
            </label>
            <input
              type="text"
              value={evidencePhotoUrl}
              onChange={(e) => setEvidencePhotoUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
                fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedCode}
              style={{
                flex: 1, padding: '10px 18px', borderRadius: 9999, border: 'none',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff', background: T.p600,
                cursor: submitting || !selectedCode ? 'not-allowed' : 'pointer',
                opacity: submitting || !selectedCode ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <><Loader2 size={14} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
              ) : (
                <>Submit Field</>
              )}
            </button>
            <button
              onClick={onClose}
              style={{ padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${T.c200}`, background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: T.g700, cursor: 'pointer' }}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
