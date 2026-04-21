'use client';

import { CreditCard, Check } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const PLANS = [
  { name: 'Pay-per-use', price: 'Rp 400K', per: '/sesi', features: ['10-section report', '12h AI chat', 'Per-menu analysis', 'PDF download'], highlight: false },
  { name: 'Explorer', price: 'Rp 1.2jt', per: '/bulan', features: ['4 sesi/bulan', 'Rollover 2 sesi', 'Semua Pay-per-use', 'Priority support'], highlight: true },
  { name: 'Operator', price: 'Rp 3jt', per: '/bulan', features: ['12 sesi/bulan', 'Priority generation', 'Email support', 'Team access'], highlight: false },
  { name: 'Agency', price: 'Rp 8jt', per: '/bulan', features: ['Unlimited sesi', 'API access', 'White-label report', 'Dedicated support'], highlight: false },
];

export default function BOSubscriptionPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Langganan</div>
      <div style={{ fontSize: 14, color: T.g500, marginBottom: 28 }}>Kelola paket langganan kamu.</div>

      {/* Current plan */}
      <div style={{ background: T.p100, borderRadius: 16, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${T.p400}30` }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCard size={22} color={T.c50} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Paket Saat Ini</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.g900, marginTop: 2 }}>Free</div>
          <div style={{ fontSize: 13, color: T.g500 }}>2 kredit tersisa dari pembelian terakhir</div>
        </div>
      </div>

      {/* Plans grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {PLANS.map((p, i) => (
          <div key={i} style={{
            background: p.highlight ? T.g900 : T.c50,
            borderRadius: 18, padding: '24px 20px',
            border: p.highlight ? 'none' : `1px solid ${T.c200}`,
            boxShadow: p.highlight ? '0 8px 32px rgba(26,26,26,0.15)' : '0 1px 4px rgba(26,26,26,0.05)',
            position: 'relative',
          }}>
            {p.highlight && (
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                <Badge variant="active">Populer</Badge>
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? T.p400 : T.g500, marginBottom: 8 }}>{p.name}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: p.highlight ? T.c50 : T.g900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{p.price}</div>
            <div style={{ fontSize: 12, color: p.highlight ? 'rgba(253,251,247,0.5)' : T.g500, marginBottom: 16 }}>{p.per}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {p.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, fontSize: 12, color: p.highlight ? 'rgba(253,251,247,0.75)' : T.g700 }}>
                  <Check size={13} color={p.highlight ? T.p400 : T.p600} style={{ flexShrink: 0, marginTop: 1 }} />{f}
                </div>
              ))}
            </div>
            <Button full variant={p.highlight ? 'primary' : 'secondary'} size="sm">Pilih Paket</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
