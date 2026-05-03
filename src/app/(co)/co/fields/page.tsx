'use client';

import { useEffect, useState } from 'react';
import { Link2, Copy, Check, Users, ExternalLink, ClipboardList, Eye, Search, BarChart3, MapPin, ShieldCheck } from 'lucide-react';
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
  id: string;
  fieldCode: string;
  fieldName: string;
  collectionMethod: string;
  isComplex: boolean;
  isSurveyField: boolean;
  status: string;
  value: unknown;
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

  useEffect(() => {
    setLoading(true);
    const slugParam = urlClusterSlug ? `?clusterSlug=${encodeURIComponent(urlClusterSlug)}` : '';
    fetch(`/api/co/fields${slugParam}`)
      .then(r => { if (!r.ok) throw new Error('Gagal memuat'); return r.json(); })
      .then(data => {
        setFields(data.fields);
        setClusters(data.clusters || []);
        setClusterSlug(data.clusterSlug);
        setSurveyLink(data.surveyLink || '');

        // Calculate survey stats
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
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', position: 'relative', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
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

      {/* Fields Section */}
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
    </div>
  );
}
