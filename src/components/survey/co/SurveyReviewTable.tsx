'use client';

import { useState, useCallback } from 'react';
import { Check, X, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface SurveyResponse {
  id: string;
  fieldCode: string;
  value: any;
  coStatus: string;
  coRejectReason: string | null;
  reviewedAt: string | null;
  respondent: {
    wallet: string;
    email: string | null;
    submittedAt: string;
  };
  canBulkAccept: boolean;
}

interface SurveyReviewTableProps {
  fieldCode: string;
  responses: SurveyResponse[];
  onReview: (responseId: string, action: 'APPROVE' | 'REJECT', reason?: string) => Promise<void>;
}

const S = {
  card: { background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' } as React.CSSProperties,
  btnApprove: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.p600, background: T.p100, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  btnReject: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.danger, background: `${T.danger}12`, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  badge: (bg: string, color: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: bg, color: color }),
};

export function SurveyReviewTable({ fieldCode, responses, onReview }: SurveyReviewTableProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = useCallback(async (id: string) => {
    setProcessingId(id);
    try { await onReview(id, 'APPROVE'); } finally { setProcessingId(null); }
  }, [onReview]);

  const handleReject = useCallback(async (id: string) => {
    if (!rejectReason.trim()) return;
    setProcessingId(id);
    try {
      await onReview(id, 'REJECT', rejectReason);
      setRejectingId(null);
      setRejectReason('');
    } finally { setProcessingId(null); }
  }, [onReview, rejectReason]);

  const formatValue = (fieldCode: string, value: any): string => {
    if (!value) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toLocaleString('id');
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value.kopi || value.makanan || value.teh) {
        return Object.entries(value)
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}: Rp ${(v as number).toLocaleString('id')}`)
          .join(', ');
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const truncateWallet = (wallet: string) => `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  const solscanUrl = (wallet: string) => `https://solscan.io/account/${wallet}?cluster=devnet`;

  if (responses.length === 0) {
    return (
      <div style={{ ...S.card, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.c100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <MessageSquare size={20} color={T.g500} />
        </div>
        <p style={{ fontSize: 13, color: T.g500 }}>Tidak ada respon untuk filter ini</p>
      </div>
    );
  }

  return (
    <div style={S.card}>
      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 110px 180px', gap: 12, padding: '12px 20px', background: T.c100, borderBottom: `1px solid ${T.c200}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Responden</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Jawaban</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Aksi</span>
      </div>

      {/* Table body */}
      <div>
        {responses.map((response, idx) => (
          <div
            key={response.id}
            style={{
              display: 'grid', gridTemplateColumns: '180px 1fr 110px 180px', gap: 12,
              padding: '14px 20px', alignItems: 'flex-start',
              borderBottom: idx < responses.length - 1 ? `1px solid ${T.c200}` : 'none',
              background: idx % 2 === 0 ? 'transparent' : T.c100,
              transition: 'background 150ms',
            }}
          >
            {/* Respondent */}
            <div>
              <a
                href={solscanUrl(response.respondent.wallet)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.p600, textDecoration: 'none', fontFamily: 'var(--font-mono), monospace' }}
              >
                {truncateWallet(response.respondent.wallet)}
                <ExternalLink size={12} />
              </a>
              {response.respondent.email && (
                <p style={{ fontSize: 11, color: T.g500, marginTop: 3 }}>{response.respondent.email}</p>
              )}
              <p style={{ fontSize: 11, color: T.g500, marginTop: 3 }}>
                {new Date(response.respondent.submittedAt).toLocaleDateString('id', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Value */}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, color: T.g700, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {formatValue(response.fieldCode, response.value)}
              </p>
              {response.coRejectReason && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: `${T.danger}08`, borderRadius: 8, border: `1px solid ${T.danger}15` }}>
                  <p style={{ fontSize: 11, color: T.danger, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <MessageSquare size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    {response.coRejectReason}
                  </p>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              {response.coStatus === 'APPROVED' && <span style={S.badge(T.p100, T.p600)}><Check size={10} />Diterima</span>}
              {response.coStatus === 'REJECTED' && <span style={S.badge(`${T.danger}12`, T.danger)}><X size={10} />Ditolak</span>}
              {response.coStatus === 'PENDING' && <span style={S.badge(T.c200, T.g500)}>○ Pending</span>}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {response.coStatus === 'PENDING' && (
                <>
                  {rejectingId === response.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Alasan penolakan..."
                        style={{
                          width: '100%', padding: '8px 12px', fontSize: 12, color: T.g900,
                          background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 8,
                          fontFamily: 'inherit', outline: 'none', resize: 'none', minHeight: 60,
                        }}
                        rows={2}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleReject(response.id)}
                          disabled={!rejectReason.trim() || processingId === response.id}
                          style={{
                            ...S.btnReject,
                            flex: 1,
                            justifyContent: 'center',
                            opacity: (!rejectReason.trim() || processingId === response.id) ? 0.5 : 1,
                            cursor: (!rejectReason.trim() || processingId === response.id) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {processingId === response.id ? (
                            <><Loader2 size={12} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Tolak</>
                          ) : (
                            <><X size={12} />Tolak</>
                          )}
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.g500, background: T.c200, cursor: 'pointer' }}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleApprove(response.id)}
                        disabled={processingId === response.id}
                        style={{ ...S.btnApprove, opacity: processingId === response.id ? 0.5 : 1, cursor: processingId === response.id ? 'not-allowed' : 'pointer' }}
                      >
                        {processingId === response.id ? (
                          <Loader2 size={12} style={{ animation: 'lokal-spin 800ms linear infinite' }} />
                        ) : (
                          <Check size={12} />
                        )}
                        Terima
                      </button>
                      <button
                        onClick={() => setRejectingId(response.id)}
                        disabled={processingId === response.id}
                        style={{ ...S.btnReject, opacity: processingId === response.id ? 0.5 : 1, cursor: processingId === response.id ? 'not-allowed' : 'pointer' }}
                      >
                        <X size={12} />
                        Tolak
                      </button>
                    </div>
                  )}
                </>
              )}
              {response.coStatus !== 'PENDING' && response.reviewedAt && (
                <span style={{ fontSize: 11, color: T.g500 }}>
                  {new Date(response.reviewedAt).toLocaleDateString('id', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
