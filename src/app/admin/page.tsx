'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  MapPin,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DashboardData {
  clusters: {
    total: number;
    seeding: number;
    active: number;
  };
  fields: {
    total: number;
    validated: number;
    pending: number;
    rejected: number;
  };
  sessions: {
    total: number;
    totalRevenueIdrx: number;
  };
  recentActivity: Array<{
    id: string;
    clusterName: string;
    fieldCode: string;
    fieldName: string;
    solTxSignature: string | null;
    validatedAt: string | null;
  }>;
}

function formatRupiah(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  return `Rp ${n.toLocaleString('id')}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)}h lalu`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('Gagal memuat dashboard');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
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
    );
  }

  if (error || !data) {
    return (
      <div
        style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}
      >
        <div style={{ fontSize: 16, color: T.danger }}>
          {error || 'Data tidak tersedia'}
        </div>
      </div>
    );
  }

  const { clusters, fields, sessions, recentActivity } = data;

  const stats = [
    {
      icon: <MapPin size={18} color={T.p600} />,
      label: 'Total Cluster',
      value: clusters.total,
      sub: `${clusters.active} aktif · ${clusters.seeding} seeding`,
    },
    {
      icon: <FileText size={18} color={T.p600} />,
      label: 'Field Tervalidasi',
      value: fields.validated,
      sub: `${fields.pending} pending review`,
    },
    {
      icon: <LayoutDashboard size={18} color={T.p600} />,
      label: 'Pending Review',
      value: fields.pending,
      sub: 'butuh validasi admin',
    },
    {
      icon: <DollarSign size={18} color={T.p600} />,
      label: 'Total Revenue',
      value: formatRupiah(sessions.totalRevenueIdrx),
      sub: `${sessions.total} sesi berbayar`,
    },
  ];

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
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.g900,
            letterSpacing: '-0.01em',
          }}
        >
          Admin Dashboard
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          Ringkasan kesehatan platform LOKAL.
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
        }}
      >
        {/* Recent Activity Feed */}
        <div
          style={{
            background: T.c50,
            border: `1px solid ${T.c200}`,
            borderRadius: 16,
            padding: '22px',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.g900,
              marginBottom: 16,
            }}
          >
            Aktivitas Validasi Terbaru
          </div>
          {recentActivity.length === 0 ? (
            <div
              style={{
                fontSize: 13,
                color: T.g500,
                padding: '20px 0',
                textAlign: 'center',
              }}
            >
              Belum ada aktivitas validasi.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentActivity.map((a, i) => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  isLast={i === recentActivity.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Status Panel */}
        <div
          style={{
            background: T.c50,
            border: `1px solid ${T.c200}`,
            borderRadius: 16,
            padding: '22px',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.g900,
              marginBottom: 16,
            }}
          >
            Status Platform
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Cluster Status */}
            <StatusItem
              label="Cluster Aktif"
              value={clusters.active}
              max={clusters.total}
              color={T.p600}
            />
            <StatusItem
              label="Field Tervalidasi"
              value={fields.validated}
              max={fields.total}
              color={T.success}
            />
            <StatusItem
              label="Pending Review"
              value={fields.pending}
              max={fields.total}
              color={T.warning}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              padding: '14px',
              background: T.p100,
              borderRadius: 12,
              border: `1px solid ${T.p600}15`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.p600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 6,
              }}
            >
              Total Revenue
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: T.p600,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {formatRupiah(sessions.totalRevenueIdrx)}
            </div>
            <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>
              dari {sessions.total} sesi berbayar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.c50,
        border: `1px solid ${T.c200}`,
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 24px rgba(26,26,26,0.08)'
          : 'none',
        cursor: 'default',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: T.p100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: T.g900,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: T.g500, marginTop: 4 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  activity,
  isLast,
}: {
  activity: DashboardData['recentActivity'][0];
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '14px 0',
        borderBottom: isLast ? 'none' : `1px solid ${T.c200}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: T.p100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FileText size={16} color={T.p600} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: T.g700,
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {activity.clusterName} —{' '}
          <span
            style={{
              fontFamily: 'var(--font-mono), monospace',
              color: T.p600,
              fontWeight: 700,
            }}
          >
            {activity.fieldCode}
          </span>{' '}
          {activity.fieldName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: T.g500,
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Badge variant="success" style={{ fontSize: 9 }}>
            VALIDATED
          </Badge>
          <span>{timeAgo(activity.validatedAt)}</span>
          {activity.solTxSignature && (
            <a
              href={`https://explorer.solana.com/tx/${activity.solTxSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                color: T.p600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontWeight: 600,
              }}
            >
              View tx <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontSize: 12,
          color: T.g500,
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: T.g900 }}>
          {value}/{max}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: T.c200,
          borderRadius: 9999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 9999,
            transition: 'width 600ms ease',
          }}
        />
      </div>
    </div>
  );
}
