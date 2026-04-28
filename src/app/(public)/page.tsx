'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, MessageCircle, FileText, ShieldCheck, Clock, ArrowRight, Check } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceRing } from '@/components/ui/ConfidenceRing';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
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

// Display shape for landing cluster cards (subset of ClusterData)
interface LandingCluster {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  city: string;
  neighborhood: string;
  confidence: number;
  completeness: number;
  zkPoints: number;
  status: 'Active' | 'Seeding';
  categories: string[];
  traffic: string;
  freshness: number;
  accent: string;
  iconColor: string;
  keyStats: {
    priceCeiling: number;
    willingness: number;
    digitalPayment: number;
    peakHour: string;
    dominantAge: string;
    halal: number;
  };
}

// City metadata for clusters known to us — extend as clusters are added
const CLUSTER_CITY_META: Record<string, { city: string; neighborhood: string; subtitle: string; accent: string; iconColor: string }> = {
  'depok-margonda-001': {
    city: 'Depok',
    neighborhood: 'Beji, Depok',
    subtitle: 'UI Gate — Margo City',
    accent: '#E6F3EF',
    iconColor: '#1B7A65',
  },
};

function hoursAgo(isoDate: string): number {
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60));
}

function mapApiToLanding(c: ApiCluster): LandingCluster {
  const meta = CLUSTER_CITY_META[c.slug] ?? {
    city: 'Indonesia',
    neighborhood: c.anchorLabel,
    subtitle: c.anchorLabel,
    accent: '#E6F3EF',
    iconColor: '#1B7A65',
  };
  const ks = c.keyStats;
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    subtitle: meta.subtitle,
    city: meta.city,
    neighborhood: meta.neighborhood,
    confidence: c.confidenceScore,
    completeness: c.dataCompleteness,
    zkPoints: c.totalValidatedFields,
    status: c.status === 'ACTIVE' ? 'Active' : 'Seeding',
    categories: ks.categories.length > 0 ? ks.categories : ['F&B'],
    traffic: ks.trafficLevel,
    freshness: hoursAgo(c.updatedAt),
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
  };
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [vis, setVis] = useState(false);
  const [cityFilter, setCityFilter] = useState('Semua Kota');
  const [apiClusters, setApiClusters] = useState<LandingCluster[]>([]);
  const [heroCluster, setHeroCluster] = useState<{ confidence: number } | null>(null);
  const [clustersLoading, setClustersLoading] = useState(true);

  const cities = ['Semua Kota', 'Depok', 'Jakarta Selatan', 'Tangerang Selatan', 'Surabaya'];

  const filteredClusters = apiClusters.filter(c =>
    cityFilter === 'Semua Kota' || c.city === cityFilter
  );

  useEffect(() => {
    setTimeout(() => setVis(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);

    // Fetch real clusters from API with 6s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    fetch('/api/clusters', { signal: controller.signal })
      .then(r => r.json())
      .then((data: ApiCluster[]) => {
        if (!Array.isArray(data)) return;
        const mapped = data.map(mapApiToLanding);
        setApiClusters(mapped);
        const margonda = data.find(c => c.slug === 'depok-margonda-001');
        if (margonda) setHeroCluster({ confidence: margonda.confidenceScore });
      })
      .catch(() => { /* fail silently — hero card shows static fallback */ })
      .finally(() => {
        clearTimeout(timeout);
        setClustersLoading(false);
      });

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif", background: T.c50, color: T.g900, minHeight: '100vh' }}>

      {/* FLOATING NAV */}
      <nav style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', alignItems: 'center',
        background: scrolled ? 'rgba(253,251,247,0.92)' : 'rgba(253,251,247,0.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${scrolled ? T.c200 : 'rgba(245,241,236,0.6)'}`,
        borderRadius: 9999, padding: '8px 10px 8px 20px',
        boxShadow: scrolled ? '0 4px 24px rgba(26,26,26,0.09)' : '0 2px 12px rgba(26,26,26,0.05)',
        transition: 'all 300ms ease',
        width: 'min(860px, calc(100vw - 40px))',
      }}>
        <Image src="/logo.png" alt="LOKAL" width={90} height={30} style={{ objectFit: 'contain', marginRight: 24 }} />
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[
            { label: 'Jelajahi', id: 'section-clusters' },
            { label: 'Cara Kerja', id: 'section-how' },
            { label: 'Harga', id: 'section-pricing' },
          ].map(item => (
            <NavLink key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: T.g700, textDecoration: 'none' }}>
            Masuk
          </a>
          <Button onClick={() => { window.location.href = '/login'; }}>Mulai Gratis</Button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 5% 80px', maxWidth: 1200, margin: '0 auto', gap: 60, position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: 480, height: 480, borderRadius: '50%', background: `radial-gradient(circle, ${T.p100} 0%, transparent 70%)`, opacity: 0.7, animation: 'heroPulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${T.e100} 0%, transparent 70%)`, opacity: 0.6, animation: 'heroPulse 10s ease-in-out 2s infinite' }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035 }}>
            <defs>
              <pattern id="herogrid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke={T.g900} strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#herogrid)" />
          </svg>
        </div>

        {/* Left content */}
        <div style={{ flex: '0 0 52%', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(24px)', transition: 'all 600ms ease', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.p100, border: `1px solid ${T.p400}30`, borderRadius: 9999, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.p600 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.p600, letterSpacing: '0.02em' }}>Platform Intelijen F&B Hyperlokal Indonesia</span>
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 5.5vw, 76px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 24px', color: T.g900 }}>
            Simulate<br />
            <span style={{ color: T.p600, fontStyle: 'italic' }}>before you</span><br />
            operate.
          </h1>
          <p style={{ fontSize: 18, color: T.g500, lineHeight: 1.7, margin: '0 0 36px', maxWidth: '46ch' }}>
            Validasi konsep F&B kamu terhadap data pasar hyperlokal terverifikasi — sebelum tanda tangan kontrak sewa.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="lg" onClick={() => { window.location.href = '/clusters'; }} icon={<MapPin size={18} color={T.c50} />}>
              Jelajahi Cluster
            </Button>
            <Button size="lg" variant="secondary" onClick={() => scrollTo('section-how')}>
              Lihat Demo →
            </Button>
          </div>
          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
              {['#1B7A65', '#C17A5F', '#5B8BA0', '#D4A03D'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i > 0 ? -8 : 0 }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: T.g500 }}>Sudah dipercaya oleh 200+ calon pengusaha F&B</span>
          </div>
        </div>

        {/* Right — cluster card visual */}
        <div style={{ flex: 1, opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(32px)', transition: 'all 700ms ease 150ms', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ background: T.c100, borderRadius: 20, border: `1px solid ${T.c200}`, overflow: 'hidden', boxShadow: '0 16px 48px rgba(26,26,26,0.10)' }}>
              <MapPlaceholder accent="#E6F3EF" color={T.p400} height={160} />
              <div style={{ padding: '20px 22px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>Jalan Margonda</div>
                    <div style={{ fontSize: 13, color: T.g500, marginTop: 2 }}>UI Gate — Margo City · Depok</div>
                  </div>
                  <ConfidenceRing score={heroCluster?.confidence ?? 87} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Badge variant="active"><ShieldCheck size={10} color={T.p600} /> Active</Badge>
                  <Badge variant="dark"><ShieldCheck size={10} color={T.c50} /> 34 titik data</Badge>
                  <Badge variant="neutral"><Clock size={10} color={T.g500} /> 23j lalu</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { l: 'Price Ceiling Café', v: 'Rp 35.000' },
                    { l: 'Dominan Usia', v: '18–25th (58%)' },
                    { l: 'Digital Payment', v: '87% adoption' },
                    { l: 'Peak Traffic', v: '800–1.200/jam' },
                  ].map(s => (
                    <div key={s.l} style={{ background: T.c50, borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, marginBottom: 3 }}>{s.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <Button full onClick={() => { window.location.href = '/login'; }} icon={<MessageCircle size={15} color={T.c50} />}>
                  Chat Gratis 7 Pesan
                </Button>
              </div>
            </div>
            {/* Floating score badge */}
            <div style={{ position: 'absolute', top: -16, right: -16, background: T.g900, borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 24px rgba(26,26,26,0.2)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Confidence Score</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.c50, letterSpacing: '-0.02em' }}>{heroCluster?.confidence ?? 87}<span style={{ fontSize: 12, opacity: 0.6 }}>/100</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: T.g900, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.p400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Mengapa LOKAL Ada</div>
          <blockquote style={{ fontSize: 'clamp(18px,2.2vw,26px)', color: 'rgba(253,251,247,0.9)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: '70ch', margin: '0 0 12px', fontWeight: 400 }}>
            &ldquo;Paman saya buka café matcha premium di Depok dengan harga Rp 50.000 — sama dengan Jakarta. Tutup dalam beberapa bulan. Price ceiling Depok adalah Rp 28.000. Tidak ada yang memberitahunya.&rdquo;
          </blockquote>
          <div style={{ fontSize: 13, color: 'rgba(253,251,247,0.4)', marginBottom: 60 }}>— Kisah yang mendirikan LOKAL</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {[
              { val: '60–90%', label: 'bisnis F&B gagal di tahun pertama' },
              { val: '4.85 juta', label: 'UMKM F&B beroperasi di Indonesia' },
              { val: 'Rp 1.25jt', label: 'per jam biaya konsultan F&B' },
              { val: 'Rp 400K', label: 'satu sesi simulasi LOKAL' },
            ].map((s, i) => (
              <div key={i} style={{ borderTop: `2px solid ${i === 3 ? T.p600 : 'rgba(255,255,255,0.12)'}`, paddingTop: 20 }}>
                <div style={{ fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 700, color: i === 3 ? T.p400 : T.c50, letterSpacing: '-0.02em', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'rgba(253,251,247,0.5)', lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="section-how" style={{ padding: '80px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Cara Kerja</div>
        <h2 style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 0 52px' }}>
          Tiga langkah<br />menuju keputusan yang tepat.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
          {[
            { n: '01', icon: <MapPin size={22} color={T.p600} />, t: 'Pilih Cluster', d: 'Temukan koridor 1.5km yang relevan dengan lokasi target kamu dari daftar cluster terverifikasi.' },
            { n: '02', icon: <MessageCircle size={22} color={T.p600} />, t: 'Chat Gratis 7 Pesan', d: 'Tanya langsung ke AI konsultan tentang harga, kompetitor, dan perilaku pasar lokal. Gratis.' },
            { n: '03', icon: <FileText size={22} color={T.p600} />, t: 'Buka Laporan Lengkap', d: 'Bayar Rp 400K untuk simulasi 10-seksi + jendela konsultasi AI 12 jam.' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.p400, letterSpacing: '0.06em', marginBottom: 20 }}>{s.n}</div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 10px' }}>{s.t}</h3>
              <p style={{ fontSize: 15, color: T.g500, lineHeight: 1.65, margin: 0 }}>{s.d}</p>
              {i < 2 && <div style={{ position: 'absolute', top: 68, right: -16, color: T.c200, fontSize: 24 }}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CLUSTER PREVIEW */}
      <section id="section-clusters" style={{ padding: '20px 5% 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Cluster Aktif</div>
            <h2 style={{ fontSize: 'clamp(24px,2.5vw,36px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: 0 }}>Data lapangan terverifikasi, diperbarui tiap kuartal.</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cities.map(c => (
              <button key={c} onClick={() => setCityFilter(c)} style={{
                padding: '7px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 150ms',
                background: cityFilter === c ? T.p600 : T.c200,
                color: cityFilter === c ? T.c50 : T.g700,
              }}>{c}</button>
            ))}
          </div>
        </div>
        {clustersLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: T.g500, fontSize: 14 }}>
            Memuat data cluster...
          </div>
        ) : filteredClusters.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {filteredClusters.map((c, i) => <LandingClusterCard key={c.id} cluster={c} delay={i * 80} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>
              {cityFilter === 'Semua Kota' ? 'Belum ada cluster aktif' : `Belum ada cluster di ${cityFilter}`}
            </div>
            <div style={{ fontSize: 14, color: T.g500 }}>Segera hadir — kami sedang memperluas coverage ke kota-kota baru.</div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Button variant="secondary" onClick={() => { window.location.href = '/clusters'; }} icon={<ArrowRight size={15} color={T.p600} />}>
            Lihat Semua Cluster
          </Button>
        </div>
      </section>

      {/* PRICING */}
      <section id="section-pricing" style={{ padding: '80px 5%', background: T.c100 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Harga Transparan</div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: 0 }}>Mulai gratis. Bayar hanya saat kamu siap simulasi.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { name: 'Free', price: 'Rp 0', period: '', desc: '7 pesan gratis per cluster', features: ['7 pesan AI per cluster', 'Preview data cluster', 'Tanpa kartu kredit'], cta: 'Mulai Sekarang', highlight: false },
              { name: 'Pay-per-use', price: 'Rp 400K', period: '/sesi', desc: 'Untuk satu konsep di satu cluster', features: ['Laporan simulasi 10 seksi', 'Analisis harga per menu', 'Jendela konsultasi AI 12 jam', 'Unduh PDF laporan'], cta: 'Beli Sesi', highlight: true },
              { name: 'Explorer', price: 'Rp 1.2jt', period: '/bulan', desc: '4 sesi/bulan, bisa rollover', features: ['4 kredit/bulan', 'Rollover max 2 sesi', 'Semua fitur Pay-per-use', 'Prioritas support'], cta: 'Pilih Explorer', highlight: false },
            ].map((p, i) => (
              <div key={i} style={{
                background: p.highlight ? T.g900 : T.c50,
                borderRadius: 20, padding: '28px 26px',
                border: p.highlight ? 'none' : `1px solid ${T.c200}`,
                boxShadow: p.highlight ? '0 12px 40px rgba(26,26,26,0.15)' : '0 2px 8px rgba(26,26,26,0.04)',
                position: 'relative', overflow: 'hidden',
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: 16, right: 16 }}><Badge variant="active">Populer</Badge></div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? T.p400 : T.g500, marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: p.highlight ? T.c50 : T.g900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
                  {p.period && <span style={{ fontSize: 13, color: p.highlight ? 'rgba(253,251,247,0.5)' : T.g500 }}>{p.period}</span>}
                </div>
                <p style={{ fontSize: 13, color: p.highlight ? 'rgba(253,251,247,0.6)' : T.g500, margin: '0 0 20px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={10} color={T.p600} />
                      </div>
                      <span style={{ fontSize: 13, color: p.highlight ? 'rgba(253,251,247,0.8)' : T.g700 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Button variant={p.highlight ? 'primary' : 'secondary'} full onClick={() => { window.location.href = '/login'; }}>{p.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 5%', background: T.g900 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <Image src="/logo.png" alt="LOKAL" width={90} height={30} style={{ objectFit: 'contain', marginBottom: 12, filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: 13, color: 'rgba(253,251,247,0.4)', maxWidth: '40ch', lineHeight: 1.6, margin: 0 }}>
              Platform intelijen F&B hyperlokal pertama di Indonesia, ditenagai data lapangan terverifikasi dan Solana blockchain.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              <ShieldCheck size={11} color="rgba(255,255,255,0.6)" /> Powered by Solana
            </Badge>
            <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              ZK Verified Data
            </Badge>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '24px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(253,251,247,0.25)' }}>
          © 2025 LOKAL AI · Powered by Solana · Superteam Indonesia — Frontier Colosseum 2025
        </div>
      </footer>
    </div>
  );
}

function NavLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} style={{
      background: hov ? T.c200 : 'none', border: 'none', cursor: 'pointer',
      padding: '7px 14px', borderRadius: 9999, fontSize: 14, fontWeight: 500,
      color: T.g700, fontFamily: 'inherit', transition: 'all 150ms',
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
}

function LandingClusterCard({ cluster: c, delay }: { cluster: LandingCluster; delay: number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      onClick={() => { window.location.href = '/login'; }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.c50, borderRadius: 18, border: `1px solid ${T.c200}`, overflow: 'hidden', cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (hov ? 'translateY(-3px)' : 'none') : 'translateY(12px)',
        transition: `opacity 350ms ease ${delay}ms, transform 250ms ease, box-shadow 250ms ease`,
        boxShadow: hov ? '0 12px 32px rgba(26,26,26,0.10)' : '0 2px 8px rgba(26,26,26,0.04)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <MapPlaceholder accent={c.accent} color={c.iconColor} height={130} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <Badge variant={c.status === 'Active' ? 'active' : 'seeding'}>{c.status}</Badge>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <ConfidenceRing score={c.confidence} size={40} />
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 2 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: T.g500, marginBottom: 12 }}>{c.subtitle} · {c.neighborhood}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { l: 'Price Ceiling', v: `Rp ${(c.keyStats.priceCeiling / 1000).toFixed(0)}K` },
            { l: 'ZK Data Points', v: `${c.zkPoints} titik` },
            { l: 'Traffic', v: c.traffic },
            { l: 'Diperbarui', v: `${c.freshness}j lalu` },
          ].map(s => (
            <div key={s.l} style={{ background: T.c100, borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: T.g500, fontWeight: 600 }}>{s.l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g900, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {c.categories.slice(0, 3).map(cat => <Badge key={cat} variant="neutral" style={{ fontSize: 10 }}>{cat}</Badge>)}
        </div>
        <Button full size="sm" onClick={(e?: any) => { e?.stopPropagation(); window.location.href = '/login'; }} icon={<MessageCircle size={14} color={T.c50} />}>
          Chat Gratis
        </Button>
      </div>
    </div>
  );
}
