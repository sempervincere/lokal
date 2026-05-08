'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, MessageCircle, FileText, ShieldCheck, Clock, ArrowRight, Check, Sparkles, TrendingUp, Zap, Eye, Bell } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceRing } from '@/components/ui/ConfidenceRing';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';
import type { ClusterKeyStats } from '@/lib/utils/clusterStats';

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

const CLUSTER_CITY_META: Record<string, { city: string; neighborhood: string; subtitle: string; accent: string; iconColor: string }> = {
  'depok-margonda-001': {
    city: 'Depok',
    neighborhood: 'Beji, Depok',
    subtitle: 'UI Gate ke Margo City',
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
      peakHour: ks.peakHour ?? '-',
      dominantAge: ks.dominantAge ?? '-',
      halal: ks.halal ?? 0,
    },
  };
}

function FloatingParticle({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      opacity: 0,
      animation: `floatParticle ${10 + delay}s ease-in-out ${delay}s infinite, fadeInUp 1.5s ease ${delay}s forwards`,
      filter: 'blur(2px)',
    }} />
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [vis, setVis] = useState(false);
  const [cityFilter, setCityFilter] = useState('Semua Kota');
  const [apiClusters, setApiClusters] = useState<LandingCluster[]>([]);
  const [heroCluster, setHeroCluster] = useState<{ confidence: number } | null>(null);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [activeStat, setActiveStat] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const cities = ['Semua Kota', 'Depok', 'Jakarta Selatan', 'Tangerang Selatan', 'Surabaya'];

  const filteredClusters = apiClusters.filter(c =>
    cityFilter === 'Semua Kota' || c.city === cityFilter
  );

  useEffect(() => {
    setTimeout(() => setVis(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);

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
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        setClustersLoading(false);
      });

    const statInterval = setInterval(() => {
      setActiveStat(prev => (prev + 1) % 4);
    }, 3000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timeout);
      controller.abort();
      clearInterval(statInterval);
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) return;
    setWaitlistSubmitted(true);
    setTimeout(() => setWaitlistSubmitted(false), 3000);
    setWaitlistEmail('');
  };

  const stats = [
    { val: '60-90%', label: 'bisnis F&B gagal di tahun pertama' },
    { val: '4.85 juta', label: 'UMKM F&B beroperasi di Indonesia' },
    { val: 'Rp 1.25jt', label: 'per jam biaya konsultan F&B' },
    { val: 'Rp 400K', label: 'satu sesi simulasi LOKAL' },
  ];

  const upcomingClusters = [
    { name: 'Kemang', city: 'Jakarta Selatan', demand: 892, status: 'high' as const, color: T.info, accent: '#EAF3F7' },
    { name: 'BSD Raya', city: 'Tangerang Selatan', demand: 654, status: 'high' as const, color: T.e600, accent: '#F5E9E3' },
    { name: 'Tunjungan Plaza', city: 'Surabaya', demand: 423, status: 'medium' as const, color: T.warning, accent: '#FEF9EB' },
    { name: 'Dago', city: 'Bandung', demand: 312, status: 'medium' as const, color: T.p600, accent: '#E6F3EF' },
    { name: 'Malioboro', city: 'Yogyakarta', demand: 567, status: 'high' as const, color: T.info, accent: '#EAF3F7' },
  ];

  return (
    <div style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif", background: T.c50, color: T.g900, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* FLOATING NAV */}
      <nav style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', alignItems: 'center',
        background: scrolled ? 'rgba(253,251,247,0.95)' : 'rgba(253,251,247,0.8)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${scrolled ? T.c200 : 'rgba(245,241,236,0.6)'}`,
        borderRadius: 9999, padding: '8px 12px 8px 20px',
        boxShadow: scrolled ? '0 8px 32px rgba(26,26,26,0.12)' : '0 4px 16px rgba(26,26,26,0.06)',
        transition: 'all 300ms ease',
        width: 'min(900px, calc(100vw - 32px))',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="LOKAL" width={90} height={30} style={{ objectFit: 'contain' }} />
        </a>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
          {[
            { label: 'Jelajahi', id: 'section-clusters' },
            { label: 'Cara Kerja', id: 'section-how' },
            { label: 'Harga', id: 'section-pricing' },
          ].map(item => (
            <NavLink key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</NavLink>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button onClick={() => { window.location.href = '/login'; }}>Mulai Gratis</Button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 5% 80px', maxWidth: 1200, margin: '0 auto', gap: 60, position: 'relative' }}>
        {/* Animated background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Subtle animated mesh gradients */}
          <div style={{
            position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${T.p100} 0%, transparent 70%)`,
            opacity: 0.5,
            animation: 'meshShift 15s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-5%', right: '-5%', width: '40%', height: '40%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${T.e100} 0%, transparent 70%)`,
            opacity: 0.4,
            animation: 'meshShift 18s ease-in-out 3s infinite reverse',
          }} />

          {/* Diagonal gradient rays for depth */}
          <div style={{
            position: 'absolute',
            top: '-20%', left: '-10%',
            width: '80%', height: '140%',
            background: `linear-gradient(135deg, ${T.p100}20 0%, transparent 50%)`,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            top: '-10%', right: '-20%',
            width: '60%', height: '120%',
            background: `linear-gradient(225deg, ${T.e100}15 0%, transparent 50%)`,
            transform: 'rotate(10deg)',
            pointerEvents: 'none',
          }} />

          {/* Soft vignette for readability */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(253,251,247,0.4) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Floating particles - reduced to 3, larger, softer */}
          <FloatingParticle delay={0} size={6} x="15%" y="25%" color={T.p400} />
          <FloatingParticle delay={3} size={8} x="78%" y="18%" color={T.p500} />
          <FloatingParticle delay={1.5} size={5} x="85%" y="65%" color={T.e500} />

          {/* Grid pattern */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.02 }}>
            <defs>
              <pattern id="herogrid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke={T.g900} strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#herogrid)" />
          </svg>
        </div>

        {/* Left content */}
        <div style={{ flex: '0 0 52%', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(24px)', transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.p100, border: `1px solid ${T.p400}25`, borderRadius: 9999, padding: '6px 16px', marginBottom: 28 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.p600, animation: 'dataNodePulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.p600, letterSpacing: '0.02em' }}>Platform Intelijen F&B Hyperlokal Indonesia</span>
          </div>
          <h1 style={{ fontSize: 'clamp(42px, 5.5vw, 72px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 24px', color: T.g900 }}>
            Simulate<br />
            <span style={{ color: T.p600, fontStyle: 'italic' }}>before you</span><br />
            operate.
          </h1>
          <p style={{ fontSize: 18, color: T.g500, lineHeight: 1.7, margin: '0 0 36px', maxWidth: '48ch' }}>
            Jangan tebak-tebakan lagi. Validasi konsep F&B kamu dengan data pasar hyperlokal terverifikasi. Jangan biarkan modal habis di lokasi yang salah.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="lg" onClick={() => { window.location.href = '/clusters'; }} icon={<MapPin size={18} color={T.c50} />}>
              Jelajahi Cluster
            </Button>
            <Button size="lg" variant="secondary" onClick={() => scrollTo('section-how')}>
              Lihat Cara Kerja
            </Button>
          </div>
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['#1B7A65', '#C17A5F', '#5B8BA0', '#D4A03D'].map((c, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: '2.5px solid white', marginLeft: i > 0 ? -9 : 0, transition: 'transform 200ms ease' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-3px) scale(1.1)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; }}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, color: T.g500, fontWeight: 500 }}>
              <strong style={{ color: T.g900 }}>200+</strong> calon pengusaha F&B sudah cek data
            </span>
          </div>
        </div>

        {/* Right - cluster card visual */}
        <div style={{ flex: 1, opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(32px)', transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1) 150ms', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: 32,
              background: `linear-gradient(135deg, ${T.p100}40, ${T.e100}30)`,
              filter: 'blur(40px)',
              opacity: 0.6,
              animation: 'meshShift 10s ease-in-out infinite',
            }} />
            <div style={{ background: T.c50, borderRadius: 24, border: `1px solid ${T.c200}`, overflow: 'hidden', boxShadow: '0 24px 64px rgba(26,26,26,0.12)', position: 'relative' }}>
              <MapPlaceholder accent="#E6F3EF" color={T.p400} height={160} />
              <div style={{ padding: '24px 26px 26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>Jalan Margonda</div>
                    <div style={{ fontSize: 13, color: T.g500, marginTop: 3 }}>UI Gate ke Margo City · Depok</div>
                  </div>
                  <ConfidenceRing score={heroCluster?.confidence ?? 87} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                  <Badge variant="active"><ShieldCheck size={10} color={T.p600} /> Active</Badge>
                  <Badge variant="dark"><Zap size={10} color={T.c50} /> 34 titik data</Badge>
                  <Badge variant="neutral"><Clock size={10} color={T.g500} /> 23j lalu</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    { l: 'Price Ceiling Cafe', v: 'Rp 35.000' },
                    { l: 'Dominan Usia', v: '18-25th (58%)' },
                    { l: 'Digital Payment', v: '87% adoption' },
                    { l: 'Peak Traffic', v: '800-1.200/jam' },
                  ].map(s => (
                    <div key={s.l} style={{ background: T.c100, borderRadius: 12, padding: '12px 14px', transition: 'all 200ms ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.p100; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.c100; }}
                    >
                      <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, marginBottom: 4, letterSpacing: '0.02em' }}>{s.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <Button full onClick={() => { window.location.href = '/login'; }} icon={<MessageCircle size={15} color={T.c50} />}>
                  Chat Gratis 7 Pesan
                </Button>
              </div>
            </div>
            <div style={{
              position: 'absolute', top: -18, right: -18,
              background: `linear-gradient(135deg, ${T.g900}, #2a2a2a)`,
              borderRadius: 16, padding: '12px 18px',
              boxShadow: '0 12px 32px rgba(26,26,26,0.25)',
              animation: 'cardFloat 6s ease-in-out infinite',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.04em' }}>CONFIDENCE SCORE</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.c50, letterSpacing: '-0.02em', marginTop: 2 }}>
                {heroCluster?.confidence ?? 87}<span style={{ fontSize: 13, opacity: 0.5, fontWeight: 500 }}>/100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / STATS SECTION */}
      <section style={{ background: T.g900, padding: '100px 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${T.p600}08 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${T.e600}06 0%, transparent 50%)`,
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.p400, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 1, background: T.p400, opacity: 0.5 }} />
            Mengapa LOKAL Ada
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 40px', alignItems: 'start', marginBottom: 80 }}>
            <div>
              <blockquote style={{
                fontSize: 'clamp(20px, 2.4vw, 30px)',
                color: 'rgba(253,251,247,0.92)',
                lineHeight: 1.55,
                fontStyle: 'italic',
                margin: 0,
                fontWeight: 400,
              }}>
                &ldquo;Paman saya buka cafe matcha premium di Depok dengan harga Rp 50.000, sama dengan Jakarta. Tutup dalam beberapa bulan. Price ceiling Depok adalah Rp 28.000. Tidak ada yang memberitahunya.&rdquo;
              </blockquote>
              <div style={{ fontSize: 13, color: 'rgba(253,251,247,0.35)', marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 1, background: 'rgba(253,251,247,0.2)' }} />
                Kisah nyata yang mendirikan LOKAL
              </div>
            </div>
            <div style={{ paddingTop: 8 }}>
              <p style={{ fontSize: 16, color: 'rgba(253,251,247,0.55)', lineHeight: 1.75, margin: 0 }}>
                Kebanyakan pengusaha F&B baru memulai dengan <strong style={{ color: 'rgba(253,251,247,0.85)' }}>intuisi</strong>, bukan data. Mereka tidak tahu price ceiling lokal, pola traffic, atau siapa kompetitor sesungguhnya. Baru sadar setelah terlambat.
              </p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.p400, fontWeight: 600 }}>
                  <Eye size={14} />
                  Data lapangan terverifikasi
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.p400, fontWeight: 600 }}>
                  <TrendingUp size={14} />
                  Analisis AI real-time
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  borderTop: `2px solid ${i === 3 ? T.p600 : 'rgba(255,255,255,0.1)'}`,
                  paddingTop: 24,
                  transition: 'all 300ms ease',
                  opacity: activeStat === i ? 1 : 0.7,
                }}
                onMouseEnter={() => setActiveStat(i)}
              >
                <div style={{
                  fontSize: 'clamp(26px, 2.8vw, 36px)',
                  fontWeight: 700,
                  color: i === 3 ? T.p400 : T.c50,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                  fontVariantNumeric: 'tabular-nums',
                  animation: i === 3 ? 'statGlow 3s ease-in-out infinite' : 'none',
                }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(253,251,247,0.45)', lineHeight: 1.5, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="section-how" style={{ padding: '100px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 1, background: T.g500, opacity: 0.4 }} />
            Cara Kerja
            <span style={{ width: 24, height: 1, background: T.g500, opacity: 0.4 }} />
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 44px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 auto', maxWidth: '20ch', lineHeight: 1.15 }}>
            Tiga langkah untuk keputusan yang tepat.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 60,
            left: '16.66%',
            right: '16.66%',
            height: 2,
            background: `linear-gradient(90deg, ${T.p100} 0%, ${T.p400} 50%, ${T.p100} 100%)`,
            opacity: 0.3,
            zIndex: 0,
          }} />
          {[
            { n: '01', icon: <MapPin size={22} color={T.p600} />, t: 'Pilih Cluster', d: 'Temukan koridor 1.5km yang relevan dengan lokasi target kamu. Setiap cluster punya 34+ titik data terverifikasi.' },
            { n: '02', icon: <MessageCircle size={22} color={T.p600} />, t: 'Chat Gratis 7 Pesan', d: 'Tanya langsung ke AI konsultan tentang harga, kompetitor, dan perilaku pasar lokal. Tanpa biaya.' },
            { n: '03', icon: <FileText size={22} color={T.p600} />, t: 'Buka Laporan Lengkap', d: 'Bayar Rp 400K untuk simulasi 10-seksi + jendela konsultasi AI 12 jam. Unduh PDF kapan saja.' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: 18,
                background: T.p100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                border: `2px solid ${T.p100}`,
                position: 'relative',
              }}>
                {s.icon}
                <div style={{
                  position: 'absolute',
                  top: -4, right: -4,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: T.p600,
                  color: T.c50,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {s.n}
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 12px' }}>{s.t}</h3>
              <p style={{ fontSize: 15, color: T.g500, lineHeight: 1.7, margin: 0, maxWidth: '32ch', marginLeft: 'auto', marginRight: 'auto' }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLUSTER PREVIEW */}
      <section id="section-clusters" style={{ padding: '20px 5% 100px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 1, background: T.g500, opacity: 0.4 }} />
              Cluster Aktif
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 2.5vw, 36px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: 0, maxWidth: '24ch', lineHeight: 1.2 }}>
              Data lapangan terverifikasi, diperbarui tiap kuartal.
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cities.map(c => (
              <button key={c} onClick={() => setCityFilter(c)} style={{
                padding: '8px 18px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 200ms ease',
                background: cityFilter === c ? T.p600 : T.c200,
                color: cityFilter === c ? T.c50 : T.g700,
                boxShadow: cityFilter === c ? '0 2px 8px rgba(27,122,101,0.25)' : 'none',
              }}>{c}</button>
            ))}
          </div>
        </div>
        {clustersLoading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: T.g500, fontSize: 14 }}>
            <div style={{ display: 'inline-block', width: 24, height: 24, border: `2px solid ${T.c200}`, borderTopColor: T.p600, borderRadius: '50%', animation: 'lokal-spin 0.8s linear infinite', marginBottom: 12 }} />
            <div>Memuat data cluster...</div>
          </div>
        ) : filteredClusters.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filteredClusters.map((c, i) => <LandingClusterCard key={c.id} cluster={c} delay={i * 80} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0', background: T.c100, borderRadius: 20, border: `1px dashed ${T.c200}` }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗺️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 8 }}>
              {cityFilter === 'Semua Kota' ? 'Belum ada cluster aktif' : `Belum ada cluster di ${cityFilter}`}
            </div>
            <div style={{ fontSize: 14, color: T.g500 }}>Segera hadir. Kami sedang memperluas coverage ke kota-kota baru.</div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <Button variant="secondary" onClick={() => { window.location.href = '/clusters'; }} icon={<ArrowRight size={15} color={T.p600} />}>
            Lihat Semua Cluster
          </Button>
        </div>
      </section>

      {/* WAITING LIST SECTION - between clusters and pricing */}
      <section style={{
        background: T.g900,
        padding: '80px 5%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(ellipse at 30% 50%, ${T.p600}10 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, ${T.e600}08 0%, transparent 50%)`,
        }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
          <defs>
            <pattern id="waitlistGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waitlistGrid)" />
        </svg>
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', borderRadius: 9999,
              padding: '6px 16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Bell size={12} color={T.warning} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.warning, letterSpacing: '0.06em' }}>WAITING LIST CLUSTER BARU</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 700, color: T.c50,
              letterSpacing: '-0.02em', margin: '0 0 12px',
            }}>
              Kota berikutnya segera hadir
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(253,251,247,0.5)', margin: 0, maxWidth: '48ch', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              Daftar waiting list dan dapatkan notifikasi pertama kali cluster di kotamu aktif. Plus, bonus 3 chat gratis saat launch.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 40 }}>
            {upcomingClusters.map((cluster, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '20px 16px',
                textAlign: 'center',
                transition: 'all 300ms ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                {cluster.status === 'high' && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 8, height: 8, borderRadius: '50%',
                    background: T.warning,
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '50%',
                      border: `2px solid ${T.warning}`,
                      animation: 'pulseRing 2s ease-out infinite',
                    }} />
                  </div>
                )}
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: cluster.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <MapPin size={20} color={cluster.color} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.c50, marginBottom: 4 }}>{cluster.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(253,251,247,0.4)', marginBottom: 12 }}>{cluster.city}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <TrendingUp size={12} color={cluster.status === 'high' ? T.warning : T.p400} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: cluster.status === 'high' ? T.warning : T.p400 }}>
                    {cluster.demand} minat
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.c50, marginBottom: 4 }}>
                Jadilah yang pertama tahu
              </div>
              <div style={{ fontSize: 12, color: 'rgba(253,251,247,0.4)' }}>
                Masukkan email untuk notifikasi cluster baru
              </div>
            </div>
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 10, flex: 2, minWidth: 280 }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '10px 14px',
                transition: 'all 200ms ease',
              }}>
                <Bell size={16} color="rgba(255,255,255,0.4)" />
                <input
                  type="email"
                  placeholder="email@kamu.com"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: T.c50,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={waitlistSubmitted}
                style={{
                  padding: '10px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: waitlistSubmitted ? T.success : T.p600,
                  color: T.c50,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: waitlistSubmitted ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {waitlistSubmitted ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Tersimpan!
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    Ingatkan Saya
                  </>
                )}
              </button>
            </form>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginTop: 32,
            flexWrap: 'wrap',
          }}>
            {[
              { text: '5 Kota dalam pipeline' },
              { text: '2.848 orang dalam waiting list' },
              { text: 'Data terverifikasi on-chain' },
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: 'rgba(253,251,247,0.35)',
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.p400 }} />
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="section-pricing" style={{ padding: '100px 5%', background: T.c100, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 400, height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${T.p100} 0%, transparent 70%)`,
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-5%',
          width: 300, height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${T.e100} 0%, transparent 70%)`,
          opacity: 0.5,
        }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 1, background: T.g500, opacity: 0.4 }} />
              Harga Transparan
              <span style={{ width: 24, height: 1, background: T.g500, opacity: 0.4 }} />
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 auto', maxWidth: '24ch', lineHeight: 1.15 }}>
              Mulai gratis. Bayar hanya saat kamu siap simulasi.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { name: 'Free', price: 'Rp 0', period: '', desc: '7 pesan gratis per cluster', features: ['7 pesan AI per cluster', 'Preview data cluster', 'Tanpa kartu kredit'], cta: 'Mulai Sekarang', highlight: false },
              { name: 'Pay-per-use', price: 'Rp 400K', period: '/sesi', desc: 'Untuk satu konsep di satu cluster', features: ['Laporan simulasi 10 seksi', 'Analisis harga per menu', 'Jendela konsultasi AI 12 jam', 'Unduh PDF laporan'], cta: 'Beli Sesi', highlight: true },
              { name: 'Explorer', price: 'Rp 1.2jt', period: '/bulan', desc: '4 sesi/bulan, bisa rollover', features: ['4 kredit/bulan', 'Rollover max 2 sesi', 'Semua fitur Pay-per-use', 'Prioritas support'], cta: 'Pilih Explorer', highlight: false },
            ].map((p, i) => (
              <div key={i} style={{
                background: p.highlight ? T.g900 : T.c50,
                borderRadius: 24, padding: '32px 28px',
                border: p.highlight ? 'none' : `1px solid ${T.c200}`,
                boxShadow: p.highlight ? '0 20px 60px rgba(26,26,26,0.18)' : '0 2px 12px rgba(26,26,26,0.05)',
                position: 'relative', overflow: 'hidden',
                transition: 'all 300ms ease',
              }}
                onMouseEnter={e => {
                  if (!p.highlight) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(26,26,26,0.1)';
                  }
                }}
                onMouseLeave={e => {
                  if (!p.highlight) {
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(26,26,26,0.05)';
                  }
                }}
              >
                {p.highlight && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${T.p400}, ${T.p600})`,
                  }} />
                )}
                {p.highlight && <div style={{ position: 'absolute', top: 20, right: 20 }}><Badge variant="active"><Sparkles size={10} color={T.p600} /> Populer</Badge></div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? T.p400 : T.g500, marginBottom: 8, letterSpacing: '0.04em' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: p.highlight ? T.c50 : T.g900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
                  {p.period && <span style={{ fontSize: 14, color: p.highlight ? 'rgba(253,251,247,0.5)' : T.g500, fontWeight: 500 }}>{p.period}</span>}
                </div>
                <p style={{ fontSize: 14, color: p.highlight ? 'rgba(253,251,247,0.55)' : T.g500, margin: '0 0 24px', fontWeight: 500 }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.highlight ? 'rgba(95,184,163,0.2)' : T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={10} color={p.highlight ? T.p400 : T.p600} />
                      </div>
                      <span style={{ fontSize: 13, color: p.highlight ? 'rgba(253,251,247,0.8)' : T.g700, fontWeight: 500 }}>{f}</span>
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
      <footer style={{ padding: '64px 5%', background: T.g900, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${T.p600}30, transparent)`,
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '36ch' }}>
            <Image src="/logo.png" alt="LOKAL" width={90} height={30} style={{ objectFit: 'contain', marginBottom: 16, filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: 14, color: 'rgba(253,251,247,0.4)', lineHeight: 1.7, margin: '0 0 20px' }}>
              Platform intelijen F&B hyperlokal pertama di Indonesia, ditenagai data lapangan terverifikasi dan Solana blockchain.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                <ShieldCheck size={11} color="rgba(255,255,255,0.6)" /> Powered by Solana
              </Badge>
              <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                ZK Verified Data
              </Badge>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 48 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(253,251,247,0.5)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Produk</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Cluster', 'Simulasi', 'Konsultasi AI'].map(item => (
                  <span key={item} style={{ fontSize: 13, color: 'rgba(253,251,247,0.35)', cursor: 'pointer', transition: 'color 200ms' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(253,251,247,0.7)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(253,251,247,0.35)'; }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(253,251,247,0.5)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Perusahaan</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Tentang Kami', 'Blog', 'Kontak'].map(item => (
                  <span key={item} style={{ fontSize: 13, color: 'rgba(253,251,247,0.35)', cursor: 'pointer', transition: 'color 200ms' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(253,251,247,0.7)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(253,251,247,0.35)'; }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '40px auto 0', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(253,251,247,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span>© 2025 LOKAL AI · Powered by Solana</span>
          <span>Superteam Indonesia - Frontier Colosseum 2025</span>
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
      padding: '8px 16px', borderRadius: 9999, fontSize: 14, fontWeight: 500,
      color: T.g700, fontFamily: 'inherit', transition: 'all 150ms ease',
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
        background: T.c50, borderRadius: 20, border: `1px solid ${T.c200}`, overflow: 'hidden', cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (hov ? 'translateY(-5px)' : 'none') : 'translateY(16px)',
        transition: `opacity 400ms ease ${delay}ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease`,
        boxShadow: hov ? '0 16px 40px rgba(26,26,26,0.12)' : '0 2px 8px rgba(26,26,26,0.04)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <MapPlaceholder accent={c.accent} color={c.iconColor} height={140} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <Badge variant={c.status === 'Active' ? 'active' : 'seeding'}>{c.status}</Badge>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <ConfidenceRing score={c.confidence} size={42} />
        </div>
      </div>
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 3 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: T.g500, marginBottom: 14 }}>{c.subtitle} · {c.neighborhood}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { l: 'Price Ceiling', v: `Rp ${(c.keyStats.priceCeiling / 1000).toFixed(0)}K` },
            { l: 'ZK Data Points', v: `${c.zkPoints} titik` },
            { l: 'Traffic', v: c.traffic },
            { l: 'Diperbarui', v: `${c.freshness}j lalu` },
          ].map(s => (
            <div key={s.l} style={{ background: T.c100, borderRadius: 10, padding: '10px 12px', transition: 'background 200ms' }}
              onMouseEnter={e => { e.stopPropagation(); (e.currentTarget as HTMLElement).style.background = T.p100; }}
              onMouseLeave={e => { e.stopPropagation(); (e.currentTarget as HTMLElement).style.background = T.c100; }}
            >
              <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, letterSpacing: '0.02em' }}>{s.l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g900, marginTop: 3 }}>{s.v}</div>
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
