'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle,
  Filter, Search, ChevronDown, ChevronUp, Eye, Check, X,
  BarChart3, Users, ArrowRight, Loader2, MapPin, FileText,
  TrendingUp, AlertOctagon,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SURVEY_FIELDS, SURVEY_CATEGORIES } from '@/lib/constants/survey-fields';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface ClusterOption {
  id: string;
  name: string;
  slug: string;
}

interface FieldStat {
  fieldCode: string;
  fieldName: string;
  category: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  rejectionRate: number;
  thresholdExceeded: boolean;
  canBulkAccept: boolean;
}

interface Respondent {
  wallet: string;
  email: string | null;
  submittedAt: string;
}

interface ResponseItem {
  id: string;
  fieldCode: string;
  fieldName: string;
  category: string;
  value: any;
  coStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  coRejectReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  canBulkAccept: boolean;
  respondent: Respondent;
  cluster: { id: string; name: string; slug: string };
}

interface StatsSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  fieldsOverThreshold: number;
}

interface FilterState {
  clusterId: string;
  fieldCode: string;
  status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  search: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminSurveyAuditPage() {
  // Data state
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [fieldStats, setFieldStats] = useState<FieldStat[]>([]);
  const [clusters, setClusters] = useState<ClusterOption[]>([]);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [filters, setFilters] = useState<FilterState>({
    clusterId: '',
    fieldCode: '',
    status: 'ALL',
    search: '',
  });
  const [selectedFieldForStats, setSelectedFieldForStats] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailResponse, setDetailResponse] = useState<ResponseItem | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  /* ── Fetch data ───────────────────────────────────────────────────────── */

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (filters.clusterId) params.set('clusterId', filters.clusterId);
      if (filters.fieldCode) params.set('fieldCode', filters.fieldCode);
      if (filters.status !== 'ALL') params.set('status', filters.status);

