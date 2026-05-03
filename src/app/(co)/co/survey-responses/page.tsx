'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Loader2, AlertTriangle, Check } from 'lucide-react';
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

const S = {
  card: { background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.c50, background: T.p600, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.p600, background: T.p100, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  btnDanger: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.c50, background: T.danger, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  sectionTitle: { fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 } as React.CSSProperties,
};

export default function COSurveyResponsesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cluster, setCluster] = useState<any>(null);
  const [_surveyLink, setSurveyLink] = useState<string>('');
  const [fieldStats, setFieldStats] = useState<FieldStats[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [bulkAccepting, setBulkAccepting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/co/survey-responses')
      .then(async (res) => { if (!res.ok) throw new Error('Gagal memuat data'); return res.json(); })
      .then((data) => {
        setCluster(data.cluster);
        setSurveyLink(data.surveyLink);
        setFieldStats(data.stats.fields || []);
        const firstPending = data.stats.fields?.find((f: FieldStats) => f.pending > 0);
        if (firstPending) setSelectedField(firstPending.fieldCode);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedField) { setResponses([]); return; }
    setLoadingResponses(true);
    fetch(`/api/co/survey-responses?fieldCode=${selectedField}&status=${filterStatus}`)
      .then(async (res) => { if (!res.ok) throw new Error('Gagal memuat respon'); return res.json(); })
      .then((data) => setResponses(data.responses || []))
      .catch(() => setResponses([]))
      .finally(() => setLoadingResponses(false));
  }, [selectedField, filterStatus]);

  const handleBulkAccept = useCallback(async (fieldCode: string) => {
    setBulkAccepting(fieldCode);
    try {
      const res = await fetch('/api/co/survey-responses/bulk-accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldCode }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Gagal bulk accept'); }
      const data = await res.json();
      const statsRes = await fetch('/api/co/survey-responses');
      const statsData = await statsRes.json();
      setFieldStats(statsData.stats.fields || []);
      if (selectedField === fieldCode) {
        const respRes = await fetch(`/api/co/survey-responses?fieldCode=${fieldCode}&status=${filterStatus}`);
        const respData = await respRes.json();
        setResponses(respData.responses || []);
      }
      alert(`Berhasil! ${data.acceptedCount} respon diterima.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setBulkAccepting(null);
    }
  }, [selectedField, filterStatus]);

  const handleReviewResponse = useCallback(async (responseId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      const res = await fetch(`/api/co/survey-responses/${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectReason: reason }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Gagal update respon'); }
      const statsRes = await fetch('/api/co/survey-responses');
      const statsData = await statsRes.json();
      setFieldStats(statsData.stats.fields || []);
      if (selectedField) {
        const respRes = await fetch(`/api/co/survey-responses?fieldCode=${selectedField}&status=${filterStatus}`);
        const respData = await respRes.json();
        setResponses(respData.responses || []);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  }, [selectedField, filterStatus]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${T.c200}`, borderTopColor: T.p600, borderRadius: '50%', animation: 'lokal-spin 800ms linear infinite' }} />
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: T.danger }}>{error || 'Cluster tidak ditemukan'}</p>
      </div>
    );
  }

  const selectedFieldDef = SURVEY_FIELDS.find(f => f.code === selectedField);
  const selectedFieldStats = fieldStats.find(f => f.fieldCode === selectedField);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em', marginBottom: 4 }}>Review Survey Responses</h1>
        <p style={{ fontSize: 13, color: T.g500 }}>{cluster.name}</p>
      </div>

      {/* Field Selection */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={S.sectionTitle}>Pilih Data Field</h2>
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

        {/* Category groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {SURVEY_CATEGORIES.map((category) => {
            const categoryFields = fieldStats.filter(f => f.category === category.id);
            if (categoryFields.length === 0) return null;
            return (
              <div key={category.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 14 }}>{category.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{category.label}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categoryFields.map((field) => {
                    const isSelected = selectedField === field.fieldCode;
                    const hasPending = field.pending > 0;
                    return (
                      <button
                        key={field.fieldCode}
                        onClick={() => setSelectedField(field.fieldCode)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                          fontFamily: 'inherit', border: 'none', cursor: 'pointer', transition: 'all 150ms',
                          background: isSelected ? T.p600 : hasPending ? '#fff' : T.c50,
                          color: isSelected ? '#fff' : hasPending ? T.p600 : T.g500,
                          boxShadow: isSelected ? '0 2px 8px rgba(27,122,101,0.2)' : hasPending ? `inset 0 0 0 1.5px ${T.p600}` : `inset 0 0 0 1px ${T.c200}`,
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>{field.fieldCode}</span>
                        {hasPending && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                            background: isSelected ? 'rgba(255,255,255,0.2)' : T.p100,
                            color: isSelected ? '#fff' : T.p600,
                          }}>
                            {field.pending}
                          </span>
                        )}
                        {field.thresholdExceeded && (
                          <AlertTriangle size={14} color={isSelected ? '#fff' : T.warning} />
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

      {/* Selected field details */}
      {selectedField && selectedFieldStats && (
        <div>
          <div style={{ ...S.card, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>
                  {selectedFieldDef?.question || selectedField}
                </h3>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: T.g500, flexWrap: 'wrap' }}>
                  <span>{selectedFieldStats.total} total</span>
                  <span style={{ color: T.c200 }}>•</span>
                  <span style={{ color: T.warning, fontWeight: 600 }}>{selectedFieldStats.pending} pending</span>
                  <span style={{ color: T.c200 }}>•</span>
                  <span style={{ color: T.success, fontWeight: 600 }}>{selectedFieldStats.approved} diterima</span>
                  <span style={{ color: T.c200 }}>•</span>
                  <span style={{ color: T.danger, fontWeight: 600 }}>{selectedFieldStats.rejected} ditolak</span>
                </div>
              </div>

              {selectedFieldStats.canBulkAccept && selectedFieldStats.pending > 0 && (
                <button
                  onClick={() => handleBulkAccept(selectedField)}
                  disabled={bulkAccepting === selectedField}
                  style={{ ...S.btnSecondary, opacity: bulkAccepting === selectedField ? 0.6 : 1, cursor: bulkAccepting === selectedField ? 'not-allowed' : 'pointer' }}
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
        </div>
      )}
    </div>
  );
}
