'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Award, Settings, FileText, ExternalLink, Plus, MapPin } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCoContext, CoContextValue } from '@/lib/co-context';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Baru saja';
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)}h lalu`;
}

export default function COClusterPage() {
  const ctx = useCoContext();
  const [data, setData] = useState<CoContextValue | null>(null);
  const [loading, setLoading] = useState(!!ctx === false);

  useEffect(() => {
    if (ctx) { setData(ctx); setLoading(false); return; }
    fetch('/api/co/me').then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [ctx]);

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}><LoadingSpinner size="lg" /></div>;
  if (!data?.co) return <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}><div style={{ fontSize: 16, color: T.danger }}>Data tidak tersedia</div></div>;

  const { co, cluster, sessionsThisMonth, revenueShareThisMonth } = data;

  if (!cluster) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><MapPin size={24} color={T.p600} /></div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum ada cluster</div>
        <div style={{ fontSize: 13, color: T.g500, marginBottom: 16 }}>Kamu belum memiliki cluster aktif.</div>
        <a href="/co/dashboard/clusters" style={{ textDecoration: 'none' }}><Button icon={<Plus size={16} color={T.c50} />}>Ajukan Cluster</Button></a>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Badge variant={cluster.status === 'ACTIVE' ? 'active' : 'seeding'}>{cluster.status === 'ACTIVE' ? 'Active' : cluster.status}</Badge>
            <Badge variant="dark"><ShieldCheck size={10} color={T.c50} /> {cluster.totalValidatedFields} data points</Badge>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.g900, margin: '0 0 4px' }}>{cluster.name}</h2>
          <p style={{ fontSize: 14, color: T.g500, margin: 0 }}>{cluster.anchorLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}><Button variant="secondary" size="sm" icon={<FileText size={14} color={T.p600} />}>Kirim Update</Button><Button size="sm" icon={<Settings size={14} color={T.c50} />}>Kelola</Button></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          <MapPlaceholder accent="#E6F3EF" color={T.p400} height={220} label={cluster.anchorLabel} />
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { l: 'Confidence Score', v: `${cluster.confidenceScore}/100` },
              { l: 'Kelengkapan Data', v: `${cluster.dataCompleteness}%` },
              { l: 'Sesi Bulan Ini', v: `${sessionsThisMonth}` },
              { l: 'Revenue Share', v: `Rp ${revenueShareThisMonth.toLocaleString('id')}` },
              { l: 'Diperbarui', v: timeAgo(cluster.updatedAt) },
              { l: 'Radius Cluster', v: `${cluster.radiusKm} km` },
            ].map(s => (
              <div key={s.l} style={{ background: T.c100, borderRadius: 12, padding: '14px 16px' }}><div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div><div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginTop: 4 }}>{s.v}</div></div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ background: T.e100, borderRadius: 16, padding: '20px', border: `1px solid ${T.e500}30`, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <AlertTriangle size={18} color={T.e600} />
              <div><div style={{ fontSize: 14, fontWeight: 700, color: T.e600 }}>Field Progress</div><div style={{ fontSize: 12, color: T.g500, marginTop: 4 }}>{cluster.validatedCount} dari {cluster.totalFields} field tervalidasi.</div></div>
            </div>
            <ProgressBar value={cluster.validatedCount} max={cluster.totalFields} label="Field Tervalidasi" color={T.e600} />
            <div style={{ marginTop: 12 }}><Button variant="accent" full size="sm">Refresh Data</Button></div>
          </div>
          <div style={{ background: T.g900, borderRadius: 16, padding: '20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.p400, marginBottom: 12 }}>Soulbound NFT Credential</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={22} color={T.p600} /></div>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: T.c50 }}>LOKAL CO — {co.fullName}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono), monospace' }}>{cluster.slug}</div></div>
            </div>
            {[
              { l: 'Reputation Score', v: `${co.coScore} / 100` },
              { l: 'Trust Score', v: `${co.trustScore} / 100` },
              { l: 'Cluster Tier', v: `${co.tier.label} — ${co.tier.tier === 1 ? 'New' : co.tier.tier === 2 ? 'Established' : 'Expert'}` },
              { l: 'Share Rate', v: `${co.tier.shareRate}% (Rp ${co.tier.shareIdrx.toLocaleString('id')}/sesi)` },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}><span style={{ color: 'rgba(255,255,255,0.45)' }}>{s.l}</span><span style={{ color: T.c50, fontWeight: 600 }}>{s.v}</span></div>
            ))}
            {co.nftMintAddress ? (
              <a href={`https://explorer.solana.com/address/${co.nftMintAddress}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, width: '100%', padding: '9px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>Lihat di Solana Explorer <ExternalLink size={12} /></a>
            ) : <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>NFT belum di-mint</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
