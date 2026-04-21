'use client';

import { CreditCard, FileText, MapPin, Star, TrendingUp } from 'lucide-react';
import { T, MOCK_SESSIONS } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export default function BOOverviewPage() {
  const stats = [
    { icon: <CreditCard size={18} color={T.p600} />, label: 'Kredit Tersisa', value: '2', sub: 'Pay-per-use', trend: null },
    { icon: <FileText size={18} color={T.p600} />, label: 'Total Sesi', value: '3', sub: 'sesi total', trend: null },
    { icon: <MapPin size={18} color={T.p600} />, label: 'Cluster Aktif', value: '4', sub: 'cluster aktif', trend: 25 },
    { icon: <Star size={18} color={T.warning} />, label: 'Rata-rata Skor', value: '70', sub: 'rata-rata skor', trend: 3, color: T.warning },
  ];

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
          Selamat datang, Budi 👋
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          Berikut ringkasan aktivitas kamu di LOKAL.
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32, marginTop: 24 }}>
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} sub={s.sub} trend={s.trend} color={(s as any).color} />
        ))}
      </div>

      {/* Recent simulations */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Simulasi Terbaru</div>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.c200}` }}>
                {['Cluster', 'Konsep', 'Tanggal', 'Status', 'Skor', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_SESSIONS.map((s, i) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: i < MOCK_SESSIONS.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.c100)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: T.g900 }}>{s.cluster}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.g700 }}>{s.concept}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: T.g500 }}>{s.date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={s.paid ? 'active' : 'neutral'}>{s.status}</Badge>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: s.score ? (s.score >= 70 ? T.success : T.warning) : T.g500 }}>
                    {s.score ? `${s.score}/100` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {s.paid && (
                      <a href={`/session/${s.id}`} style={{
                        background: T.p100, border: 'none', borderRadius: 8, padding: '6px 12px',
                        fontSize: 12, fontWeight: 600, color: T.p600, cursor: 'pointer',
                        textDecoration: 'none', display: 'inline-block',
                      }}>Lihat</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick action banner */}
      <div style={{ background: T.p100, borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.p600, marginBottom: 6 }}>Siap validasi konsep baru?</div>
          <div style={{ fontSize: 13, color: T.p500 }}>Jelajahi 4 cluster aktif dan mulai chat gratis sekarang.</div>
        </div>
        <Button icon={<MapPin size={16} color={T.c50} />} onClick={() => { window.location.href = '/dashboard/clusters'; }} style={{ flexShrink: 0 }}>
          Jelajahi Cluster
        </Button>
      </div>
    </div>
  );
}
