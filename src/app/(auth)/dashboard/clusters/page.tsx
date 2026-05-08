'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSearchParams } from 'next/navigation';
import { Search, Eye, MessageCircle, ChevronLeft, TrendingDown, CreditCard, Clock, Users, Activity, BarChart2, ShieldCheck, Sparkles, Lock, ArrowRight, Check, TrendingUp, MapPin, DollarSign, Target, Rocket, ShieldAlert, LineChart, Loader2 } from 'lucide-react';
import { BOReport } from '@/components/session/BOReport';
import { BOConsultationChat } from '@/components/session/BOConsultationChat';
import { T, ClusterData } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import type { ClusterKeyStats } from '@/lib/utils/clusterStats';

// API cluster shape returned by GET /api/clusters
interface ApiCluster {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  anchorLat: number;
  anchorLng: number;
  anchorLabel: string;
  radiusKm: number;
  confidenceScore: number;
  dataCompleteness: number;
  totalValidatedFields: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { fieldValues: number };
  keyStats: ClusterKeyStats;
}

// City/display metadata for known clusters — extend as more clusters are added
const CLUSTER_DISPLAY_META: Record<string, {
  city: string; neighborhood: string; subtitle: string;
  anchor: string; anchorType: string;
  accent: string; iconColor: string;
  coName: string; coTier: number;
}> = {
  'depok-margonda-001': {
    city: 'Depok',
    neighborhood: 'Beji, Depok',
    subtitle: 'UI Gate — Margo City',
    anchor: 'Universitas Indonesia + Margo City Mall',
    anchorType: 'University + Mall',
    accent: '#E6F3EF',
    iconColor: '#1B7A65',
    coName: 'Rizky F.',
    coTier: 3,
  },
};

function hoursAgo(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60));
}

function mapApiToClusterData(c: ApiCluster): ClusterData {
  const meta = CLUSTER_DISPLAY_META[c.slug] ?? {
    city: 'Indonesia',
    neighborhood: c.anchorLabel,
    subtitle: c.anchorLabel,
    anchor: c.anchorLabel,
    anchorType: 'Landmark',
    accent: '#E6F3EF',
    iconColor: '#1B7A65',
    coName: 'CO',
    coTier: 1,
  };
  const ks = c.keyStats;

  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    subtitle: meta.subtitle,
    anchor: meta.anchor,
    anchorType: meta.anchorType,
    city: meta.city,
    neighborhood: meta.neighborhood,
    lat: c.anchorLat,
    lng: c.anchorLng,
    freshness: hoursAgo(c.updatedAt),
    confidence: c.confidenceScore,
    zkPoints: c.totalValidatedFields,
    status: c.status === 'ACTIVE' ? 'Active' : 'Seeding',
    completeness: c.dataCompleteness,
    categories: ks.categories.length > 0 ? ks.categories : ['F&B'],
    priceRange: ks.priceRangeLabel
      ? { cafe: ks.priceRangeLabel }
      : {},
    traffic: ks.trafficLevel,
    saturation: ks.saturationLevel,
    coName: meta.coName,
    coTier: meta.coTier,
    coScore: 85,
    accent: meta.accent,
    iconColor: meta.iconColor,
    keyStats: {
      priceCeiling: ks.priceCeiling ?? 0,
      willingness: ks.willingness ?? 0,
      digitalPayment: ks.digitalPayment ?? 0,
      peakHour: ks.peakHour ?? '—',
      dominantAge: ks.dominantAge ?? '—',
      halal: ks.halal ?? 0,
    },
    tier1Fields: [],
  };
}
import { Badge } from '@/components/ui/Badge';
import { InputField } from '@/components/ui/InputField';
import { ConfidenceRing } from '@/components/ui/ConfidenceRing';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StepsProgress } from '@/components/ui/StepsProgress';

type View = 'list' | 'detail' | 'chat' | 'paywall' | 'form' | 'report' | 'consultation';


import { Suspense } from 'react';

