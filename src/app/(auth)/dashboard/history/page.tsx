'use client';

import { T, MOCK_SESSIONS } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';

export default function BOHistoryPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 20 }}>Riwayat Simulasi</div>
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
              {['Cluster', 'Konsep', 'Tanggal', 'Status', 'Skor', 'Aksi'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_SESSIONS.map((s, i) => (
              <tr key={s.id}
                style={{ borderBottom: i < MOCK_SESSIONS.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = T.c100)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: T.g900 }}>{s.cluster}</td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: T.g700 }}>{s.concept}</td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: T.g500 }}>{s.date}</td>
                <td style={{ padding: '16px 20px' }}>
                  <Badge variant={s.paid ? 'active' : 'neutral'}>{s.status}</Badge>
                </td>
                <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: s.score ? (s.score >= 70 ? T.success : T.warning) : T.g500 }}>
                  {s.score ? `${s.score}/100` : '—'}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {s.paid && (
                      <a href={`/session/${s.id}`} style={{ background: T.p100, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: T.p600, textDecoration: 'none', display: 'inline-block' }}>
                        Lihat Laporan
                      </a>
                    )}
                    <button style={{ background: T.c200, border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: T.g700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Ulangi Chat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
