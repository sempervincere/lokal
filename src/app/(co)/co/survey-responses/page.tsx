'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter, Loader2, AlertTriangle, Check,
  Users, ShoppingBag, Store, BarChart3, Compass,
  MapPin, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { SurveyReviewTable } from '@/components/survey/co/SurveyReviewTable';
import { SURVEY_FIELDS, SURVEY_CATEGORIES, isBulkAcceptField } from '@/lib/constants/survey-fields';
import { T } from '@/lib/constants/mock-data';

interface FieldStats {
  fieldCode: string;
  fieldName: string;
  category: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  canBulkAccept: boolean;
  rejectionRate: number;
  thresholdExceeded: boolean;
}

interface ClusterInfo {
  id: string;
  slug: string;
  name: string;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  DEMOGRAPHIC: <Users size={15} />,
  BEHAVIOURAL: <ShoppingBag size={15} />,
  MARKET: <Store size={15} />,
  MARKET_SIGNAL: <BarChart3 size={15} />,
  CULTURAL: <Compass size={15} />,
};

const CATEGORY_ACCENT: Record<string, string> = {
  DEMOGRAPHIC: '#5B8BA0',
  BEHAVIOURAL: '#C17A5F',
  MARKET: '#2A9D82',
  MARKET_SIGNAL: '#D4A03D',
  CULTURAL: '#1B7A65',
};