function BOClustersPageInner() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get('sessionId');
  const demoClusterId = searchParams.get('demoClusterId'); // ?demoClusterId=xxx → skip to form (hackathon)
  const [view, setView] = useState<View>(initialSessionId ? 'report' : demoClusterId ? 'form' : 'list');
  const [selected, setSelected] = useState<ClusterData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [cachedSession, setCachedSession] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ id: number; role: 'ai' | 'user'; text: string }> | null>(null);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const cities = [
    { id: 'all', label: 'Semua' },
    { id: 'Depok', label: 'Depok' },
    { id: 'Jakarta Selatan', label: 'Jaksel' },
    { id: 'Tangerang Selatan', label: 'Tangsel' },
    { id: 'Surabaya', label: 'Surabaya' },
  ];

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch('/api/clusters', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ApiCluster[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setClusters(data.map(mapApiToClusterData));
        } else {
          setClusters([]);
        }
        setError(false);
      })
      .catch(() => {
        setError(true);
        setClusters([]);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const retry = () => {
    setLoading(true);
    setError(false);
    setClusters([]);
    // Re-trigger by calling the same fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    fetch('/api/clusters', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ApiCluster[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setClusters(data.map(mapApiToClusterData));
        } else {
          setClusters([]);
        }
        setError(false);
      })
      .catch(() => {
        setError(true);
        setClusters([]);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialSessionId && clusters.length > 0 && !selected) {
      fetch(`/api/sessions/${initialSessionId}`)
        .then(r => r.json())
        .then((data: SessionData & { clusterId: string }) => {
          if (data?.clusterId) {
            const matchingCluster = clusters.find(c => c.id === data.clusterId);
            if (matchingCluster) {
              setSelected(matchingCluster);
              setSessionId(initialSessionId);
              setCachedSession(data);
              setIsExpired(!data.expiresAt || new Date(data.expiresAt) < new Date());
              setView('report');
            }
          }
        }).catch(console.error);
    }
  }, [initialSessionId, clusters, selected]);

  // Demo flow: ?demoClusterId=xxx → skip paywall, go directly to form
  useEffect(() => {
    if (demoClusterId && clusters.length > 0 && view === 'form' && !selected) {
      const matchingCluster = clusters.find(c => c.id === demoClusterId);
      if (matchingCluster) {
        setSelected(matchingCluster);
      }
    }
  }, [demoClusterId, clusters, view, selected]);

  const filtered = clusters.filter(c => {
    const q = search.toLowerCase();
    const mq = !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    const mc = cityFilter === 'all' || c.city === cityFilter;
    return mq && mc;
  });

  const goTo = (v: View, cluster?: ClusterData) => {
    if (cluster) setSelected(cluster);
    setView(v);
  };

  if (view === 'consultation' && selected) return <BOConsultationChat cluster={selected} sessionId={sessionId} onBack={() => setView('report')} expiresAt={cachedSession?.expiresAt ?? null} initialMsgs={chatHistory} onMsgsChange={setChatHistory} isExpired={isExpired} />;
  if (view === 'report' && selected) return <BOReport cluster={selected} sessionId={sessionId} onBack={() => setView('list')} onStartConsultation={() => setView('consultation')} onViewHistory={() => setView('consultation')} initialSession={cachedSession} onSessionLoaded={(s) => setCachedSession(s)} isExpired={isExpired} />;
  if (view === 'form' && selected) return <BOConceptForm cluster={selected} onBack={() => setView('detail')} onSubmit={(sid) => { setSessionId(sid); setView('report'); }} sessionId={sessionId} />;
  if (view === 'paywall' && selected) return <BOPaywall cluster={selected} onClose={() => setView('detail')} onContinue={(sid) => { setSessionId(sid); setView('form'); }} />;
  if (view === 'chat' && selected) return <BOChat cluster={selected} onBack={() => setView('detail')} onPaywall={() => setView('paywall')} />;
  if (view === 'detail' && selected) return <BOClusterDetail cluster={selected} onBack={() => setView('list')} onChat={() => setView('chat')} onSkipToReport={() => setView('paywall')} />;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px' }}>
          <InputField placeholder="Cari cluster, kota, atau area..." value={search} onChange={e => setSearch(e.target.value)} prefix={<Search size={16} color={T.g500} />} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {cities.map(c => (
            <button key={c.id} onClick={() => setCityFilter(c.id)} style={{
              padding: '9px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              background: cityFilter === c.id ? T.p600 : T.c200,
              color: cityFilter === c.id ? T.c50 : T.g700,
              transition: 'all 150ms',
            }}>{c.label}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <ClusterGridSkeleton />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 14, color: T.g500, marginBottom: 16 }}>
            Gagal memuat data cluster. Periksa koneksi Anda.
          </div>
          <button
            onClick={retry}
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              border: 'none',
              background: T.p600,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Coba Lagi
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 14, color: T.g500 }}>
            Tidak ada cluster yang cocok dengan pencarian Anda.
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: T.g500, marginBottom: 16 }}>{filtered.length} cluster ditemukan</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {filtered.map((c, i) => (
              <ClusterCard key={c.id} cluster={c} onSelect={() => goTo('detail', c)} delay={i * 60} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BOClustersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Memuat modul...</div>}>
      <BOClustersPageInner />
    </Suspense>
  );
}

function ClusterCard({ cluster: c, onSelect, delay }: { cluster: ClusterData; onSelect: () => void; delay: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div onClick={onSelect} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden', cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (hov ? 'translateY(-2px)' : 'none') : 'translateY(10px)',
        transition: `opacity 300ms ease ${delay}ms, transform 220ms, box-shadow 220ms`,
        boxShadow: hov ? '0 8px 28px rgba(26,26,26,0.10)' : '0 2px 6px rgba(26,26,26,0.04)',
      }}>
      <div style={{ position: 'relative' }}>
        <MapPlaceholder accent={c.accent} color={c.iconColor} height={110} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge variant={c.status === 'Active' ? 'active' : 'seeding'}>{c.status}</Badge>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <ConfidenceRing score={c.confidence} size={42} />
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 2 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: T.g500, marginBottom: 12 }}>{c.subtitle} · {c.neighborhood}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 12 }}>
          {[
            { l: 'Price Ceiling', v: `Rp ${(c.keyStats.priceCeiling / 1000).toFixed(0)}K`, col: T.p600 },
            { l: 'ZK Data', v: `${c.zkPoints} pts`, col: T.g900 },
            { l: 'Diperbarui', v: `${c.freshness}j`, col: T.g900 },
          ].map(s => (
            <div key={s.l} style={{ background: T.c100, borderRadius: 8, padding: '8px 9px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.col, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            </div>
          ))}
        </div>
        <ProgressBar value={c.completeness} label="Kelengkapan data" color={c.iconColor} height={4} />
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {c.categories.slice(0, 3).map(cat => <Badge key={cat} variant="neutral" style={{ fontSize: 10 }}>{cat}</Badge>)}
        </div>
        <div style={{ marginTop: 12 }}>
          <Button size="sm" full onClick={onSelect} icon={<Eye size={13} color={T.c50} />}>Lihat Detail</Button>
        </div>
      </div>
    </div>
  );
}

function ClusterGridSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <div style={{ height: 110, background: `linear-gradient(135deg, ${T.c200} 0%, ${T.c100} 100%)` }} />
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{ height: 18, borderRadius: 6, background: T.c200, marginBottom: 6, width: '70%' }} />
            <div style={{ height: 12, borderRadius: 5, background: T.c200, marginBottom: 12, width: '50%' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 12 }}>
              {[0, 1, 2].map(j => <div key={j} style={{ background: T.c200, borderRadius: 8, height: 52 }} />)}
            </div>
            <div style={{ height: 4, borderRadius: 4, background: T.c200, marginBottom: 12 }} />
            <div style={{ height: 36, borderRadius: 10, background: T.c200 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BOClusterDetail({ cluster: c, onBack, onChat, onSkipToReport }: { cluster: ClusterData; onBack: () => void; onChat: () => void; onSkipToReport: () => void }) {
  const [tab, setTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'insights', label: 'Market Signals' },
    { id: 'about', label: 'Tentang Cluster' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.g500, marginBottom: 20, fontFamily: 'inherit' }}>
        <ChevronLeft size={16} color={T.g500} /> Kembali ke daftar
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Badge variant={c.status === 'Active' ? 'active' : 'seeding'}>{c.status}</Badge>
                <Badge variant="dark"><ShieldCheck size={10} color={T.c50} /> {c.zkPoints} data points</Badge>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 0 4px' }}>{c.name}</h2>
              <p style={{ fontSize: 14, color: T.g500, margin: 0 }}>{c.anchor} · {c.neighborhood}</p>
            </div>
            <ConfidenceRing score={c.confidence} size={56} />
          </div>
          <MapPlaceholder accent={c.accent} color={c.iconColor} height={200} label={c.anchor} />

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, margin: '20px 0', borderBottom: `1px solid ${T.c200}` }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.p600 : T.g500,
                borderBottom: `2px solid ${tab === t.id ? T.p600 : 'transparent'}`, marginBottom: -1,
              }}>{t.label}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { l: 'Price Ceiling (Café)', v: `Rp ${(c.keyStats.priceCeiling / 1000).toFixed(0)}.000`, icon: <TrendingDown size={16} color={T.p600} /> },
                { l: 'Digital Payment', v: `${c.keyStats.digitalPayment}% adoption`, icon: <CreditCard size={16} color={T.p600} /> },
                { l: 'Peak Hours', v: c.keyStats.peakHour, icon: <Clock size={16} color={T.p600} /> },
                { l: 'Dominant Age', v: c.keyStats.dominantAge, icon: <Users size={16} color={T.p600} /> },
                { l: 'Traffic Level', v: c.traffic, icon: <Activity size={16} color={T.p600} /> },
                { l: 'Market Saturation', v: c.saturation, icon: <BarChart2 size={16} color={T.p600} /> },
              ].map(s => (
                <div key={s.l} style={{ background: T.c100, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: T.c50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginTop: 2 }}>{s.v}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: T.p100, borderRadius: 14, padding: '18px 20px', border: `1px solid ${T.p400}22` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Intelijen Harga</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { l: 'Price Ceiling Café', v: `Rp ${(c.keyStats.priceCeiling / 1000).toFixed(0)}.000` },
                    { l: 'Willingness to Pay', v: `Rp ${(c.keyStats.willingness / 1000).toFixed(0)}.000` },
                    { l: 'Sweet Spot Konversi', v: `Rp ${(c.keyStats.willingness * 0.75 / 1000).toFixed(0)}K–${(c.keyStats.willingness / 1000).toFixed(0)}K` },
                    { l: 'Sensitivitas Harga', v: '7.2 / 10' },
                  ].map(s => (
                    <div key={s.l} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginTop: 4, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono), monospace' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: T.c100, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Sinyal Perilaku Konsumen</div>
                {[
                  { l: 'Adopsi Pembayaran Digital', v: `${c.keyStats.digitalPayment}%`, bar: c.keyStats.digitalPayment },
                  { l: 'Preferensi Delivery', v: '45%', bar: 45 },
                  { l: 'Sensitivitas Halal', v: `${c.keyStats.halal}/5`, bar: c.keyStats.halal * 20 },
                ].map(s => (
                  <div key={s.l} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: T.g700 }}>{s.l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.g900 }}>{s.v}</span>
                    </div>
                    <div style={{ height: 5, background: T.c200, borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.bar}%`, background: T.p600, borderRadius: 9999 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 14px', background: T.e100, borderRadius: 10, fontSize: 12, color: T.e600, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Lock size={14} color={T.e600} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Analisis mendalam tersedia di laporan simulasi penuh — termasuk breakdown kompetitor, simulasi revenue, dan strategi lokasi.</span>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <Activity size={16} color={T.p600} />, l: 'Anchor Point', v: c.anchor },
                { icon: <Users size={16} color={T.p600} />, l: 'Kategori F&B', v: c.categories.join(', ') },
                { icon: <Clock size={16} color={T.p600} />, l: 'Radius Cluster', v: '1.5 km dari anchor point' },
                { icon: <ShieldCheck size={16} color={T.p600} />, l: 'ZK Data Points', v: `${c.zkPoints} titik terverifikasi on-chain` },
                { icon: <span>🏆</span>, l: 'CO Tier', v: `Tier ${c.coTier} — ${c.coTier === 3 ? 'Expert' : c.coTier === 2 ? 'Established' : 'New'}` },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', background: T.c100, borderRadius: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: T.c50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, marginTop: 2 }}>{s.v}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right CTA panel */}
        <div>
          <div style={{ background: T.c100, borderRadius: 16, padding: '22px', border: `1px solid ${T.c200}`, position: 'sticky', top: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Mulai Eksplorasi Cluster Ini</div>
            <p style={{ fontSize: 13, color: T.g500, lineHeight: 1.6, margin: '0 0 18px' }}>
              Chat gratis 7 pesan dengan AI konsultan. Setelah itu, buka laporan simulasi penuh.
            </p>
            <Button full icon={<MessageCircle size={15} color={T.c50} />} onClick={onChat} style={{ marginBottom: 8 }}>
              Coba Chat Gratis (7 Pesan)
            </Button>
            <div style={{ textAlign: 'center', fontSize: 12, color: T.g500, marginBottom: 10 }}>
              7 pesan gratis · Tidak perlu kartu kredit
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: T.c200 }} />
              <span style={{ fontSize: 11, color: T.g500, fontWeight: 600 }}>atau langsung</span>
              <div style={{ flex: 1, height: 1, background: T.c200 }} />
            </div>
            <Button full variant="accent" icon={<Sparkles size={15} color={T.c50} />} onClick={onSkipToReport} style={{ marginBottom: 6 }}>
              Beli Laporan Penuh — Rp 400.000
            </Button>
            <div style={{ textAlign: 'center', fontSize: 11, color: T.g500, marginBottom: 16 }}>
              Bayar dulu · Isi konsep · Laporan 10 seksi + 12 jam konsultasi
            </div>

            {/* Report includes */}
            <div style={{ padding: '14px', background: T.c50, borderRadius: 12, border: `1px solid ${T.c200}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 10 }}>Laporan Penuh Mencakup:</div>
              {['Executive Summary', 'Customer Profile', 'Market Sizing', 'Competitive Analysis', 'Location Intel', 'Pricing Strategy', 'Product-Market Fit', 'Go-to-Market Plan', 'Risk Register', 'Financial Modeling'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={9} color={T.p600} />
                  </div>
                  <span style={{ fontSize: 12, color: T.g700 }}>{s}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: '12px', background: T.p100, borderRadius: 9 }}>
                <div style={{ fontSize: 11, color: T.g500 }}>Harga per sesi</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.p600, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono), monospace' }}>Rp 400.000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BOChat({ cluster: c, onBack, onPaywall }: { cluster: ClusterData; onBack: () => void; onPaywall: () => void }) {
  const [msgs, setMsgs] = useState<Array<{ id: number; role: 'ai' | 'user'; text: string; cta: boolean }>>([{
    id: 0, role: 'ai',
    text: `Halo! Saya konsultan AI LOKAL untuk cluster **${c.name}**. Tanya apa saja tentang pasar F&B di area ini. Kamu punya **7 pesan gratis**.`,
    cta: false,
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const MAX = 7;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real message count from DB on mount
  useEffect(() => {
    if (!c.id) { setLoadingCount(false); return; }
    fetch(`/api/chat?clusterId=${c.id}`)
      .then(r => r.json())
      .then(data => { setUsed(data.count ?? 0); })
      .catch(() => {})
      .finally(() => setLoadingCount(false));
  }, [c.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing || loadingCount) return;

    // Build conversation history for API (exclude initial welcome msg id=0)
    const history = msgs
      .filter(m => m.id !== 0)
      .map(m => ({ role: m.role === 'ai' ? 'assistant' as const : 'user' as const, content: m.text }));

    const newUserMsg = { id: Date.now(), role: 'user' as const, text, cta: false };
    setMsgs(m => [...m, newUserMsg]);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clusterId: c.id,
          messages: [...history, { role: 'user', content: text }],
        }),
      });

      if (response.status === 401) {
        setTyping(false);
        setMsgs(m => [...m, { id: Date.now(), role: 'ai', text: 'Kamu perlu login untuk menggunakan chat. Silakan login terlebih dahulu.', cta: false }]);
        return;
      }

      if (response.status === 402) {
        setTyping(false);
        setTimeout(onPaywall, 400);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Stream the response
      const aiMsgId = Date.now() + 1;
      setTyping(false);
      setMsgs(m => [...m, { id: aiMsgId, role: 'ai', text: '', cta: false }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              setMsgs(m => m.map(msg =>
                msg.id === aiMsgId ? { ...msg, text: msg.text + parsed.content } : msg
              ));
            }
            if (parsed.done) {
              const newCount = parsed.count ?? used + 1;
              setUsed(newCount);
              if (parsed.isLastFree) {
                setMsgs(m => m.map(msg =>
                  msg.id === aiMsgId ? { ...msg, cta: true } : msg
                ));
              }
            }
          } catch { /* skip malformed chunk */ }
        }
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now(), role: 'ai', text: 'Maaf, terjadi kesalahan koneksi. Coba lagi.', cta: false }]);
    }
  };

  const bold = (t: string) => t.split(/\*\*(.*?)\*\*/g).map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  const pct = (used / MAX) * 100;
  const barColor = used >= 6 ? T.danger : used >= 4 ? T.warning : T.p600;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.c200}`, background: T.c50, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={18} color={T.g500} />
          </button>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18 }}>📍</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: T.g500 }}>{c.zkPoints} data points · Terverifikasi</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Badge variant="dark"><ShieldCheck size={10} color={T.c50} /> ZK</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.g500 }}>Pesan gratis digunakan</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{used}/{MAX}</span>
        </div>
        <div style={{ height: 4, background: T.c200, borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 9999, transition: 'width 300ms, background 300ms' }} />
        </div>
      </div>

      {/* Skip banner */}
      <div style={{ padding: '10px 24px', background: T.e100, borderBottom: `1px solid ${T.e500}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: T.e600, fontWeight: 500 }}>Sudah yakin dengan cluster ini?</span>
        <button onClick={onPaywall} style={{ background: T.e600, border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: T.c50, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Sparkles size={12} color={T.c50} /> Beli Laporan Penuh →
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%', padding: '12px 16px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? T.p600 : m.cta ? T.e100 : T.c100,
              color: m.role === 'user' ? T.c50 : T.g900, fontSize: 14, lineHeight: 1.6,
              border: m.cta ? `1px solid ${T.e500}` : 'none',
            }}>
              {bold(m.text)}
              {m.cta && (
                <button onClick={onPaywall} style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, background: T.e600, color: T.c50, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                  Buka Laporan Lengkap →
                </button>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: T.c100, borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.g500, animation: `bounceDot 1.2s ease ${i * 0.2}s infinite` }} />)}
          </div>
        )}
        {used === 0 && !loadingCount && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {[
              'Berapa price ceiling untuk konsep café di sini?',
              'Siapa kompetitor terkuat dan di mana celah pasarnya?',
              'Apakah konsep premium cocok untuk area ini?',
            ].map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.c200}`, background: T.c50, color: T.p600, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = T.p100)}
                onMouseLeave={e => (e.currentTarget.style.background = T.c50)}
              >{s}</button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '14px 24px 20px', borderTop: `1px solid ${T.c200}`, flexShrink: 0, background: T.c50 }}>
        {used >= MAX ? (
          <Button variant="accent" full size="lg" onClick={onPaywall} icon={<Lock size={16} color={T.c50} />}>
            Buka Simulasi Bisnis Lengkap — Rp 400.000
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <InputField
                placeholder={loadingCount ? 'Memuat...' : 'Tanya tentang pasar F&B di cluster ini...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                style={{ opacity: loadingCount ? 0.5 : 1 }}
              />
            </div>
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing || loadingCount}
              style={{ width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', background: !input.trim() || typing || loadingCount ? T.c200 : T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}
            >
              <ArrowRight size={17} color={!input.trim() || typing || loadingCount ? T.g500 : T.c50} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BOPaywall({ cluster: c, onClose, onContinue }: { cluster: ClusterData; onClose: () => void; onContinue: (sessionId: string) => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayClick = async () => {
    if (!publicKey) {
      setShowWalletPopup(true);
      return;
    }

    setPaying(true);
    setPaymentError(null);

    try {
      // 1. Create PENDING_PAYMENT session
      setPaymentStep('Membuat sesi...');
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: c.id }),
      });
      if (!sessionRes.ok) {
        const err = await sessionRes.json().catch(() => ({ error: 'Gagal membuat sesi' }));
        throw new Error(err.error ?? 'Gagal membuat sesi');
      }
      const { sessionId } = await sessionRes.json();

      // 2. Build payment transaction
      setPaymentStep('Membangun transaksi...');
      const { createPaymentTransaction } = await import('@/lib/solana/idrxTransfer');
      const tx = createPaymentTransaction(publicKey, sessionId);

      // 3. Send to Phantom
      setPaymentStep('Konfirmasi di Phantom...');
      const { Connection } = await import('@solana/web3.js');
      const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL!;
      const conn = new Connection(rpcUrl, 'confirmed');
      const signature = await sendTransaction(tx, conn);

      // 4. Wait for on-chain confirmation
      setPaymentStep('Menunggu konfirmasi on-chain...');
      const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');
      await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

      // 5. Poll session status until webhook confirms payment
      setPaymentStep('Menunggu verifikasi pembayaran...');
      const start = Date.now();
      const timeout = 120_000; // 2 minute timeout
      while (Date.now() - start < timeout) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(`/api/sessions/${sessionId}`);
        if (!pollRes.ok) continue;
        const pollData = await pollRes.json();
        if (pollData.status === 'PAYMENT_CONFIRMED') {
          onContinue(sessionId);
          return;
        }
      }
      throw new Error('Pembayaran belum terverifikasi. Coba refresh halaman — jika IDRX sudah terkirim, sesi akan aktif otomatis.');
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Gagal memproses pembayaran');
      setPaying(false);
    }
  };

  // If public key connects while modal is open, we can automatically close the popup
  useEffect(() => {
    if (publicKey && showWalletPopup) {
      setShowWalletPopup(false);
    }
  }, [publicKey, showWalletPopup]);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative' }}>
      {showWalletPopup && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, borderRadius: 24
        }} className="animate-fade-in-up">
          <div style={{ background: '#fff', padding: '32px', borderRadius: 20, maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={28} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Wallet Belum Terhubung</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
              Untuk melanjutkan pembayaran on-chain, hubungkan wallet Solana kamu.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <WalletMultiButton style={{ background: '#1B7A65', borderRadius: '12px', height: '44px' }} />
            </div>
            <button onClick={() => setShowWalletPopup(false)} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer', padding: '8px 16px' }}>
              Batal
            </button>
          </div>
        </div>
      )}
      <div style={{ background: T.c50, borderRadius: 24, padding: '36px', maxWidth: 460, width: '100%', boxShadow: '0 16px 48px rgba(26,26,26,0.15)' }}>
        <Badge variant="active" style={{ marginBottom: 16 }}><ShieldCheck size={11} color={T.p600} /> Data Terverifikasi On-Chain</Badge>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.g900, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Buka Simulasi Bisnis Lengkap</h2>
        <p style={{ fontSize: 14, color: T.g500, margin: '0 0 22px', lineHeight: 1.6 }}>
          Analisis mendalam untuk konsep kamu di cluster {c.name}.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: T.c100, borderRadius: 14, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.g900, fontFamily: 'var(--font-mono), monospace', fontVariantNumeric: 'tabular-nums' }}>Rp 400.000</div>
            <div style={{ fontSize: 12, color: T.g500 }}>Satu sesi · Laporan + 12 jam konsultasi</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: T.g500, textDecoration: 'line-through' }}>Rp 1.25jt/jam</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.success }}>Hemat 97%</div>
          </div>
        </div>
        {['Laporan simulasi bisnis 10 seksi', 'Analisis harga per item menu vs price ceiling', 'Jendela konsultasi AI 12 jam', 'Unduh laporan PDF'].map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'center' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={11} color={T.p600} />
            </div>
            <span style={{ fontSize: 13, color: T.g700 }}>{f}</span>
          </div>
        ))}

        {paymentError && (
          <div style={{ margin: '16px 0 0', padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, fontSize: 12, color: '#EF4444', lineHeight: 1.5 }}>
            {paymentError}
          </div>
        )}

        {paying && (
          <div style={{ marginTop: 20, padding: '14px 18px', background: T.p100, borderRadius: 12, border: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Loader2 size={20} color={T.p600} style={{ animation: 'spin 1s linear infinite' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{paymentStep}</div>
              <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>Jangan tutup halaman ini</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Button variant="ghost" onClick={onClose} disabled={paying}>Batal</Button>
          <Button variant="accent" full onClick={handlePayClick} disabled={paying} style={{ justifyContent: 'center' }}>
            {paying ? (
              <><Loader2 size={15} color={T.c50} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
            ) : (
              'Bayar Sekarang Rp 400.000'
            )}
          </Button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: T.g500 }}>
          Phantom (IDRX) · Pembayaran on-chain terverifikasi
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: T.g500, lineHeight: 1.5 }}>
          Setelah pembayaran dikonfirmasi, kamu akan mengisi detail konsep bisnis untuk laporan yang dipersonalisasi.
        </div>
      </div>
    </div>
  );
}

function BOConceptForm({ cluster: c, onBack, onSubmit, sessionId: externalSessionId }: { cluster: ClusterData; onBack: () => void; onSubmit: (sessionId: string) => void; sessionId?: string | null }) {
  const [step, setStep] = useState(0);
  const [subs, setSubs] = useState<string[]>([]);  // multi-select categories
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState('');
  const [target, setTarget] = useState('');
  const [menu, setMenu] = useState([{ name: '', price: '' }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps = ['Kategori', 'Konsep', 'Menu', 'Konfirmasi'];
  const cats = [
    { id: 'Café / Coffee Shop', emoji: '☕' },
    { id: 'Restoran (full menu)', emoji: '🍽️' },
    { id: 'Bakery / Pastry', emoji: '🥐' },
    { id: 'Minuman Spesial', emoji: '🧋' },
    { id: 'Street Food / Gerobak', emoji: '🍢' },
    { id: 'Cloud Kitchen', emoji: '📦' },
  ];
  const tiers = [
    { id: 'budget', l: 'Budget', d: '< Rp 20K', icon: '💰' },
    { id: 'mid', l: 'Mid-range', d: 'Rp 20–50K', icon: '💳' },
    { id: 'premium', l: 'Premium', d: '> Rp 50K', icon: '⭐' },
  ];

  const toggleCat = (cat: string) => {
    setSubs(prev => prev.includes(cat) ? prev.filter(s => s !== cat) : [...prev, cat]);
  };

  const canNext = [
    subs.length > 0,
    !!name && !!tier && !!target,
    menu.some(m => m.name && m.price),
    true,
  ][step];

  const upMenu = (i: number, f: string, v: string) =>
    setMenu(m => m.map((it, idx) => idx === i ? { ...it, [f]: v } : it));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 28px', borderBottom: `1px solid ${T.c200}`, flexShrink: 0, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onBack()}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.g500, fontFamily: 'inherit', padding: '4px 0' }}
          >
            <ChevronLeft size={16} color={T.g500} /> Kembali
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: T.p100, borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.p600 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.p600 }}>{c.name}</span>
          </div>
        </div>
        <StepsProgress steps={steps} current={step} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {step === 0 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: T.g900, margin: '0 0 4px' }}>Kategori F&B</h3>
            <p style={{ fontSize: 13, color: T.g500, margin: '0 0 6px', lineHeight: 1.5 }}>Pilih satu atau lebih tipe bisnis yang relevan.</p>
            <p style={{ fontSize: 12, color: T.p600, fontWeight: 600, margin: '0 0 20px' }}>
              {subs.length === 0 ? 'Belum ada yang dipilih' : `${subs.length} dipilih: ${subs.join(', ')}`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {cats.map(cat => {
                const sel = subs.includes(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleCat(cat.id)} style={{
                    padding: '14px 16px', borderRadius: 14,
                    border: `2px solid ${sel ? T.p600 : T.c200}`,
                    background: sel ? T.p100 : T.c50,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 150ms', textAlign: 'left',
                    boxShadow: sel ? `0 0 0 1px ${T.p600}22` : 'none',
                  }}>
                    <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? T.p600 : T.g700, lineHeight: 1.3 }}>
                        {cat.id}
                      </div>
                    </div>
                    {sel && (
                      <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={11} color="#fff" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: T.g900, margin: '0 0 4px' }}>Detail Konsep</h3>
            <p style={{ fontSize: 13, color: T.g500, margin: '0 0 20px' }}>Deskripsikan konsep bisnis kamu agar laporan lebih akurat.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 6 }}>
                  Nama Konsep <span style={{ color: T.danger }}>*</span>
                </label>
                <InputField placeholder="contoh: Matcha Corner, Warung Pak Asep..." value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 6 }}>
                  Deskripsi Detail Konsep <span style={{ color: T.danger }}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ceritakan konsep bisnis kamu secara detail — tema, suasana, keunikan, inspirasi, atau apa yang membedakannya dari kompetitor..."
                  style={{
                    width: '100%', padding: '13px 14px', borderRadius: 12,
                    border: `1.5px solid ${description ? T.p600 : T.c200}`,
                    background: T.c50, fontFamily: 'inherit', fontSize: 13,
                    color: T.g900, resize: 'vertical', minHeight: 100,
                    outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
                    transition: 'border-color 150ms',
                  }}
                />
                <div style={{ fontSize: 11, color: T.g500, marginTop: 4 }}>
                  Semakin detail, semakin akurat simulasi yang dihasilkan AI
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 8 }}>
                  Positioning Harga <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {tiers.map(t => (
                    <button key={t.id} onClick={() => setTier(t.id)} style={{
                      flex: 1, padding: '14px 8px', borderRadius: 14,
                      border: `2px solid ${tier === t.id ? T.p600 : T.c200}`,
                      background: tier === t.id ? T.p100 : T.c50,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tier === t.id ? T.p600 : T.g900 }}>{t.l}</div>
                      <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>{t.d}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 6 }}>
                  Target Pelanggan <span style={{ color: T.danger }}>*</span>
                </label>
                <InputField
                  placeholder="contoh: mahasiswa UI, karyawan kantoran 25–35 tahun..."
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: T.g900, margin: '0 0 4px' }}>Rencana Menu</h3>
            <p style={{ fontSize: 13, color: T.g500, margin: '0 0 6px' }}>
              Masukkan produk dan harga rencana kamu. Harga akan dianalisis vs price ceiling cluster ini.
            </p>
            <div style={{ padding: '10px 14px', background: T.p100, borderRadius: 10, marginBottom: 18, fontSize: 12, color: T.p600, fontWeight: 500 }}>
              💡 Price ceiling cluster ini: <strong>Rp {(c.keyStats.priceCeiling / 1000).toFixed(0)}.000</strong> — item di atas angka ini berisiko tinggi
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {menu.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', background: T.c100, borderRadius: 12 }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontSize: 11, color: T.g500, fontWeight: 600, marginBottom: 4 }}>NAMA PRODUK</div>
                    <InputField placeholder="contoh: Matcha Latte, Nasi Goreng..." value={it.name} onChange={e => upMenu(i, 'name', e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: T.g500, fontWeight: 600, marginBottom: 4 }}>HARGA (Rp)</div>
                    <InputField
                      placeholder="28000"
                      value={it.price}
                      onChange={e => upMenu(i, 'price', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  {menu.length > 1 && (
                    <button
                      onClick={() => setMenu(m => m.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: T.danger, fontSize: 18, marginTop: 16, flexShrink: 0 }}
                    >×</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setMenu(m => [...m, { name: '', price: '' }])}
                style={{ padding: '13px', borderRadius: 12, border: `2px dashed ${T.c200}`, background: 'transparent', cursor: 'pointer', color: T.p600, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.p600)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.c200)}
              >
                + Tambah Item Menu
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: T.g900, margin: '0 0 4px' }}>Konfirmasi & Generate</h3>
            <p style={{ fontSize: 13, color: T.g500, margin: '0 0 20px' }}>Tinjau konsep kamu sebelum laporan digenerate. Tambahkan pertanyaan spesifik jika ada.</p>

            {/* Summary card */}
            <div style={{ background: T.c100, borderRadius: 16, padding: '18px', marginBottom: 20, border: `1px solid ${T.c200}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Ringkasan Konsep</div>
              {[
                { l: 'Kategori', v: subs.join(', ') },
                { l: 'Nama Konsep', v: name },
                { l: 'Positioning', v: tiers.find(t => t.id === tier)?.l ?? tier },
                { l: 'Target', v: target },
                { l: 'Jumlah Menu', v: `${menu.filter(m => m.name).length} item` },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, gap: 12 }}>
                  <span style={{ color: T.g500, flexShrink: 0 }}>{r.l}</span>
                  <span style={{ color: T.g900, fontWeight: 600, textAlign: 'right' }}>{r.v}</span>
                </div>
              ))}
              {description && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.c200}` }}>
                  <div style={{ fontSize: 11, color: T.g500, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Deskripsi</div>
                  <div style={{ fontSize: 13, color: T.g700, lineHeight: 1.5 }}>{description}</div>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 6 }}>
                Pertanyaan Spesifik <span style={{ fontSize: 11, color: T.g500, fontWeight: 400 }}>(opsional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ada hal tertentu yang ingin difokuskan dalam laporan? contoh: Saya khawatir dengan kompetisi chain besar, atau apakah konsep saya cocok untuk target mahasiswa..."
                style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${T.c200}`, background: T.c50, fontFamily: 'inherit', fontSize: 13, color: T.g900, resize: 'vertical', minHeight: 100, outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer — only forward action, back is top-left arrow */}
      <div style={{ padding: '14px 28px 20px', borderTop: `1px solid ${T.c200}`, background: '#fff', flexShrink: 0 }}>
        {submitError && (
          <div style={{ marginBottom: 10, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, fontSize: 12, color: '#EF4444' }}>
            {submitError}
          </div>
        )}
        <Button
          full
          disabled={!canNext || submitting}
          variant={step === 3 ? 'accent' : 'primary'}
          onClick={async () => {
            if (step < 3) { setStep(s => s + 1); return; }
            setSubmitting(true);
            setSubmitError(null);
            try {
              const validMenuItems = menu
                .filter(m => m.name.trim() && m.price)
                .map(m => ({ name: m.name.trim(), price: Number(m.price) }));
              const formData = {
                fbSubcategory: subs.join(', '),
                conceptName: name,
                conceptDescription: `[${tier}] ${description}`,
                targetCustomer: target,
                specificQuestions: notes || null,
                menuItems: validMenuItems,
              };

              if (externalSessionId) {
                // Payment already confirmed — submit concept form to existing session
                const res = await fetch(`/api/sessions/${externalSessionId}/concept`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({ error: 'Gagal mengirim form' }));
                  throw new Error(err.error ?? err.message ?? 'Gagal mengirim form');
                }
                const { sessionId } = await res.json();
                onSubmit(sessionId);
              } else {
                // Demo/legacy flow — create session + concept + report in one call
                const res = await fetch('/api/sessions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    clusterId: c.id,
                    ...formData,
                  }),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({ error: 'Gagal membuat sesi' }));
                  throw new Error(err.error ?? 'Gagal membuat sesi');
                }
                const { sessionId } = await res.json();
                onSubmit(sessionId);
              }
            } catch (err) {
              setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
              setSubmitting(false);
            }
          }}
          icon={step === 3 ? <Sparkles size={15} color={T.c50} /> : <ArrowRight size={15} color={T.c50} />}
        >
          {step === 3 ? (submitting ? 'Membuat laporan...' : 'Generate Laporan Sekarang') : 'Lanjut'}
        </Button>
      </div>
    </div>
  );
}

