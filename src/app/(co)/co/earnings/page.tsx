'use client';

import { DollarSign } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';

const earnings = [
  { type: 'Revenue share — 12 sesi', amount: 480000, date: 'Apr 2025', status: 'paid' },
  { type: 'Revenue share — 8 sesi', amount: 320000, date: 'Mar 2025', status: 'paid' },
  { type: 'Bonus refresh kuartal', amount: 125000, date: 'Mar 2025', status: 'paid' },
  { type: 'Milestone Tier 2 fields', amount: 80000, date: 'Feb 2025', status: 'paid' },
  { type: 'Milestone Tier 1 fields', amount: 170000, date: 'Jan 2025', status: 'paid' },
];
const total = earnings.reduce((s, e) => s + e.amount, 0);

export default function COEarningsPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={<DollarSign size={18} color={T.p600} />} label="Total Pendapatan" value={`Rp ${(total / 1000).toFixed(0)}K`} sub="sejak bergabung" />
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Revenue Share Rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em' }}>10%</div>
          <div style={{ fontSize: 12, color: T.g500 }}>Tier 3 (Rep 70–100)</div>
          <div style={{ fontSize: 12, color: T.success, marginTop: 4 }}>Rp 40.000 / sesi</div>
        </div>
        <div style={{ background: T.p100, border: `1px solid ${T.p400}30`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Estimasi Bulan Ini</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.p600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono), monospace' }}>Rp 480K</div>
          <div style={{ fontSize: 12, color: T.p500 }}>12 sesi × Rp 40.000</div>
        </div>
      </div>

      {/* Payout history */}
      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Riwayat Pembayaran</div>
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
              {['Tipe', 'Jumlah', 'Tanggal', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {earnings.map((e, i) => (
              <tr key={i}
                style={{ borderBottom: i < earnings.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                onMouseEnter={ev => (ev.currentTarget.style.background = T.c100)}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 20px', fontSize: 13, color: T.g700 }}>{e.type}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 700, color: T.success, fontVariantNumeric: 'tabular-nums' }}>+Rp {e.amount.toLocaleString('id')}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: T.g500 }}>{e.date}</td>
                <td style={{ padding: '14px 20px' }}><Badge variant="active" style={{ fontSize: 10 }}>Dibayar</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