      const res = await fetch(`/api/admin/survey-responses?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();

      setStats(data.stats);
      setFieldStats(data.fieldStats);
      setClusters(data.clusters);
      setResponses(data.responses);
      setPagination(data.pagination);
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  /* ── Actions ──────────────────────────────────────────────────────────── */

  async function handleReview(responseId: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/admin/survey-responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Gagal');
      }
      setBanner({ type: 'success', message: action === 'APPROVE' ? 'Respon diterima.' : 'Respon ditolak.' });
      fetchData(pagination.page);
      setReviewingId(null);
      setReviewAction(null);
      setReviewReason('');
    } catch (e: any) {
      setBanner({ type: 'error', message: e.message || 'Gagal update status' });
    } finally {
      setReviewLoading(false);
    }
  }

  function openDetail(response: ResponseItem) {
    setDetailResponse(response);
    setDetailModalOpen(true);
  }

  function openReview(response: ResponseItem, action: 'APPROVE' | 'REJECT') {
    setReviewingId(response.id);
    setReviewAction(action);
    setReviewReason(response.coRejectReason || '');
  }

  /* ── Derived state ────────────────────────────────────────────────────── */

  const filteredResponses = useMemo(() => {
    if (!filters.search.trim()) return responses;
    const q = filters.search.toLowerCase();
    return responses.filter(r =>
      r.fieldCode.toLowerCase().includes(q) ||
      r.fieldName.toLowerCase().includes(q) ||
      r.respondent.wallet.toLowerCase().includes(q) ||
      (r.respondent.email?.toLowerCase().includes(q)) ||
      String(r.value).toLowerCase().includes(q) ||
      r.cluster.name.toLowerCase().includes(q)
    );
  }, [responses, filters.search]);

  const categoryColor: Record<string, string> = {
    DEMOGRAPHIC: '#5B8BA0',
    BEHAVIOURAL: '#C17A5F',
    MARKET: '#2A9D82',
    MARKET_SIGNAL: '#D4A03D',
    CULTURAL: '#1B7A65',
    UNKNOWN: T.g500,
  };

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
          Survey Response Audit
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          Audit dan override keputusan review survey oleh Cluster Owner. Threshold penolakan: 15%.
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div style={{
          background: banner.type === 'success' ? '#ECFDF5' : '#FEE2E2',
          border: `1px solid ${banner.type === 'success' ? T.success + '30' : T.danger + '30'}`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {banner.type === 'success' ? <CheckCircle2 size={18} color={T.success} /> : <AlertTriangle size={18} color={T.danger} />}
          <span style={{ fontSize: 13, fontWeight: 600, color: T.g900, flex: 1 }}>{banner.message}</span>
          <button onClick={() => setBanner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g500 }}><X size={16} /></button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard icon={<FileText size={18} color={T.p600} />} label="Total Respon" value={stats.total} color={T.p600} bg={T.p100} />
          <StatCard icon={<Clock size={18} color={T.warning} />} label="Pending" value={stats.pending} color={T.warning} bg="#FEF3C7" />
          <StatCard icon={<CheckCircle2 size={18} color={T.success} />} label="Diterima" value={stats.approved} color={T.success} bg="#D1FAE5" />
          <StatCard icon={<XCircle size={18} color={T.danger} />} label="Ditolak" value={stats.rejected} color={T.danger} bg="#FEE2E2" />
          <StatCard icon={<AlertOctagon size={18} color="#E5493A" />} label="Field >15% Reject" value={stats.fieldsOverThreshold} color="#E5493A" bg="#FEE2E2" highlight={stats.fieldsOverThreshold > 0} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color={T.g500} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Cari field, wallet, email, atau nilai..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
              fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
            }}
          />
        </div>
        <select
          value={filters.clusterId}
          onChange={e => setFilters(f => ({ ...f, clusterId: e.target.value }))}
          style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', cursor: 'pointer', minWidth: 160 }}
        >
          <option value="">Semua Cluster</option>
          {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filters.fieldCode}
          onChange={e => setFilters(f => ({ ...f, fieldCode: e.target.value }))}
          style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', cursor: 'pointer', minWidth: 180 }}
        >
          <option value="">Semua Field</option>
          {SURVEY_FIELDS.map(f => <option key={f.code} value={f.code}>{f.code} — {f.question}</option>)}
        </select>
        <div style={{ display: 'flex', background: T.c100, borderRadius: 10, padding: 3, gap: 3, border: `1px solid ${T.c200}` }}>
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilters(f => ({ ...f, status: s }))}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: filters.status === s ? 700 : 600,
                cursor: 'pointer', background: filters.status === s ? '#fff' : 'transparent', color: filters.status === s ? T.p600 : T.g500,
                boxShadow: filters.status === s ? '0 1px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 150ms',
              }}
            >
              {s === 'ALL' ? 'Semua' : s === 'PENDING' ? 'Pending' : s === 'APPROVED' ? 'Diterima' : 'Ditolak'}
            </button>
          ))}
        </div>
      </div>

      {/* Field Stats Cards */}
      {fieldStats.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} color={T.p600} />
            Statistik per Field
            {selectedFieldForStats && (
              <button
                onClick={() => { setSelectedFieldForStats(null); setFilters(f => ({ ...f, fieldCode: '' })); }}
                style={{ marginLeft: 'auto', fontSize: 11, color: T.p600, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Reset filter
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {fieldStats.map(fs => {
              const isSelected = selectedFieldForStats === fs.fieldCode;
              return (
                <div
                  key={fs.fieldCode}
                  onClick={() => {
                    setSelectedFieldForStats(isSelected ? null : fs.fieldCode);
                    setFilters(f => ({ ...f, fieldCode: isSelected ? '' : fs.fieldCode }));
                  }}
                  style={{
                    padding: '16px 18px', borderRadius: 14, border: `1.5px solid ${isSelected ? T.p600 : fs.thresholdExceeded ? T.danger + '40' : T.c200}`,
                    background: isSelected ? T.p100 : fs.thresholdExceeded ? '#FEF2F2' : T.c50, cursor: 'pointer',
                    transition: 'all 150ms', boxShadow: isSelected ? '0 2px 8px rgba(27,122,101,0.12)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: categoryColor[fs.category] || T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{fs.category}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginTop: 2 }}>{fs.fieldCode} — {fs.fieldName}</div>
                    </div>
                    {fs.thresholdExceeded && <AlertTriangle size={16} color={T.danger} />}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <StatPill label="Total" value={fs.total} />
                    <StatPill label="Pending" value={fs.pending} color={T.warning} />
                    <StatPill label="Diterima" value={fs.approved} color={T.success} />
                    <StatPill label="Ditolak" value={fs.rejected} color={T.danger} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: T.c200, borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{
                        width: `${fs.rejectionRate * 100}%`, height: '100%',
                        background: fs.thresholdExceeded ? T.danger : T.p600, borderRadius: 9999,
                        transition: 'width 300ms ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: fs.thresholdExceeded ? T.danger : T.g500, minWidth: 40, textAlign: 'right' }}>
                      {(fs.rejectionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  {fs.thresholdExceeded && (
                    <div style={{ fontSize: 11, color: T.danger, marginTop: 6, fontWeight: 600 }}>
                      Threshold 15% terlampui — perlu audit
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Responses Table */}
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color={T.p600} />
            Daftar Respon
            <span style={{ fontSize: 12, color: T.g500, fontWeight: 600 }}>({pagination.total})</span>
          </div>
          <div style={{ fontSize: 12, color: T.g500 }}>
            Halaman {pagination.page} dari {pagination.totalPages}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center', color: T.danger, fontSize: 14 }}>
            <AlertTriangle size={24} style={{ margin: '0 auto 12px' }} />
            {error}
          </div>
        ) : filteredResponses.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.c100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={24} color={T.g500} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Tidak ada respon</div>
            <div style={{ fontSize: 13, color: T.g500 }}>Tidak ada survey response yang cocok dengan filter saat ini.</div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '100px 140px 1fr 100px 120px 200px',
              gap: 12, padding: '12px 20px', background: T.c100, borderBottom: `1px solid ${T.c200}`,
            }}>
              {['Field', 'Cluster', 'Jawaban / Responden', 'Status', 'Review CO', 'Aksi Admin'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
              ))}
            </div>

            {/* Table Body */}
            {filteredResponses.map((response, idx) => (
              <div
                key={response.id}
                onClick={() => openDetail(response)}
                style={{
                  display: 'grid', gridTemplateColumns: '100px 140px 1fr 100px 120px 200px', gap: 12,
                  padding: '14px 20px', alignItems: 'flex-start',
                  borderBottom: idx < filteredResponses.length - 1 ? `1px solid ${T.c200}` : 'none',
                  background: idx % 2 === 0 ? 'transparent' : T.c100,
                  cursor: 'pointer', transition: 'background 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.p100; }}
                onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : T.c100; }}
              >
                {/* Field */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: categoryColor[response.category] || T.g500 }}>{response.fieldCode}</div>
                  <div style={{ fontSize: 11, color: T.g500, marginTop: 2, lineHeight: 1.3 }}>{response.fieldName}</div>
                </div>

                {/* Cluster */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.g900, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} color={T.g500} />
                    {response.cluster.name}
                  </div>
                </div>

                {/* Value + Respondent */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.g700, lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {formatValue(response.value)}
                  </div>
                  <div style={{ fontSize: 11, color: T.g500, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono), monospace' }}>{truncateWallet(response.respondent.wallet)}</span>
                    {response.respondent.email && <span>· {response.respondent.email}</span>}
                    <span>· {new Date(response.respondent.submittedAt).toLocaleDateString('id', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {response.coRejectReason && (
                    <div style={{ marginTop: 6, padding: '8px 10px', background: `${T.danger}08`, borderRadius: 8, border: `1px solid ${T.danger}15` }}>
                      <span style={{ fontSize: 11, color: T.danger }}>Catatan CO: {response.coRejectReason}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={response.coStatus} />
                </div>

                {/* Review info */}
                <div>
                  {response.reviewedAt ? (
                    <span style={{ fontSize: 11, color: T.g500 }}>
                      {new Date(response.reviewedAt).toLocaleDateString('id', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: T.warning, fontWeight: 600 }}>Belum direview</span>
                  )}
                </div>

                {/* Admin Actions */}
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {reviewingId === response.id && reviewAction === 'REJECT' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                      <textarea
                        value={reviewReason}
                        onChange={e => setReviewReason(e.target.value)}
                        placeholder="Alasan penolakan admin..."
                        rows={2}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${T.c200}`,
                          fontFamily: 'inherit', fontSize: 12, color: T.g900, resize: 'none', outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleReview(response.id, 'REJECT', reviewReason)}
                          disabled={!reviewReason.trim() || reviewLoading}
                          style={{
                            flex: 1, padding: '7px 12px', borderRadius: 8, border: 'none',
                            fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#fff', background: T.danger,
                            cursor: !reviewReason.trim() || reviewLoading ? 'not-allowed' : 'pointer',
                            opacity: !reviewReason.trim() || reviewLoading ? 0.6 : 1,
                          }}
                        >
                          {reviewLoading ? <Loader2 size={12} style={{ animation: 'lokal-spin 800ms linear infinite' }} /> : <X size={12} />}
                          Tolak
                        </button>
                        <button
                          onClick={() => { setReviewingId(null); setReviewAction(null); }}
                          style={{ padding: '7px 12px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.g500, background: T.c200, cursor: 'pointer' }}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReview(response.id, 'APPROVE')}
                        disabled={reviewLoading}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8,
                          border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.p600, background: T.p100,
                          cursor: reviewLoading ? 'not-allowed' : 'pointer', opacity: reviewLoading ? 0.5 : 1, transition: 'all 150ms',
                        }}
                      >
                        <Check size={12} /> Terima
                      </button>
                      <button
                        onClick={() => openReview(response, 'REJECT')}
                        disabled={reviewLoading}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8,
                          border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.danger, background: `${T.danger}12`,
                          cursor: reviewLoading ? 'not-allowed' : 'pointer', opacity: reviewLoading ? 0.5 : 1, transition: 'all 150ms',
                        }}
                      >
                        <X size={12} /> Tolak
                      </button>
                      <button
                        onClick={() => openDetail(response)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8,
                          border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.g500, background: T.c200,
                          cursor: 'pointer', transition: 'all 150ms',
                        }}
                      >
                        <Eye size={12} /> Detail
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: `1px solid ${T.c200}` }}>
            <button
              onClick={() => fetchData(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              style={{
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.c200}`, background: '#fff',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.g700, cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1,
              }}
            >
              Sebelumnya
            </button>
            <span style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: T.g900 }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchData(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              style={{
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.c200}`, background: '#fff',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.g700, cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
              }}
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailModalOpen && detailResponse && (
        <DetailModal
          response={detailResponse}
          onClose={() => setDetailModalOpen(false)}
          onReview={handleReview}
          categoryColor={categoryColor}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon, label, value, color, bg, highlight = false }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: '18px 16px', borderRadius: 14, background: bg, border: `1.5px solid ${highlight ? color : 'transparent'}`,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value.toLocaleString('id')}</div>
    </div>
  );
}