interface SessionData {
  id: string;
  clusterId: string;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
  conceptForm: {
    conceptName: string;
    fbSubcategory: string;
    menuItems: Array<{ name: string; price: number; description?: string }>;
  } | null;
  report: {
    id: string;
    status: string;
    sections: Record<string, { title: string; summary: string; keyPoints: string[]; riskFlags?: string[]; data?: Record<string, unknown> }> | null;
    errorMessage: string | null;
  } | null;
}

function RealSectionExpander({ sectionKey, section, delay }: {
  sectionKey: string;
  section: { title: string; summary: string; keyPoints: string[]; riskFlags?: string[]; data?: Record<string, unknown> };
  delay: number;
}) {
  const [open, setOpen] = useState(sectionKey === 'section6');
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);

  let Icon = BarChart2;
  let iconColor: string = T.p600;
  let bg: string = T.p100;
  if (sectionKey === 'section2') { Icon = Users; iconColor = '#7C3AED'; bg = '#EDE9FE'; }
  if (sectionKey === 'section3') { Icon = TrendingUp; iconColor = T.success; bg = '#D1FAE5'; }
  if (sectionKey === 'section4') { Icon = Activity; iconColor = T.e600; bg = T.e100; }
  if (sectionKey === 'section5') { Icon = MapPin; iconColor = '#0EA5E9'; bg = '#E0F2FE'; }
  if (sectionKey === 'section6') { Icon = DollarSign; iconColor = T.danger; bg = '#FEE2E2'; }
  if (sectionKey === 'section7') { Icon = Target; iconColor = '#8B5CF6'; bg = '#EDE9FE'; }
  if (sectionKey === 'section8') { Icon = Rocket; iconColor = T.p600; bg = T.p100; }
  if (sectionKey === 'section9') { Icon = ShieldAlert; iconColor = T.warning; bg = '#FEF3C7'; }
  if (sectionKey === 'section10') { Icon = LineChart; iconColor = T.success; bg = '#D1FAE5'; }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.c200}`, overflow: 'hidden', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(6px)', transition: `all 300ms ease ${delay}ms` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={iconColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{section.title}</div>
          {!open && <div style={{ fontSize: 12, color: T.g500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{section.summary}</div>}
        </div>
        <span style={{ fontSize: 18, color: T.g500, transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px' }}>
          <p style={{ fontSize: 13, color: T.g700, lineHeight: 1.7, margin: '0 0 14px' }}>{section.summary}</p>
          {section.keyPoints?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.keyPoints.map((kp, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.p600, flexShrink: 0, marginTop: 7 }} />
                  <span style={{ fontSize: 13, color: T.g700, lineHeight: 1.6 }}>{kp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
