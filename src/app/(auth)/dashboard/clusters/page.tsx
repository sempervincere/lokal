'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, MessageCircle, ChevronLeft, TrendingDown, CreditCard, Clock, Users, Activity, BarChart2, ShieldCheck, Sparkles, Lock, ArrowRight, Check } from 'lucide-react';
import { T, CLUSTERS, ClusterData, REPORT_SECTIONS, MENU_ITEMS } from '@/lib/constants/mock-data';
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
import { SectionExpander } from '@/components/ui/SectionExpander';
import { StepsProgress } from '@/components/ui/StepsProgress';

type View = 'list' | 'detail' | 'chat' | 'paywall' | 'form' | 'report';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  BarChart2: <BarChart2 size={16} color={T.p600} />,
  Users: <Users size={16} color={T.p600} />,
  DollarSign: <span style={{ fontSize: 16, color: T.p600 }}>$</span>,
  MapPin: <span style={{ fontSize: 16, color: T.p600 }}>📍</span>,
  TrendingDown: <TrendingDown size={16} color={T.p600} />,
  Star: <span style={{ fontSize: 16 }}>⭐</span>,
  Sparkles: <Sparkles size={16} color={T.p600} />,
  AlertTriangle: <span style={{ fontSize: 16 }}>⚠️</span>,
};

