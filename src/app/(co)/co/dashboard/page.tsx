'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Clock, ShieldCheck, Plus, MapPin, Award } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { ConfidenceRing } from '@/components/ui/ConfidenceRing';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useCoContext, CoContextValue } from '@/lib/co-context';

function formatRupiah(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}M`;
  return `Rp ${n.toLocaleString('id')}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)}h lalu`;
}

export default function COOverviewPage() {
  const ctx = useCoContext();
  const [data, setData] = useState<typeof ctx>(null);
  const [loading, setLoading] = useState(!!ctx === false);

  useEffect(() => {
    if (ctx) { setData(ctx); setLoading(false); return; }
    fetch('/api/co/me')
      .then(r => { if (!r.ok) throw new Error('Gagal'); return r.json(); })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ctx]);

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}><LoadingSpinner size="lg" /></div>;
  }

  if (!data?.co) {
    return <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}><div style={{ fontSize: 16, color: T.danger }}>Data tidak tersedia</div></div>;
  }

  const { co, cluster, earningsOverview, sessionsThisMonth, revenueShareThisMonth, recentActivity } = data;

  if (!cluster) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>Selamat datang, {co.fullName.split(' ')[0]} 👋</div>
          <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>Saatnya membangun cluster pertamamu.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Reputasi</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ConfidenceRing score={co.coScore} size={52} /><div><div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>{co.coScore}</div><div style={{ fontSize: 11, color: T.g500 }}>{co.tier.label}</div></div></div>
          </div>
          <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Trust</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ConfidenceRing score={co.trustScore} size={52} /><div><div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>{co.trustScore}</div><div style={{ fontSize: 11, color: T.success }}>Trusted</div></div></div>
          </div>
          <StatCard icon={<DollarSign size={18} color={T.p600} />} label="Total Pendapatan" value="Rp 0" sub="sejak bergabung" />
          <div style={{ background: T.e100, border: `1px solid ${T.e500}30`, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.e600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Belum ada cluster</div>
            <a href="/co/dashboard/clusters" style={{ fontSize: 12, fontWeight: 700, color: T.p600, textDecoration: 'none' }}>Buat cluster pertama →</a>
          </div>
        </div>
        <div style={{ background: T.c50, border: `1px dashed ${T.c200}`, borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><MapPin size={24} color={T.p600} /></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum ada cluster</div>
          <div style={{ fontSize: 13, color: T.g500, maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>Kamu belum memiliki cluster. Ajukan proposal untuk mulai mengumpulkan data dan mendapatkan pendapatan dari sesi.</div>
          <a href="/co/dashboard/clusters" style={{ textDecoration: 'none' }}><Button icon={<Plus size={16} color={T.c50} />}>Ajukan Cluster</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>Selamat datang, {co.fullName.split(' ')[0]} 👋</div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>Cluster {cluster.name} {cluster.status === 'ACTIVE' ? 'aktif' : 'sedang diisi'} dan menghasilkan pendapatan.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Reputasi</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ConfidenceRing score={co.coScore} size={52} />
            <div><div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>{co.coScore}</div><div style={{ fontSize: 11, color: T.g500 }}>{co.tier.label} — {co.tier.shareRate}%</div></div>
          </div>
        </div>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Trust</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ConfidenceRing score={co.trustScore} size={52} />
            <div><div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>{co.trustScore}</div><div style={{ fontSize: 11, color: T.success }}>Trusted</div></div>
          </div>
        </div>
        <StatCard icon={<DollarSign size={18} color={T.p600} />} label="Total Pendapatan" value={formatRupiah(earningsOverview.totalIdrx)} sub="sejak bergabung" />
        <StatCard icon={<Clock size={18} color={T.p600} />} label="Menunggu Pembayaran" value={formatRupiah(earningsOverview.pendingIdrx)} sub="dicairkan bulan ini" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>Cluster Saya</div>
            <Badge variant={cluster.status === 'ACTIVE' ? 'active' : 'seeding'}>{cluster.status === 'ACTIVE' ? 'Active' : cluster.status}</Badge>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 120, flexShrink: 0 }}><MapPlaceholder accent="#E6F3EF" color={T.p400} height={100} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>{cluster.name}</div>
              <div style={{ fontSize: 12, color: T.g500, marginBottom: 14 }}>{cluster.anchorLabel}</div>
              <ProgressBar value={cluster.validatedCount} max={cluster.totalFields} label="Progress Field Tier 1" color={T.p600} />
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Badge variant="dark"><ShieldCheck size={10} color={T.c50} /> {cluster.totalValidatedFields} data points</Badge>
                <Badge variant="active">{cluster.confidenceScore}/100 confidence</Badge>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 14 }}>Sesi Bulan Ini</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', marginBottom: 4 }}>{sessionsThisMonth}</div>
          <div style={{ fontSize: 13, color: T.g500, marginBottom: 14 }}>sesi berbayar di cluster kamu</div>
          <div style={{ padding: '12px', background: T.p100, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: T.g500, marginBottom: 3 }}>Revenue share bulan ini</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.p600, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono), monospace' }}>{formatRupiah(revenueShareThisMonth)}</div>
            <div style={{ fontSize: 11, color: T.g500 }}>{sessionsThisMonth} × Rp {co.tier.shareIdrx.toLocaleString('id')} ({co.tier.shareRate}%)</div>
          </div>
        </div>
      </div>

      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Aktivitas Terbaru</div>
        {recentActivity.length === 0 ? (
          <div style={{ fontSize: 13, color: T.g500, padding: '12px 0' }}>Belum ada aktivitas pendapatan.</div>
        ) : recentActivity.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, marginBottom: i < recentActivity.length - 1 ? 14 : 0, borderBottom: i < recentActivity.length - 1 ? `1px solid ${T.c200}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: a.isPaid ? T.p100 : T.e100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>{a.isPaid ? '💰' : '⏳'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.g700 }}>{a.description}</div>
              <div style={{ fontSize: 11, color: T.g500, marginTop: 3 }}>+Rp {a.amountIdrx.toLocaleString('id')} · {timeAgo(a.createdAt)}{!a.isPaid && <span style={{ color: T.warning, marginLeft: 6 }}>menunggu</span>}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
