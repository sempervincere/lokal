'use client';

import { DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { T, CLUSTERS } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { ConfidenceRing } from '@/components/ui/ConfidenceRing';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { ProgressBar } from '@/components/ui/ProgressBar';

const c = CLUSTERS[0];

export default function COOverviewPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>Selamat datang, Rizky 👋</div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>Cluster Margonda kamu aktif dan menghasilkan pendapatan.</div>
      </div>

      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {/* CO Score */}
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>CO Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ConfidenceRing score={78} size={52} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>78</div>
              <div style={{ fontSize: 11, color: T.g500 }}>Tier 3 — Expert</div>
            </div>
          </div>
        </div>
        {/* Trust Score */}
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Trust Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ConfidenceRing score={91} size={52} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>91</div>
              <div style={{ fontSize: 11, color: T.success }}>Trusted</div>
            </div>
          </div>
        </div>
        <StatCard icon={<DollarSign size={18} color={T.p600} />} label="Total Pendapatan" value="Rp 485K" sub="sejak bergabung" />
        <StatCard icon={<Clock size={18} color={T.p600} />} label="Menunggu Pembayaran" value="Rp 80K" sub="dicairkan bulan ini" />
      </div>

      {/* Cluster + sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Cluster card */}
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>Cluster Saya</div>
            <Badge variant="active">Active</Badge>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 120, flexShrink: 0 }}>
              <MapPlaceholder accent="#E6F3EF" color={T.p400} height={100} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Jalan Margonda</div>
              <div style={{ fontSize: 12, color: T.g500, marginBottom: 14 }}>UI Gate — Margo City · Depok</div>
              <ProgressBar value={19} max={20} label="Progress Field Tier 1" color={T.p600} />
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Badge variant="dark"><ShieldCheck size={10} color={T.c50} /> 34 data points</Badge>
                <Badge variant="active">87/100 confidence</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions this month */}
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 14 }}>Sesi Bulan Ini</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', marginBottom: 4 }}>12</div>
          <div style={{ fontSize: 13, color: T.g500, marginBottom: 14 }}>sesi berbayar di cluster kamu</div>
          <div style={{ padding: '12px', background: T.p100, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: T.g500, marginBottom: 3 }}>Revenue share bulan ini</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.p600, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono), monospace' }}>Rp 480.000</div>
            <div style={{ fontSize: 11, color: T.g500 }}>12 × Rp 40.000 (10%)</div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Aktivitas Terbaru</div>
        {[
          { icon: '💰', text: 'Revenue share diterima dari 3 sesi baru', time: '2j lalu', color: T.success },
          { icon: '✅', text: 'Field M5 divalidasi oleh admin', time: '1h lalu', color: T.p600 },
          { icon: '⚠️', text: 'Pengingat: refresh kuartal dalam 7 hari', time: '1h lalu', color: T.warning },
          { icon: '⭐', text: 'Rating baru: 5⭐ dari sesi BO', time: '2h lalu', color: T.warning },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, marginBottom: i < 3 ? 14 : 0, borderBottom: i < 3 ? `1px solid ${T.c200}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.c100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
              {a.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.g700 }}>{a.text}</div>
              <div style={{ fontSize: 11, color: T.g500, marginTop: 3 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