export default function BOClustersPage() {
  const [view, setView] = useState<View>('list');
  const [selected, setSelected] = useState<ClusterData | null>(null);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);

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
      .then(r => r.json())
      .then((data: ApiCluster[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setClusters(data.map(mapApiToClusterData));
        } else {
          // API returned error object or empty — fall back to mock
          setClusters(CLUSTERS);
        }
      })
      .catch(() => {
        setClusters(CLUSTERS);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

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

  if (view === 'report' && selected) return <BOReport cluster={selected} onBack={() => setView('list')} />;
  if (view === 'form' && selected) return <BOConceptForm cluster={selected} onBack={() => setView('detail')} onSubmit={() => setView('report')} />;
  if (view === 'paywall' && selected) return <BOPaywall cluster={selected} onClose={() => setView('detail')} onContinue={() => setView('form')} />;
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
        <div style={{ fontSize: 13, color: T.g500, padding: '32px 0', textAlign: 'center' }}>
          Memuat data cluster...
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
              Chat Gratis Sekarang
            </Button>
            <div style={{ textAlign: 'center', fontSize: 12, color: T.g500, marginBottom: 10 }}>
              7 pesan gratis · Tidak perlu pembayaran
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: T.c200 }} />
              <span style={{ fontSize: 11, color: T.g500, fontWeight: 600 }}>atau</span>
              <div style={{ flex: 1, height: 1, background: T.c200 }} />
            </div>
            <Button full variant="accent" icon={<Sparkles size={15} color={T.c50} />} onClick={onSkipToReport} style={{ marginBottom: 6 }}>
              Langsung Generate Laporan
            </Button>
            <div style={{ textAlign: 'center', fontSize: 11, color: T.g500, marginBottom: 16 }}>
              Rp 400.000 · Laporan 10 seksi + 12 jam konsultasi
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
    text: `Halo! Saya asisten LOKAL untuk cluster **${c.name}**. Tanya apa saja tentang area ini. Kamu punya **7 pesan gratis**.`,
    cta: false,
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState(0);
  const MAX = 7;

  const AI_RESPONSES = [
    `Harga rata-rata kopi di ${c.name} berkisar **Rp ${(c.keyStats.willingness / 1000).toFixed(0)}.000–${(c.keyStats.priceCeiling / 1000).toFixed(0)}.000**. Price ceiling terverifikasi: **Rp ${(c.keyStats.priceCeiling / 1000).toFixed(0)}.000**.`,
    `Segmen dominan adalah **${c.keyStats.dominantAge}**. Digital payment adoption: **${c.keyStats.digitalPayment}%**. GoPay dan OVO paling populer.`,
    `Traffic peak di cluster ini: **${c.keyStats.peakHour}**. Level traffic keseluruhan: **${c.traffic}**.`,
    `Saturasi pasar: **${c.saturation}**. Ada gap di specialty coffee lokal dengan harga accessible di bawah Rp 32.000.`,
    `Untuk konsep café, sweet spot harga adalah **Rp ${(c.keyStats.willingness * 0.8 / 1000).toFixed(0)}K–${(c.keyStats.willingness / 1000).toFixed(0)}K**. Di atas itu, konversi turun drastis.`,
    `Kamu sudah hampir mencapai batas pesan gratis. Buka **laporan simulasi lengkap** untuk analisis 10 seksi + konsultasi 12 jam.`,
  ];

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    const nu = used + 1;
    setUsed(nu);
    setMsgs(m => [...m, { id: Date.now(), role: 'user', text, cta: false }]);
    setInput('');
    if (nu >= MAX) { setTimeout(onPaywall, 800); return; }
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const resp = AI_RESPONSES[Math.min(nu - 1, AI_RESPONSES.length - 1)];
      setMsgs(m => [...m, { id: Date.now() + 1, role: 'ai', text: resp, cta: nu >= MAX - 1 }]);
    }, 1100 + Math.random() * 500);
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
          <Sparkles size={12} color={T.c50} /> Langsung Generate Laporan →
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
        {used === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {['Berapa price ceiling di sini?', 'Siapa kompetitor terkuat?', 'Apakah cocok untuk konsep premium?'].map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.c200}`, background: T.c50, color: T.p600, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = T.p100)}
                onMouseLeave={e => (e.currentTarget.style.background = T.c50)}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '14px 24px 20px', borderTop: `1px solid ${T.c200}`, flexShrink: 0, background: T.c50 }}>
        {used >= MAX ? (
          <Button variant="accent" full size="lg" onClick={onPaywall} icon={<Lock size={16} color={T.c50} />}>
            Buka Simulasi Bisnis — Rp 400.000
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <InputField placeholder="Tanya tentang cluster ini..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} />
            </div>
            <button onClick={() => send(input)} disabled={!input.trim() || typing} style={{ width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', background: !input.trim() || typing ? T.c200 : T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
              <ArrowRight size={17} color={!input.trim() || typing ? T.g500 : T.c50} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BOPaywall({ cluster: c, onClose, onContinue }: { cluster: ClusterData; onClose: () => void; onContinue: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
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
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button variant="accent" full onClick={onContinue} icon={<ArrowRight size={15} color={T.c50} />}>
            Isi Konsep & Bayar
          </Button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: T.g500 }}>
          GoPay · OVO · Bank Transfer · Phantom (IDRX)
        </div>
      </div>
    </div>
  );
}

function BOConceptForm({ cluster: c, onBack, onSubmit }: { cluster: ClusterData; onBack: () => void; onSubmit: () => void }) {
  const [step, setStep] = useState(0);
  const [sub, setSub] = useState('');
  const [name, setName] = useState('');
  const [tier, setTier] = useState('');
  const [target, setTarget] = useState('');
  const [menu, setMenu] = useState([{ name: '', price: '' }]);
  const [notes, setNotes] = useState('');

  const steps = ['Kategori', 'Konsep', 'Menu', 'Detail'];
  const cats = ['Café / Coffee Shop', 'Restoran (full menu)', 'Bakery / Pastry', 'Minuman Spesial', 'Street Food / Gerobak', 'Cloud Kitchen'];
  const tiers = [
    { id: 'budget', l: 'Budget', d: '< Rp 20K rata-rata' },
    { id: 'mid', l: 'Mid-range', d: 'Rp 20–50K rata-rata' },
    { id: 'premium', l: 'Premium', d: '> Rp 50K rata-rata' },
  ];
  const canNext = [!!sub, !!name && !!tier && !!target, menu.some(m => m.name && m.price), true][step];
  const upMenu = (i: number, f: string, v: string) => setMenu(m => m.map((it, idx) => idx === i ? { ...it, [f]: v } : it));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${T.c200}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.g500, marginBottom: 14, fontFamily: 'inherit' }}>
          <ChevronLeft size={16} color={T.g500} /> Kembali
        </button>
        <div style={{ fontSize: 13, color: T.g500, marginBottom: 12 }}>Cluster: <strong style={{ color: T.g900 }}>{c.name}</strong></div>
        <StepsProgress steps={steps} current={step} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 600 }}>
        {step === 0 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>Kategori F&B</h3>
            <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>Pilih tipe bisnis yang paling sesuai.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {cats.map(cat => (
                <button key={cat} onClick={() => setSub(cat)} style={{ padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${sub === cat ? T.p600 : T.c200}`, background: sub === cat ? T.p100 : T.c50, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: sub === cat ? 600 : 400, color: sub === cat ? T.p600 : T.g700, textAlign: 'left', transition: 'all 150ms' }}>{cat}</button>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>Detail Konsep</h3>
            <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>Ceritakan tentang konsep kamu.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 6 }}>Nama Konsep</label>
                <InputField placeholder="contoh: Matcha Corner..." value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 8 }}>Positioning Harga</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {tiers.map(t => (
                    <button key={t.id} onClick={() => setTier(t.id)} style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${tier === t.id ? T.p600 : T.c200}`, background: tier === t.id ? T.p100 : T.c50, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tier === t.id ? T.p600 : T.g900 }}>{t.l}</div>
                      <div style={{ fontSize: 11, color: T.g500, marginTop: 3 }}>{t.d}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 6 }}>Target Pelanggan</label>
                <InputField placeholder="contoh: mahasiswa, karyawan kantoran..." value={target} onChange={e => setTarget(e.target.value)} />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>Menu Builder</h3>
            <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>Masukkan produk dan harga rencana kamu.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {menu.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 2 }}><InputField placeholder="Nama produk" value={it.name} onChange={e => upMenu(i, 'name', e.target.value)} /></div>
                  <div style={{ flex: 1 }}><InputField placeholder="Rp harga" value={it.price} onChange={e => upMenu(i, 'price', e.target.value.replace(/\D/, ''))} /></div>
                  {menu.length > 1 && <button onClick={() => setMenu(m => m.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 18, color: T.danger }}>×</button>}
                </div>
              ))}
              <button onClick={() => setMenu(m => [...m, { name: '', price: '' }])} style={{ padding: '12px', borderRadius: 12, border: `2px dashed ${T.c200}`, background: 'transparent', cursor: 'pointer', color: T.g500, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                + Tambah item
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>Pertanyaan Spesifik</h3>
            <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>Ada hal tertentu yang ingin difokuskan? (opsional)</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="contoh: Saya khawatir dengan kompetisi chain besar..." style={{ width: '100%', padding: '14px', borderRadius: 12, border: `1.5px solid ${T.c200}`, background: T.c50, fontFamily: 'inherit', fontSize: 14, color: T.g900, resize: 'vertical', minHeight: 120, outline: 'none', lineHeight: 1.6, boxSizing: 'border-box', marginBottom: 20 }} />
            <div style={{ background: T.p100, borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, marginBottom: 10 }}>Ringkasan Konsep</div>
              {[{ l: 'Kategori', v: sub }, { l: 'Nama', v: name }, { l: 'Harga', v: tiers.find(t => t.id === tier)?.l }, { l: 'Target', v: target }, { l: 'Menu', v: `${menu.filter(m => m.name).length} item` }].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: T.g500 }}>{r.l}</span>
                  <span style={{ color: T.g900, fontWeight: 600 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '16px 32px 24px', borderTop: `1px solid ${T.c200}`, display: 'flex', gap: 10, background: T.c50 }}>
        {step > 0 && <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Kembali</Button>}
        <Button full={step === 0} disabled={!canNext} variant={step === 3 ? 'accent' : 'primary'} onClick={() => step < 3 ? setStep(s => s + 1) : onSubmit()} icon={step === 3 ? <Lock size={15} color={T.c50} /> : undefined}>
          {step === 3 ? 'Bayar & Generate Laporan' : 'Lanjut'}
        </Button>
      </div>
    </div>
  );
}

function BOReport({ cluster: c, onBack }: { cluster: ClusterData; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progLabel, setProgLabel] = useState('Menganalisis data cluster...');
  const [timeLeft, setTimeLeft] = useState(43200);
  const [rating, setRating] = useState(0);
  const progSteps = ['Menganalisis data cluster...', 'Membandingkan harga menu...', 'Memetakan kompetitor...', 'Menyusun proyeksi...', 'Laporan siap!'];

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += 3.5;
      setProgress(Math.min(p, 100));
      setProgLabel(progSteps[Math.min(Math.floor(p / 25), 4)]);
      if (p >= 100) { clearInterval(iv); setTimeout(() => setLoading(false), 400); }
    }, 70);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (loading) return;
    const iv = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [loading]);

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Sparkles size={32} color={T.p600} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Membuat laporan kamu...</div>
      <div style={{ fontSize: 13, color: T.g500, marginBottom: 28 }}>{progLabel}</div>
      <div style={{ width: 320, height: 6, background: T.c200, borderRadius: 9999, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: T.p600, borderRadius: 9999, transition: 'width 200ms ease' }} />
      </div>
      <div style={{ fontSize: 12, color: T.g500 }}>{Math.round(progress)}%</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Report header */}
      <div style={{ background: T.g900, padding: '24px 32px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontFamily: 'inherit' }}>
          <ChevronLeft size={15} color="rgba(255,255,255,0.5)" /> Kembali
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Badge variant="active">Laporan Selesai</Badge>
              <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                <Clock size={10} color="rgba(255,255,255,0.7)" /> Sesi berakhir dalam: {fmt(timeLeft)}
              </Badge>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: T.c50, letterSpacing: '-0.01em', margin: '0 0 4px' }}>Kopi Nusantara — Café Specialty</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{c.name} · Café / Coffee Shop</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 9999, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', color: T.c50, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↓ Unduh PDF
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
        {/* Menu price analysis */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Analisis Harga Menu</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            {MENU_ITEMS.map((item, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 14, background: item.status === 'ok' ? T.p100 : item.status === 'warn' ? T.e100 : '#FEF2F2', border: `1px solid ${item.status === 'ok' ? '#C8E8DF' : item.status === 'warn' ? '#F2CAB8' : '#FECACA'}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>Rp {item.price.toLocaleString('id')}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.status === 'ok' ? T.success : item.status === 'warn' ? T.e600 : T.danger }}>{item.note}</div>
                <div style={{ height: 3, background: 'rgba(0,0,0,0.08)', borderRadius: 9999, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((item.price / item.ceiling) * 100, 100)}%`, background: item.status === 'ok' ? T.success : item.status === 'warn' ? T.e600 : T.danger, borderRadius: 9999 }} />
                </div>
                <div style={{ fontSize: 10, color: T.g500, marginTop: 4 }}>Ceiling: Rp {item.ceiling.toLocaleString('id')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 10 sections */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Analisis Lengkap (10 Seksi)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REPORT_SECTIONS.map((s, i) => (
              <SectionExpander key={s.id} section={s} delay={i * 60} iconElement={SECTION_ICONS[s.icon] ?? <span style={{ fontSize: 14 }}>📊</span>} />
            ))}
          </div>
        </div>

        {/* Rating */}
        <div style={{ background: T.c100, borderRadius: 16, padding: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.g900 }}>Laporan ini membantu?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${rating >= n ? T.warning : T.c200}`, background: rating >= n ? '#FEF3C7' : T.c50, cursor: 'pointer', fontSize: 18, transition: 'all 150ms' }}>⭐</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
