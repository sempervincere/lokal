'use client';

import { useState, useEffect } from 'react';
import { Clock, Lock, Sparkles, ChevronLeft, MessageCircle } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';

interface ClusterKeyStats {
  priceCeiling: number;
  [key: string]: any;
}

interface ClusterData {
  id: string;
  name: string;
  slug: string;
  keyStats: ClusterKeyStats;
  [key: string]: any;
}

interface MenuItem {
  name: string;
  price: number;
}

interface ConceptForm {
  conceptName?: string;
  fbSubcategory?: string;
  menuItems?: MenuItem[];
}

interface Report {
  status: string;
  sections?: Record<string, any>;
  errorMessage?: string;
}

interface SessionData {
  id: string;
  clusterId: string;
  userId: string;
  status: string;
  expiresAt: string | null;
  conceptForm?: ConceptForm;
  cluster: { id: string; name: string };
  report?: Report;
}

export function BOReport({
  cluster: c,
  sessionId,
  onBack,
  onStartConsultation,
  onViewHistory,
  initialSession,
  onSessionLoaded,
  isExpired,
}: {
  cluster: ClusterData;
  sessionId: string | null;
  onBack: () => void;
  onStartConsultation: () => void;
  onViewHistory?: () => void;
  initialSession?: SessionData | null;
  onSessionLoaded?: (s: SessionData) => void;
  isExpired?: boolean;
}) {
  const [session, setSession] = useState<SessionData | null>(initialSession ?? null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(43200);
  const [rating, setRating] = useState(0);
  const [progress, setProgress] = useState(0);
  const progSteps = ['Menganalisis data cluster...', 'Membandingkan harga menu...', 'Memetakan kompetitor...', 'Menyusun proyeksi...', 'Laporan siap!'];

  const isGenerating = !session || session.status === 'PAYMENT_CONFIRMED' || session.status === 'GENERATING_REPORT' || session.report?.status === 'GENERATING' || session.report?.status === 'PENDING';
  const isFailed = session?.status === 'FAILED' || session?.report?.status === 'FAILED';
  const isReady = session?.status === 'ACTIVE' && session.report?.status === 'COMPLETE';

  // Animate progress bar during generation
  useEffect(() => {
    if (!isGenerating) return;
    let p = progress;
    const iv = setInterval(() => {
      p = Math.min(p + 1.2, 92);
      setProgress(p);
    }, 600);
    return () => clearInterval(iv);
  }, [isGenerating]);

  // Poll session status every 3s
  useEffect(() => {
    if (initialSession || !sessionId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) {
          setPollError('Gagal memuat status laporan');
          return;
        }
        const data: SessionData = await res.json();
        if (!cancelled) {
          setSession(data);
          onSessionLoaded?.(data);
        }
        if (!cancelled && (data.status === 'ACTIVE' || data.status === 'FAILED')) return; // stop polling
        if (!cancelled) setTimeout(poll, 3000);
      } catch {
        if (!cancelled) setTimeout(poll, 5000);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Countdown timer once active
  useEffect(() => {
    if (!isReady || !session?.expiresAt) return;
    const end = new Date(session.expiresAt).getTime();
    const iv = setInterval(() => setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000))), 1000);
    return () => clearInterval(iv);
  }, [isReady, session?.expiresAt]);

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Loading / generating state
  if (!isReady && !isFailed) {
    const progLabel = progSteps[Math.min(Math.floor(progress / 23), 4)];
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Sparkles size={32} color={T.p600} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Membuat laporan kamu...</div>
        <div style={{ fontSize: 13, color: T.g500, marginBottom: 28 }}>{pollError ?? progLabel}</div>
        <div style={{ width: 320, height: 6, background: T.c200, borderRadius: 9999, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: T.p600, borderRadius: 9999, transition: 'width 600ms ease' }} />
        </div>
        <div style={{ fontSize: 12, color: T.g500 }}>{Math.round(progress)}%</div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>Gagal generate laporan</div>
        <div style={{ fontSize: 13, color: T.g500, marginBottom: 20 }}>{session?.report?.errorMessage ?? 'Terjadi kesalahan. Coba lagi.'}</div>
        <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: 10, background: T.p600, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Kembali
        </button>
      </div>
    );
  }

  const sections = session?.report?.sections ?? {};
  const conceptName = session?.conceptForm?.conceptName ?? 'Konsep Bisnis';
  const fbSubcategory = session?.conceptForm?.fbSubcategory ?? '';
  const menuItems = session?.conceptForm?.menuItems ?? [];
  const priceCeiling = c.keyStats.priceCeiling;
  const section6 = sections['section6'];
  const riskFlags: string[] = section6?.riskFlags ?? [];

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
            <h2 style={{ fontSize: 24, fontWeight: 700, color: T.c50, letterSpacing: '-0.01em', margin: '0 0 4px' }}>{conceptName}</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              {c.name} · {fbSubcategory}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {isExpired ? (
              <>
                <button disabled style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 9999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700, cursor: 'not-allowed', fontFamily: 'inherit' }}>
                  <Lock size={16} color="rgba(255,255,255,0.4)" /> Sesi Berakhir
                </button>
                {onViewHistory && (
                  <button
                    onClick={onViewHistory}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 16px',
                      borderRadius: 9999,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: T.c50,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <MessageCircle size={14} color={T.c50} /> Lihat Riwayat Pesan
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onStartConsultation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 20px',
                  borderRadius: 9999,
                  background: `linear-gradient(135deg, ${T.p600} 0%, #7C3AED 100%)`,
                  border: 'none',
                  color: T.c50,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                }}
              >
                <MessageCircle size={16} color={T.c50} />
                Mulai Konsultasi AI — 12 Jam
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
        {/* Risk flags from Section 6 — the money shot */}
        {riskFlags.length > 0 && (
          <div style={{ marginBottom: 24, padding: '18px 20px', background: '#FEF2F2', borderRadius: 16, border: '1px solid #FECACA' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#EF4444', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>⚠️ Peringatan Harga</div>
            {riskFlags.map((flag, i) => (
              <div key={i} style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.6, marginBottom: i < riskFlags.length - 1 ? 8 : 0 }}>
                • {flag}
              </div>
            ))}
          </div>
        )}

        {/* Menu price analysis from actual concept form */}
        {menuItems.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Analisis Harga Menu</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
              {menuItems.map((item, i) => {
                const pct = priceCeiling > 0 ? (item.price / priceCeiling) * 100 : 50;
                const status = pct <= 100 ? 'ok' : pct <= 130 ? 'warn' : 'danger';
                const overPct = priceCeiling > 0 ? Math.round(((item.price - priceCeiling) / priceCeiling) * 100) : 0;
                return (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 14, background: status === 'ok' ? T.p100 : status === 'warn' ? T.e100 : '#FEF2F2', border: `1px solid ${status === 'ok' ? '#C8E8DF' : status === 'warn' ? '#F2CAB8' : '#FECACA'}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
                      Rp {item.price.toLocaleString('id')}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: status === 'ok' ? T.success : status === 'warn' ? T.e600 : '#EF4444' }}>
                      {status === 'ok' ? '✓ Di bawah ceiling' : status === 'warn' ? `↑ ${overPct}% di atas ceiling` : `⚠ ${overPct}% di atas ceiling`}
                    </div>
                    <div style={{ height: 3, background: 'rgba(0,0,0,0.08)', borderRadius: 9999, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: status === 'ok' ? T.success : status === 'warn' ? T.e600 : '#EF4444', borderRadius: 9999 }} />
                    </div>
                    {priceCeiling > 0 && <div style={{ fontSize: 10, color: T.g500, marginTop: 4 }}>Ceiling: Rp {priceCeiling.toLocaleString('id')}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 10 real AI-generated sections */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Analisis Lengkap (10 Seksi)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(sections).map(([key, sec], i) => (
              <RealSectionExpander key={key} sectionKey={key} section={sec} delay={i * 60} />
            ))}
          </div>
        </div>

        {/* Consultation CTA banner */}
        <div style={{ background: `linear-gradient(135deg, ${T.g900} 0%, #1e1b4b 100%)`, borderRadius: 20, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.c50, marginBottom: 4 }}>Punya pertanyaan lanjutan?</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, maxWidth: 380 }}>
              Jendela konsultasi AI 12 jam aktif. Tanya apa saja — strategi lokasi, negosiasi suplier, taktik launch, dll.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Berakhir dalam: {fmt(timeLeft)}</span>
            </div>
          </div>
          {isExpired ? (
            <button onClick={onViewHistory} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 9999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: T.c50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              <MessageCircle size={17} color={T.c50} /> Lihat Riwayat Pesan
            </button>
          ) : (
            <button onClick={onStartConsultation} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 9999, background: `linear-gradient(135deg, ${T.p600} 0%, #7C3AED 100%)`, border: 'none', color: T.c50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(124,58,237,0.5)', flexShrink: 0 }}>
              <MessageCircle size={17} color={T.c50} /> Mulai Konsultasi AI
            </button>
          )}
        </div>

        <div style={{ background: T.c100, borderRadius: 16, padding: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.g900 }}>Laporan ini membantu?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${rating >= n ? T.warning : T.c200}`, background: rating >= n ? '#FEF3C7' : T.c50, cursor: 'pointer', fontSize: 18, transition: 'all 150ms' }}>
                ⭐
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RealSectionExpander({ sectionKey, section, delay }: { sectionKey: string; section: any; delay: number }) {
  const [open, setOpen] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const title = section?.title || sectionKey.replace('section', 'Seksi ');
  const content = section?.content || '';

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity 300ms ease ${delay}ms, transform 300ms ease ${delay}ms`,
        background: T.c50,
        border: `1px solid ${T.c200}`,
        borderRadius: 14,
        padding: '16px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{title}</div>
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▼
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.c200}`, fontSize: 13, color: T.g700, lineHeight: 1.7 }}>
          {content}
        </div>
      )}
    </div>
  );
}