const S = {
  card: { background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.c50, background: T.p600, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.p600, background: T.p100, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  sectionTitle: { fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 } as React.CSSProperties,
};

export default function COSurveyResponsesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlClusterSlug = searchParams.get('cluster');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [cluster, setCluster] = useState<ClusterInfo | null>(null);
  const [_surveyLink, setSurveyLink] = useState<string>('');
  const [fieldStats, setFieldStats] = useState<FieldStats[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [bulkAccepting, setBulkAccepting] = useState<string | null>(null);

  // Fetch data when cluster changes
  useEffect(() => {
    setLoading(true);
    const slugParam = urlClusterSlug ? `?clusterSlug=${encodeURIComponent(urlClusterSlug)}` : '';
    fetch(`/api/co/survey-responses${slugParam}`)
      .then(async (res) => { if (!res.ok) throw new Error('Gagal memuat data'); return res.json(); })
      .then((data) => {
        setClusters(data.clusters || []);
        setCluster(data.cluster);
        setSurveyLink(data.surveyLink);
        setFieldStats(data.stats.fields || []);
        // Auto-select first pending field
        const firstPending = data.stats.fields?.find((f: FieldStats) => f.pending > 0);
        if (firstPending) setSelectedField(firstPending.fieldCode);
        else if (data.stats.fields?.length > 0) setSelectedField(data.stats.fields[0].fieldCode);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [urlClusterSlug]);

  useEffect(() => {
    if (!selectedField || !cluster) { setResponses([]); return; }
    setLoadingResponses(true);
    const slugParam = cluster.slug ? `&clusterSlug=${encodeURIComponent(cluster.slug)}` : '';
    fetch(`/api/co/survey-responses?fieldCode=${selectedField}&status=${filterStatus}${slugParam}`)
      .then(async (res) => { if (!res.ok) throw new Error('Gagal memuat respon'); return res.json(); })
      .then((data) => setResponses(data.responses || []))
      .catch(() => setResponses([]))
      .finally(() => setLoadingResponses(false));
  }, [selectedField, filterStatus, cluster]);

  const switchCluster = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('cluster', slug);
    router.push(`/co/survey-responses?${params.toString()}`);
  }, [router, searchParams]);

  const handleBulkAccept = useCallback(async (fieldCode: string) => {
    setBulkAccepting(fieldCode);
    try {
      const slugParam = cluster?.slug ? `?clusterSlug=${encodeURIComponent(cluster.slug)}` : '';
      const res = await fetch('/api/co/survey-responses/bulk-accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldCode, clusterSlug: cluster?.slug }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Gagal bulk accept'); }
      const data = await res.json();
      // Refresh stats
      const statsRes = await fetch(`/api/co/survey-responses${slugParam}`);
      const statsData = await statsRes.json();
      setFieldStats(statsData.stats.fields || []);
      if (selectedField === fieldCode) {
        const respRes = await fetch(`/api/co/survey-responses?fieldCode=${fieldCode}&status=${filterStatus}${slugParam}`);
        const respData = await respRes.json();
        setResponses(respData.responses || []);
      }
      alert(`Berhasil! ${data.acceptedCount} respon diterima.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setBulkAccepting(null);
    }
  }, [selectedField, filterStatus, cluster]);

  const handleReviewResponse = useCallback(async (responseId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      const res = await fetch(`/api/co/survey-responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectReason: reason }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Gagal update respon'); }
      const slugParam = cluster?.slug ? `?clusterSlug=${encodeURIComponent(cluster.slug)}` : '';
      const statsRes = await fetch(`/api/co/survey-responses${slugParam}`);
      const statsData = await statsRes.json();
      setFieldStats(statsData.stats.fields || []);
      if (selectedField) {
        const respRes = await fetch(`/api/co/survey-responses?fieldCode=${selectedField}&status=${filterStatus}${slugParam}`);
        const respData = await respRes.json();
        setResponses(respData.responses || []);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  }, [selectedField, filterStatus, cluster]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${T.c200}`, borderTopColor: T.p600, borderRadius: '50%', animation: 'lokal-spin 800ms linear infinite' }} />
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <MapPin size={32} color={T.p600} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.g900, marginBottom: 8 }}>
            Belum Punya Cluster
          </div>
          <div style={{ fontSize: 13, color: T.g500, lineHeight: 1.6, marginBottom: 24 }}>
            Kamu perlu memiliki cluster terlebih dahulu untuk mengelola respon survei.
            Ajukan proposal cluster dan tunggu persetujuan admin.
          </div>
          <button
            onClick={() => router.push('/co/dashboard/clusters')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', borderRadius: 9999, border: 'none',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              color: T.c50, background: T.p600, cursor: 'pointer',
              transition: 'all 150ms', boxShadow: '0 2px 8px rgba(27,122,101,0.25)',
            }}
          >
            <MapPin size={16} /> Ajukan Cluster Sekarang
          </button>
        </div>
      </div>
    );
  }

  const selectedFieldDef = SURVEY_FIELDS.find(f => f.code === selectedField);
  const selectedFieldStats = fieldStats.find(f => f.fieldCode === selectedField);

  // Build tabs list: real clusters + placeholder for visualization
  const allTabs: ClusterInfo[] = clusters.length > 1
    ? clusters
    : [
        cluster,
        { id: 'placeholder-1', slug: 'jakarta-kemang-001', name: 'Kemang' },
        { id: 'placeholder-2', slug: 'bsd-raya-001', name: 'BSD Raya' },
      ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {/* Cluster Switcher Tabs — always visible */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {allTabs.map((c) => {
            const isActive = c.slug === cluster.slug;
            const isPlaceholder = c.id.startsWith('placeholder');
            const pendingCount = fieldStats
              .filter(f => {
                const sf = SURVEY_FIELDS.find(s => s.code === f.fieldCode);
                return sf?.category;
              })
              .reduce((sum, f) => sum + f.pending, 0);
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
                  boxShadow: isActive ? '0 2px 8px rgba(27,122,101,0.25)' : `inset 0 0 0 1px ${isPlaceholder ? T.c200 : T.c200}`,
                  opacity: isPlaceholder ? 0.6 : 1,
                }}
              >
                <MapPin size={14} />
                <span>{c.name}</span>
                {!isActive && !isPlaceholder && pendingCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                    background: isActive ? 'rgba(255,255,255,0.25)' : T.warning + '15',
                    color: isActive ? '#fff' : T.warning,
                  }}>
                    {pendingCount}
                  </span>
                )}
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

      {/* Cluster name + filter row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>{cluster.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color={T.g500} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ fontSize: 13, background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 9, padding: '7px 12px', fontFamily: 'inherit', color: T.g900, outline: 'none', cursor: 'pointer' }}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Diterima</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Two-column layout: Field Selector | Review Panel */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Column — Field Selector */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Pilih Data Field</h3>

          {/* Category groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {SURVEY_CATEGORIES.map((category) => {
              const categoryFields = fieldStats.filter(f => f.category === category.id);
              if (categoryFields.length === 0) return null;
              const accent = CATEGORY_ACCENT[category.id] || T.p600;
              return (
                <div key={category.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <span style={{ color: accent, display: 'flex', alignItems: 'center' }}>
                      {CATEGORY_ICON[category.id]}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {category.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {categoryFields.map((field) => {
                      const isSelected = selectedField === field.fieldCode;
                      const hasPending = field.pending > 0;
                      return (
                        <button
                          key={field.fieldCode}
                          onClick={() => setSelectedField(field.fieldCode)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                            fontFamily: 'inherit', border: 'none', cursor: 'pointer', transition: 'all 150ms',
                            background: isSelected ? accent : hasPending ? '#fff' : T.c50,
                            color: isSelected ? '#fff' : hasPending ? accent : T.g500,
                            boxShadow: isSelected ? `0 2px 6px ${accent}40` : hasPending ? `inset 0 0 0 1.5px ${accent}` : `inset 0 0 0 1px ${T.c200}`,
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>{field.fieldCode}</span>
                          {hasPending && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 9999,
                              background: isSelected ? 'rgba(255,255,255,0.25)' : accent + '15',
                              color: isSelected ? '#fff' : accent,
                            }}>
                              {field.pending}
                            </span>
                          )}
                          {field.thresholdExceeded && (
                            <AlertTriangle size={13} color={isSelected ? '#fff' : T.warning} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column — Review Panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedField && selectedFieldStats && (
            <>
              {/* Field Detail Card */}
              <div style={{ ...S.card, padding: '22px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: T.g900, marginBottom: 6, lineHeight: 1.4 }}>
                      {selectedFieldDef?.question || selectedField}
                    </h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.g500, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontWeight: 600, color: T.g700 }}>{selectedFieldStats.total}</span> total
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.warning }} />
                        <span style={{ fontWeight: 600, color: T.warning }}>{selectedFieldStats.pending}</span> pending
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />
                        <span style={{ fontWeight: 600, color: T.success }}>{selectedFieldStats.approved}</span> diterima
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.danger }} />
                        <span style={{ fontWeight: 600, color: T.danger }}>{selectedFieldStats.rejected}</span> ditolak
                      </span>
                    </div>
                  </div>

                  {selectedFieldStats.canBulkAccept && selectedFieldStats.pending > 0 && (
                    <button
                      onClick={() => handleBulkAccept(selectedField)}
                      disabled={bulkAccepting === selectedField}
                      style={{ ...S.btnSecondary, opacity: bulkAccepting === selectedField ? 0.6 : 1, cursor: bulkAccepting === selectedField ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                    >
                      {bulkAccepting === selectedField ? (
                        <><Loader2 size={14} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
                      ) : (
                        <><Check size={14} />Terima Semua ({selectedFieldStats.pending})</>
                      )}
                    </button>
                  )}
                </div>

                {selectedFieldStats.thresholdExceeded && (
                  <div style={{ background: `${T.warning}12`, border: `1px solid ${T.warning}30`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <AlertTriangle size={18} color={T.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.g900 }}>Peringatan: Tingkat penolakan tinggi</p>
                      <p style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>Tingkat penolakan melebihi 15%. Keputusan penolakan akan di-review oleh admin.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Responses Table */}
              {loadingResponses ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                  <div style={{ width: 36, height: 36, border: `3px solid ${T.c200}`, borderTopColor: T.p600, borderRadius: '50%', animation: 'lokal-spin 800ms linear infinite' }} />
                </div>
              ) : (
                <SurveyReviewTable
                  fieldCode={selectedField}
                  responses={responses}
                  onReview={handleReviewResponse}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
