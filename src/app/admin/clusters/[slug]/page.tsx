'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertTriangle,
  X,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { formatFieldValue } from '@/lib/utils/formatFieldValue';

interface ClusterDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  anchorLabel: string;
  anchorLat: number;
  anchorLng: number;
  radiusKm: number;
  status: 'SEEDING' | 'ACTIVE' | 'DEPRECATED';
  dataCompleteness: number;
  confidenceScore: number;
  totalValidatedFields: number;
  onchainSlug: string | null;
  createdAt: string;
  owner: {
    user: {
      fullName: string;
      email: string;
    };
  } | null;
  fieldValues: Array<{
    id: string;
    fieldCode: string;
    fieldName: string;
    category: string;
    collectionMethod: string;
    isComplex: boolean;
    value: unknown;
    status: 'PENDING' | 'VALIDATED' | 'REJECTED';
    evidenceNote: string | null;
    fieldHash: string | null;
    solTxSignature: string | null;
    submittedAt: string;
    validatedAt: string | null;
  }>;
}

export default function AdminClusterDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [cluster, setCluster] = useState<ClusterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/admin/clusters/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Gagal memuat cluster');
        return r.json();
      })
      .then((data) => setCluster(data.cluster))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <div style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ background: '#FEE2E2', border: `1px solid ${T.danger}30`, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} color={T.danger} />
          <span style={{ fontSize: 14, color: T.danger }}>{error || 'Cluster tidak ditemukan'}</span>
        </div>
      </div>
    );
  }

  const validated = cluster.fieldValues.filter((f) => f.status === 'VALIDATED').length;
  const pending = cluster.fieldValues.filter((f) => f.status === 'PENDING').length;
  const rejected = cluster.fieldValues.filter((f) => f.status === 'REJECTED').length;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 32px',
        animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Back link */}
      <a
        href="/admin/clusters"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: T.p600,
          textDecoration: 'none',
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={15} /> Kembali ke Cluster List
      </a>

      {/* Cluster Header Card */}
      <div
        style={{
          background: T.c50,
          border: `1px solid ${T.c200}`,
          borderRadius: 16,
          padding: '24px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: T.p100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MapPin size={26} color={T.p600} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: T.g900, margin: 0, letterSpacing: '-0.01em' }}>
                  {cluster.name}
                </h1>
                <Badge variant={cluster.status === 'ACTIVE' ? 'active' : 'seeding'}>
                  {cluster.status}
                </Badge>
                {cluster.onchainSlug && (
                  <span style={{ fontSize: 11, color: T.p600, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={11} /> On-chain
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: T.g500, marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono), monospace' }}>{cluster.slug}</span>
                <span style={{ margin: '0 8px' }}>·</span>
                {cluster.anchorLabel}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Confidence Score
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: cluster.confidenceScore >= 65 ? T.success : cluster.confidenceScore >= 40 ? T.warning : T.danger,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {cluster.confidenceScore}
              <span style={{ fontSize: 14, color: T.g500, marginLeft: 2 }}>/100</span>
            </div>
          </div>
        </div>

        {cluster.description && (
          <p style={{ fontSize: 13, color: T.g700, marginTop: 14, lineHeight: 1.6 }}>
            {cluster.description}
          </p>
        )}

        <div style={{ marginTop: 18 }}>
          <ProgressBar
            value={cluster.totalValidatedFields}
            max={20}
            label={`Progress Tier 1 — ${validated} validated, ${pending} pending, ${rejected} rejected`}
            color={cluster.dataCompleteness >= 80 ? T.success : cluster.dataCompleteness >= 50 ? T.warning : T.danger}
          />
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 18, flexWrap: 'wrap' }}>
          <DetailItem label="Data Completeness" value={`${cluster.dataCompleteness}%`} />
          <DetailItem label="Total Fields" value={`${cluster.fieldValues.length}`} />
          <DetailItem label="Radius" value={`${cluster.radiusKm} km`} />
          <DetailItem label="Owner" value={cluster.owner?.user.fullName ?? '—'} />
          <DetailItem label="Owner Email" value={cluster.owner?.user.email ?? '—'} />
          <DetailItem label="Koordinat" value={`${cluster.anchorLat}, ${cluster.anchorLng}`} />
        </div>
      </div>

      {/* Field Values Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Field Values</div>
          <div style={{ fontSize: 13, color: T.g500, marginTop: 2 }}>
            {cluster.fieldValues.length} / 20 Tier 1 fields
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'All', count: cluster.fieldValues.length, color: T.g700 },
            { label: 'Validated', count: validated, color: T.success },
            { label: 'Pending', count: pending, color: T.warning },
            { label: 'Rejected', count: rejected, color: T.danger },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                borderRadius: 9999,
                background: T.c100,
                fontSize: 11,
                fontWeight: 600,
                color: s.color,
              }}
            >
              {s.label} <span style={{ color: T.g900 }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fields Table */}
      {cluster.fieldValues.length === 0 ? (
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={24} color={T.p600} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum ada field</div>
          <div style={{ fontSize: 13, color: T.g500 }}>Cluster Owner belum mengirimkan data field apapun.</div>
        </div>
      ) : (
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
                  {['Code', 'Field Name', 'Category', 'Value', 'Status', 'Evidence', 'Tx'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.g500,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cluster.fieldValues.map((field, i) => (
                  <tr
                    key={field.id}
                    style={{
                      borderBottom: i < cluster.fieldValues.length - 1 ? `1px solid ${T.c200}` : 'none',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.c100)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono), monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          color: T.p600,
                          background: T.p100,
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {field.fieldCode}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', minWidth: 180 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{field.fieldName}</div>
                      <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>
                        {field.collectionMethod} {field.isComplex && '· Complex'}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        {field.category}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: T.g700, maxWidth: 240, lineHeight: 1.5 }}>
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                        title={formatFieldValue(field)}
                      >
                        {formatFieldValue(field)}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <Badge
                        variant={
                          field.status === 'VALIDATED'
                            ? 'success'
                            : field.status === 'REJECTED'
                              ? 'danger'
                              : 'seeding'
                        }
                        style={{ fontSize: 10 }}
                      >
                        {field.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '13px 16px', maxWidth: 160 }}>
                      {field.evidenceNote && (
                        <div
                          style={{
                            fontSize: 11,
                            color: T.g500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={field.evidenceNote}
                        >
                          {field.evidenceNote}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      {field.solTxSignature ? (
                        <a
                          href={`https://explorer.solana.com/tx/${field.solTxSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 11,
                            color: T.p600,
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <CheckCircle2 size={10} /> Tx
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: T.g500 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{value}</div>
    </div>
  );
}
