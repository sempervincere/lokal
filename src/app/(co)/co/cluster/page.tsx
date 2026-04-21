'use client';

import { ShieldCheck, AlertTriangle, Award, Settings, FileText } from 'lucide-react';
import { T, CLUSTERS } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';

const c = CLUSTERS[0];

export default function COClusterPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Badge variant="active">Active</Badge>
            <Badge variant="dark"><ShieldCheck size={10} color={T.c50} /> {c.zkPoints} data points</Badge>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.g900, margin: '0 0 4px' }}>{c.name}</h2>
          <p style={{ fontSize: 14, color: T.g500, margin: 0 }}>{c.anchor} · {c.neighborhood}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" icon={<FileText size={14} color={T.p600} />}>Kirim Update</Button>
          <Button size="sm" icon={<Settings size={14} color={T.c50} />}>Kelola</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Left */}
        <div>
          <MapPlaceholder accent="#E6F3EF" color={T.p400} height={220} label={c.anchor} />
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { l: 'Confidence Score', v: '87/100' },
              { l: 'Kelengkapan Data', v: '95%' },
              { l: 'Sesi Bulan Ini', v: '12' },
              { l: 'Rating Rata-rata', v: '4.8 ⭐' },
              { l: 'Diperbarui', v: '23j lalu' },
              { l: 'Refresh Berikut', v: '7 hari' },
            ].map(s => (
              <div key={s.l} style={{ background: T.c100, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginTop: 4 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          {/* Refresh reminder */}
          <div style={{ background: T.e100, borderRadius: 16, padding: '20px', border: `1px solid ${T.e500}30`, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <AlertTriangle size={18} color={T.e600} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.e600 }}>Refresh Kuartal: 7 Hari Lagi</div>
                <div style={{ fontSize: 12, color: T.g500, marginTop: 4 }}>Perbarui semua field Tier 1 & 2 untuk bonus Rp 125.000.</div>
              </div>
            </div>
            <ProgressBar value={13} max={20} label="Field di-refresh" color={T.e600} />
            <div style={{ marginTop: 12 }}>
              <Button variant="accent" full size="sm">Mulai Refresh</Button>
            </div>
          </div>

          {/* Soulbound NFT */}
          <div style={{ background: T.g900, borderRadius: 16, padding: '20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.p400, marginBottom: 12 }}>Soulbound NFT Credential</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} color={T.p600} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.c50 }}>LOKAL CO — Rizky F.</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono), monospace' }}>depok-margonda-001</div>
              </div>
            </div>
            {[
              { l: 'Reputation Score', v: '78 / 100' },
              { l: 'Trust Score', v: '91 / 100' },
              { l: 'Cluster Tier', v: 'Tier 3 — Expert' },
              { l: 'Multiplier', v: '1.7× base rate' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>{s.l}</span>
                <span style={{ color: T.c50, fontWeight: 600 }}>{s.v}</span>
              </div>
            ))}
            <button style={{ marginTop: 14, width: '100%', padding: '9px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Lihat di Solana Explorer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
