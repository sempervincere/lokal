'use client';

import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EarningRecord {
  id: string;
  type: string;
  amountIdrx: number;
  description: string;
  createdAt: string;
  isPaid: boolean;
  paidAt: string | null;
}

interface EarningsData {
  totalIdrx: number;
  pendingIdrx: number;
  estimatedThisMonthIdrx: number;
  shareRate: number;
  shareRateLabel: string;
  perSessionIdrx: number;
  tier: { tier: number; label: string; multiplier: number };
  records: EarningRecord[];
}

const TYPE_LABELS: Record<string, string> = {
  SESSION_SHARE: 'Revenue share',
  FIELD_SUBMISSION: 'Submit field',
  REFRESH_BONUS: 'Bonus refresh',
};

function formatRupiah(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return `Rp ${n.toLocaleString('id')}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function COEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/co/earnings')
      .then(r => { if (!r.ok) throw new Error('Gagal memuat'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: T.danger }}>{error || 'Data tidak tersedia'}</div>
      </div>
    );
  }

  const { totalIdrx, pendingIdrx, estimatedThisMonthIdrx, shareRate, shareRateLabel, perSessionIdrx, tier, records } = data;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={<DollarSign size={18} color={T.p600} />} label="Total Pendapatan" value={formatRupiah(totalIdrx)} sub="sejak bergabung" />
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Revenue Share Rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em' }}>{shareRateLabel}</div>
          <div style={{ fontSize: 12, color: T.g500 }}>{tier.label} (Rep {tier.tier === 1 ? '0–39' : tier.tier === 2 ? '40–69' : '70–100'})</div>
          <div style={{ fontSize: 12, color: T.success, marginTop: 4 }}>Rp {perSessionIdrx.toLocaleString('id')} / sesi</div>
        </div>
        <div style={{ background: T.p100, border: `1px solid ${T.p400}30`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Estimasi Bulan Ini</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.p600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono), monospace' }}>
            {formatRupiah(estimatedThisMonthIdrx || pendingIdrx || 0)}
          </div>
          <div style={{ fontSize: 12, color: T.p500 }}>Share {shareRateLabel} × Rp {perSessionIdrx.toLocaleString('id')}/sesi</div>
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Riwayat Pembayaran</div>
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        {records.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: T.g500 }}>Belum ada riwayat pendapatan.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
                {['Tipe', 'Jumlah', 'Tanggal', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((e, i) => (
                <tr key={e.id}
                  style={{ borderBottom: i < records.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = T.c100)}
                  onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontSize: 13, color: T.g700 }}>{TYPE_LABELS[e.type] || e.type}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 700, color: T.success, fontVariantNumeric: 'tabular-nums' }}>
                    +Rp {e.amountIdrx.toLocaleString('id')}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: T.g500 }}>{formatDate(e.createdAt)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <Badge variant={e.isPaid ? 'active' : 'seeding'} style={{ fontSize: 10 }}>
                      {e.isPaid ? 'Dibayar' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
