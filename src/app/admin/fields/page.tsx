'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Check,
  X,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatFieldValue } from '@/lib/utils/formatFieldValue';
import { TIER_1_FIELDS } from '@/lib/constants/field';

interface ClusterOption {
  id: string;
  name: string;
}

interface FieldRecord {
  id: string;
  clusterId: string;
  fieldCode: string;
  fieldName: string;
  category: string;
  collectionMethod: string;
  isComplex: boolean;
  value: unknown;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  evidenceNote: string | null;
  evidencePhotoUrl: string | null;
  fieldHash: string | null;
  solTxSignature: string | null;
  submittedAt: string;
  validatedAt: string | null;
  cluster: {
    id: string;
    name: string;
    slug: string;
    owner: {
      user: {
        fullName: string;
      };
    } | null;
  };
}

interface ActionResult {
  type: 'success' | 'error' | 'warning';
  message: string;
  txSignature?: string | null;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua', color: T.g700 },
  { value: 'PENDING', label: 'Pending', color: T.warning },
  { value: 'VALIDATED', label: 'Validated', color: T.success },
  { value: 'REJECTED', label: 'Rejected', color: T.danger },
];

const METHOD_LABEL: Record<string, string> = {
  SURVEY: 'Survei',
  OBSERVATION: 'Observasi',
  RESEARCH: 'Riset',
};

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<FieldRecord[]>([]);
  const [clusters, setClusters] = useState<ClusterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [clusterFilter, setClusterFilter] = useState('all');
  const [fieldCodeFilter, setFieldCodeFilter] = useState('all');

  // Banner state
  const [banner, setBanner] = useState<ActionResult | null>(null);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingField, setRejectingField] = useState<FieldRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Validate loading state per field
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (clusterFilter !== 'all') params.set('clusterId', clusterFilter);
      if (fieldCodeFilter !== 'all') params.set('fieldCode', fieldCodeFilter);
      params.set('sort', 'submittedAt');
      params.set('order', 'desc');

      const res = await fetch(`/api/admin/fields?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat data field');
      const data = await res.json();
      setFields(data.fields || []);
      setClusters(data.clusters || []);
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, clusterFilter, fieldCodeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-dismiss banner after 6s
  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

  async function handleValidate(field: FieldRecord) {
    setValidatingId(field.id);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId: field.id, action: 'APPROVE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Validasi gagal');

      if (data.anchorWarning) {
        setBanner({
          type: 'warning',
          message: `Field ${field.fieldCode} divalidasi, tapi anchor Solana gagal: ${data.anchorWarning}`,
          txSignature: data.field?.solTxSignature,
        });
      } else {
        setBanner({
          type: 'success',
          message: `Field ${field.fieldCode} berhasil divalidasi & di-anchor di Solana.`,
          txSignature: data.field?.solTxSignature,
        });
      }
      fetchData();
    } catch (e: any) {
      setBanner({
        type: 'error',
        message: e.message || 'Validasi gagal',
      });
    } finally {
      setValidatingId(null);
    }
  }

  function openRejectModal(field: FieldRecord) {
    setRejectingField(field);
    setRejectReason('');
    setRejectModalOpen(true);
  }

  async function handleRejectConfirm() {
    if (!rejectingField) return;
    if (!rejectReason.trim()) {
      setBanner({
        type: 'error',
        message: 'Alasan penolakan wajib diisi.',
      });
      return;
    }

    setRejectLoading(true);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId: rejectingField.id,
          action: 'REJECT',
          rejectReason: rejectReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Penolakan gagal');

      setBanner({
        type: 'success',
        message: `Field ${rejectingField.fieldCode} berhasil ditolak.`,
      });
      setRejectModalOpen(false);
      setRejectingField(null);
      fetchData();
    } catch (e: any) {
      setBanner({
        type: 'error',
        message: e.message || 'Penolakan gagal',
      });
    } finally {
      setRejectLoading(false);
    }
  }

  const filteredCount = fields.length;
  const pendingCount = fields.filter((f) => f.status === 'PENDING').length;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 32px',
        animation:
          'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          Header
          ═══════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.g900,
            letterSpacing: '-0.01em',
          }}
        >
          Field Review Queue
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          Review dan validasi data field yang dikirim oleh Cluster Owner.
          {filteredCount > 0 && (
            <span style={{ marginLeft: 8 }}>
              <span style={{ fontWeight: 700, color: T.g700 }}>
                {filteredCount}
              </span>{' '}
              field{pendingCount > 0 && (
                <span style={{ color: T.warning, fontWeight: 600 }}>
                  {' '}
                  ({pendingCount} pending)
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Inline Banner
          ═══════════════════════════════════════════════════════════════ */}
      {banner && (
        <BannerAlert
          type={banner.type}
          message={banner.message}
          txSignature={banner.txSignature}
          onClose={() => setBanner(null)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          Filter Bar
          ═══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((s) => {
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 150ms',
                  background: active ? T.p600 : T.c200,
                  color: active ? T.c50 : T.g700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {s.value !== 'all' && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: active ? T.c50 : s.color,
                    }}
                  />
                )}
                {s.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            width: 1,
            height: 24,
            background: T.c200,
            flexShrink: 0,
          }}
        />

        {/* Cluster Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color={T.g500} />
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            style={{
              fontSize: 13,
              background: '#fff',
              border: `1px solid ${T.c200}`,
              borderRadius: 9,
              padding: '7px 12px',
              fontFamily: 'inherit',
              color: T.g900,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Semua Cluster</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Field Code Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={14} color={T.g500} />
          <select
            value={fieldCodeFilter}
            onChange={(e) => setFieldCodeFilter(e.target.value)}
            style={{
              fontSize: 13,
              background: '#fff',
              border: `1px solid ${T.c200}`,
              borderRadius: 9,
              padding: '7px 12px',
              fontFamily: 'inherit',
              color: T.g900,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Semua Field</option>
            {TIER_1_FIELDS.map((f) => (
              <option key={f.code} value={f.code}>
                {f.code} — {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Table
          ═══════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
          }}
        >
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div
          style={{
            background: '#FEE2E2',
            border: `1px solid ${T.danger}30`,
            borderRadius: 14,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={18} color={T.danger} />
          <span style={{ fontSize: 14, color: T.danger }}>{error}</span>
          <button
            onClick={fetchData}
            style={{
              marginLeft: 'auto',
              fontSize: 13,
              fontWeight: 600,
              color: T.p600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Coba lagi
          </button>
        </div>
      ) : fields.length === 0 ? (
        <EmptyState
          statusFilter={statusFilter}
          onClearFilters={() => {
            setStatusFilter('all');
            setClusterFilter('all');
            setFieldCodeFilter('all');
          }}
        />
      ) : (
        <div
          style={{
            background: T.c50,
            border: `1px solid ${T.c200}`,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 900,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${T.c200}`,
                    background: T.c100,
                  }}
                >
                  {[
                    'Cluster',
                    'Field Code',
                    'Field Name',
                    'Submitted Value',
                    'Evidence',
                    'Status',
                    'Actions',
                  ].map((h) => (
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
                {fields.map((field, i) => (
                  <TableRow
                    key={field.id}
                    field={field}
                    isLast={i === fields.length - 1}
                    validatingId={validatingId}
                    onValidate={handleValidate}
                    onReject={openRejectModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          Reject Modal
          ═══════════════════════════════════════════════════════════════ */}
      <Modal
        open={rejectModalOpen}
        onClose={() => {
          if (!rejectLoading) {
            setRejectModalOpen(false);
            setRejectingField(null);
          }
        }}
        title={`Tolak Field ${rejectingField?.fieldCode ?? ''}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.g700,
                display: 'block',
                marginBottom: 6,
              }}
            >
              Alasan Penolakan <span style={{ color: T.danger }}>*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Data tidak konsisten dengan observasi lapangan..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: `1.5px solid ${rejectReason.trim() ? T.c200 : T.danger + '40'}`,
                fontFamily: 'inherit',
                fontSize: 13,
                color: T.g900,
                background: '#fff',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = T.p500;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${T.p100}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = T.c200;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {!rejectReason.trim() && (
              <div
                style={{
                  fontSize: 11,
                  color: T.danger,
                  marginTop: 4,
                }}
              >
                Wajib mengisi alasan penolakan.
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <button
              onClick={() => {
                if (!rejectLoading) {
                  setRejectModalOpen(false);
                  setRejectingField(null);
                }
              }}
              disabled={rejectLoading}
              style={{
                padding: '9px 18px',
                borderRadius: 9999,
                border: `1.5px solid ${T.c200}`,
                background: 'transparent',
                color: T.g700,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: rejectLoading ? 'not-allowed' : 'pointer',
                opacity: rejectLoading ? 0.5 : 1,
              }}
            >
              Batal
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={rejectLoading || !rejectReason.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 22px',
                borderRadius: 9999,
                border: 'none',
                background: rejectLoading ? T.danger + '80' : T.danger,
                color: T.c50,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor:
                  rejectLoading || !rejectReason.trim()
                    ? 'not-allowed'
                    : 'pointer',
                opacity: rejectLoading || !rejectReason.trim() ? 0.6 : 1,
                transition: 'all 150ms',
              }}
            >
              {rejectLoading ? (
                <>
                  <Loader2
                    size={14}
                    style={{
                      animation: 'lokal-spin 800ms linear infinite',
                    }}
                  />
                  Memproses...
                </>
              ) : (
                <>
                  <X size={14} />
                  Tolak Field
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function TableRow({
  field,
  isLast,
  validatingId,
  onValidate,
  onReject,
}: {
  field: FieldRecord;
  isLast: boolean;
  validatingId: string | null;
  onValidate: (field: FieldRecord) => void;
  onReject: (field: FieldRecord) => void;
}) {
  const isValidating = validatingId === field.id;
  const isPending = field.status === 'PENDING';

  return (
    <tr
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${T.c200}`,
        transition: 'background 150ms',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = T.c100)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = 'transparent')
      }
    >
      {/* Cluster */}
      <td style={{ padding: '14px 16px', minWidth: 160 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>
          {field.cluster.name}
        </div>
        <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>
          CO: {field.cluster.owner?.user.fullName ?? '—'}
        </div>
      </td>

      {/* Field Code */}
      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
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

      {/* Field Name */}
      <td style={{ padding: '14px 16px', minWidth: 180 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: T.g900 }}>
          {field.fieldName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: T.g500,
            marginTop: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{METHOD_LABEL[field.collectionMethod] || field.collectionMethod}</span>
          {field.isComplex && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 4,
                background: T.p100,
                color: T.p600,
              }}
            >
              COMPLEX
            </span>
          )}
        </div>
      </td>

      {/* Submitted Value */}
      <td
        style={{
          padding: '14px 16px',
          fontSize: 12,
          color: T.g700,
          maxWidth: 280,
          lineHeight: 1.5,
        }}
      >
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

      {/* Evidence */}
      <td style={{ padding: '14px 16px', minWidth: 140 }}>
        {field.evidencePhotoUrl ? (
          <a
            href={field.evidencePhotoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                overflow: 'hidden',
                border: `1px solid ${T.c200}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: T.c100,
                marginBottom: 6,
              }}
            >
              <ImageIcon size={20} color={T.g500} />
            </div>
          </a>
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              border: `1px dashed ${T.c200}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: T.c100,
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 10, color: T.g500 }}>No photo</span>
          </div>
        )}
        {field.evidenceNote && (
          <div
            style={{
              fontSize: 11,
              color: T.g500,
              maxWidth: 140,
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

      {/* Status */}
      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
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
        {field.status === 'VALIDATED' && field.solTxSignature && (
          <a
            href={`https://explorer.solana.com/tx/${field.solTxSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 10,
              color: T.p600,
              textDecoration: 'none',
              marginTop: 5,
              fontWeight: 600,
            }}
          >
            Tx <ExternalLink size={9} />
          </a>
        )}
      </td>

      {/* Actions */}
      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
        {isPending ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onValidate(field)}
              disabled={isValidating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                borderRadius: 9999,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: isValidating ? 'not-allowed' : 'pointer',
                background: isValidating ? T.success + '60' : T.success,
                color: T.c50,
                transition: 'all 150ms',
                opacity: isValidating ? 0.7 : 1,
              }}
            >
              {isValidating ? (
                <Loader2
                  size={12}
                  style={{
                    animation: 'lokal-spin 800ms linear infinite',
                  }}
                />
              ) : (
                <Check size={12} />
              )}
              {isValidating ? '...' : 'Validate'}
            </button>
            <button
              onClick={() => onReject(field)}
              disabled={isValidating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                borderRadius: 9999,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: isValidating ? 'not-allowed' : 'pointer',
                background: T.danger,
                color: T.c50,
                transition: 'all 150ms',
                opacity: isValidating ? 0.5 : 1,
              }}
            >
              <X size={12} />
              Reject
            </button>
          </div>
        ) : field.status === 'VALIDATED' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color={T.success} />
            <span style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>
              Done
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={14} color={T.danger} />
            <span style={{ fontSize: 12, color: T.danger, fontWeight: 600 }}>
              Rejected
            </span>
          </div>
        )}
      </td>
    </tr>
  );
}

function BannerAlert({
  type,
  message,
  txSignature,
  onClose,
}: {
  type: 'success' | 'error' | 'warning';
  message: string;
  txSignature?: string | null;
  onClose: () => void;
}) {
  const bg =
    type === 'success'
      ? '#ECFDF5'
      : type === 'error'
        ? '#FEE2E2'
        : '#FEF9EB';
  const border =
    type === 'success'
      ? T.success + '30'
      : type === 'error'
        ? T.danger + '30'
        : T.warning + '30';
  const color =
    type === 'success'
      ? T.success
      : type === 'error'
        ? T.danger
        : T.warning;

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        animation: 'pageEnter 200ms ease forwards',
      }}
    >
      {type === 'success' ? (
        <CheckCircle2 size={18} color={color} style={{ flexShrink: 0 }} />
      ) : type === 'error' ? (
        <AlertTriangle size={18} color={color} style={{ flexShrink: 0 }} />
      ) : (
        <AlertTriangle size={18} color={color} style={{ flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>
          {message}
        </div>
        {txSignature && (
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: T.p600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 5,
              fontWeight: 600,
            }}
          >
            <Eye size={12} />
            Lihat di Solana Explorer <ExternalLink size={10} />
          </a>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: T.g500,
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

function EmptyState({
  statusFilter,
  onClearFilters,
}: {
  statusFilter: string;
  onClearFilters: () => void;
}) {
  const isFiltered =
    statusFilter !== 'all';

  return (
    <div
      style={{
        background: T.c50,
        border: `1px solid ${T.c200}`,
        borderRadius: 16,
        padding: '48px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: T.p100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <FileText size={24} color={T.p600} />
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: T.g900,
          marginBottom: 6,
        }}
      >
        {isFiltered ? 'Tidak ada field yang cocok' : 'Tidak ada field'}
      </div>
      <div
        style={{
          fontSize: 13,
          color: T.g500,
          maxWidth: 400,
          margin: '0 auto',
          lineHeight: 1.5,
        }}
      >
        {isFiltered
          ? 'Coba ubah filter atau reset pencarian.'
          : 'Belum ada field yang dikirim oleh Cluster Owner.'}
      </div>
      {isFiltered && (
        <button
          onClick={onClearFilters}
          style={{
            marginTop: 16,
            padding: '9px 18px',
            borderRadius: 9999,
            border: 'none',
            background: T.p600,
            color: T.c50,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}