function StatPill({ label, value, color = T.g500 }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, color: T.g500 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: '#D1FAE5', color: T.success }}><CheckCircle2 size={10} />Diterima</span>;
  if (status === 'REJECTED') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: '#FEE2E2', color: T.danger }}><XCircle size={10} />Ditolak</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: T.c200, color: T.g500 }}><Clock size={10} />Pending</span>;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toLocaleString('id');
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') {
    if (value.kopi || value.makanan || value.teh || value.minuman) {
      return Object.entries(value)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}: Rp ${(v as number).toLocaleString('id')}`)
        .join(', ');
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function truncateWallet(wallet: string) {
  return `${wallet.slice(0, 5)}...${wallet.slice(-4)}`;
}

function DetailModal({
  response,
  onClose,
  onReview,
  categoryColor,
}: {
  response: ResponseItem;
  onClose: () => void;
  onReview: (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => Promise<void>;
  categoryColor: Record<string, string>;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(26,26,26,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.c50, borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: `1px solid ${T.c200}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: categoryColor[response.category] || T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{response.category}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginTop: 2 }}>{response.fieldCode} — {response.fieldName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g500, padding: 4 }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Value */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Jawaban Responden</div>
            <div style={{ padding: '14px 16px', background: '#fff', borderRadius: 12, border: `1.5px solid ${T.c200}`, fontSize: 14, color: T.g900, lineHeight: 1.6, wordBreak: 'break-word' }}>
              {formatValue(response.value)}
            </div>
          </div>

          {/* Respondent info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InfoItem label="Wallet" value={response.respondent.wallet} mono />
            <InfoItem label="Email" value={response.respondent.email || '—'} />
            <InfoItem label="Cluster" value={response.cluster.name} />
            <InfoItem label="Dikirim" value={new Date(response.respondent.submittedAt).toLocaleString('id-ID')} />
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fff', borderRadius: 12, border: `1.5px solid ${T.c200}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.g500 }}>Status CO:</span>
            <StatusBadge status={response.coStatus} />
            {response.reviewedAt && (
              <span style={{ fontSize: 11, color: T.g500, marginLeft: 'auto' }}>
                Direview: {new Date(response.reviewedAt).toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {response.coRejectReason && (
            <div style={{ padding: '12px 14px', background: '#FEF2F2', borderRadius: 12, border: `1.5px solid ${T.danger}30` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, marginBottom: 4 }}>Catatan Penolakan CO</div>
              <div style={{ fontSize: 13, color: T.g700, lineHeight: 1.5 }}>{response.coRejectReason}</div>
            </div>
          )}

          {/* Admin Actions */}
          {rejecting ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: T.g700 }}>Alasan Penolakan Admin <span style={{ color: T.danger }}>*</span></label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Jelaskan alasan penolakan..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
                  fontFamily: 'inherit', fontSize: 13, color: T.g900, resize: 'vertical', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={async () => {
                    setLoading(true);
                    await onReview(response.id, 'REJECT', reason);
                    setLoading(false);
                    setRejecting(false);
                    onClose();
                  }}
                  disabled={!reason.trim() || loading}
                  style={{
                    flex: 1, padding: '10px 18px', borderRadius: 9999, border: 'none',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff', background: T.danger,
                    cursor: !reason.trim() || loading ? 'not-allowed' : 'pointer',
                    opacity: !reason.trim() || loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Memproses...' : 'Tolak Respon'}
                </button>
                <button
                  onClick={() => setRejecting(false)}
                  style={{ padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${T.c200}`, background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: T.g700, cursor: 'pointer' }}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={async () => {
                  setLoading(true);
                  await onReview(response.id, 'APPROVE');
                  setLoading(false);
                  onClose();
                }}
                disabled={loading}
                style={{
                  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 9999, border: 'none',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff', background: T.success,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                }}
              >
                <Check size={14} /> Terima Respon
              </button>
              <button
                onClick={() => setRejecting(true)}
                disabled={loading}
                style={{
                  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${T.danger}`,
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.danger, background: 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                }}
              >
                <X size={14} /> Tolak Respon
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, fontFamily: mono ? 'var(--font-mono), monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
    </div>
  );
}
