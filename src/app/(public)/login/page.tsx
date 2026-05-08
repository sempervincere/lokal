'use client';

import { useState, Suspense, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart2, MapPin, ShieldCheck, Lock, Clock, ArrowRight, Wallet, Users, MessageCircle, Sparkles } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { createClient } from '@/lib/supabase/client';

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [role, setRole] = useState<'bo' | 'co'>('bo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leftVis, setLeftVis] = useState(false);

  const supabase = createClient();

  const roles = [
    { id: 'bo' as const, icon: <BarChart2 size={16} color={role === 'bo' ? T.c50 : T.g500} />, title: 'Business Owner', desc: 'Ingin validasi konsep F&B saya' },
    { id: 'co' as const, icon: <MapPin size={16} color={role === 'co' ? T.c50 : T.g500} />, title: 'Cluster Owner', desc: 'Ingin kontribusi data lokal & hasilkan pendapatan' },
  ];

  useEffect(() => {
    setTimeout(() => setLeftVis(true), 200);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role: role === 'bo' ? 'BUSINESS_OWNER' : 'CLUSTER_OWNER' } },
        });
        if (error) throw error;

        if (!data.session) {
          throw new Error('Sesi kosong. Email ini mungkin sudah terdaftar (silakan gunakan menu Masuk), atau cek email Anda untuk konfirmasi bila fitur Confirm Email aktif di Supabase.');
        }

        await fetch('/api/auth/sync', { method: 'POST' }).catch(() => {});

        const dest = role === 'co' ? '/co/kyc' : '/dashboard';
        window.location.href = dest;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        await fetch('/api/auth/sync', { method: 'POST' }).catch(() => {});

        const meRes = await fetch('/api/me');
        if (!meRes.ok) throw new Error('Gagal memuat profil pengguna');
        const meData = await meRes.json();
        const dbRole = meData.user?.role;

        if (dbRole === 'ADMIN') window.location.href = '/admin';
        else if (dbRole === 'CLUSTER_OWNER') window.location.href = '/co/kyc';
        else window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const roleParam = role === 'co' ? 'CLUSTER_OWNER' : 'BUSINESS_OWNER';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}&role=${roleParam}`,
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      background: T.c50,
    }}>
      {/* Left panel - dark */}
      <div style={{
        flex: '0 0 44%',
        background: T.g900,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(ellipse at 20% 80%, ${T.p600}18 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${T.e600}12 0%, transparent 50%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(26,26,26,0.4) 100%)',
        }} />

        {/* Floating data nodes */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${15 + (i * 17) % 70}%`,
              top: `${10 + (i * 22) % 80}%`,
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              borderRadius: '50%',
              background: i % 2 === 0 ? T.p500 : T.e500,
              opacity: 0,
              animation: `fadeInUp 0.8s ease ${0.5 + i * 0.3}s forwards, dataNodePulse ${3 + i}s ease-in-out ${1 + i * 0.5}s infinite`,
            }} />
          ))}
        </div>

        <a href="/" style={{ display: 'block', position: 'relative', padding: '48px 48px 0' }}>
          <Image src="/logo.png" alt="LOKAL" width={100} height={32} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </a>

        <div style={{ position: 'relative', padding: '100px 48px 48px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{ opacity: leftVis ? 1 : 0, transform: leftVis ? 'none' : 'translateY(20px)', transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', borderRadius: 9999,
              padding: '6px 14px', marginBottom: 28, border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Sparkles size={12} color={T.p400} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.p400, letterSpacing: '0.06em' }}>PLATFORM INTELIJEN F&B HYPERLOKAL</span>
            </div>

            <p style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 700, color: T.c50, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
              &ldquo;Simulate before<br />you operate.&rdquo;
            </p>
            <p style={{ fontSize: 15, color: 'rgba(253,251,247,0.5)', lineHeight: 1.7, margin: '0 0 40px', maxWidth: '40ch' }}>
              Validasi konsep F&B kamu dengan data hyperlokal terverifikasi. Jangan biarkan modal melayang tanpa dasar.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: leftVis ? 1 : 0, transform: leftVis ? 'none' : 'translateY(20px)', transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1) 200ms' }}>
            {[
              { icon: <ShieldCheck size={16} color={T.p400} />, text: '34+ data point terverifikasi per cluster' },
              { icon: <Lock size={16} color={T.p400} />, text: 'Pembayaran IDRX di Solana. Transparan dan terbuka.' },
              { icon: <Clock size={16} color={T.p400} />, text: 'Laporan + konsultasi AI 12 jam' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 200ms ease',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(95,184,163,0.15)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(95,184,163,0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  {f.icon}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(253,251,247,0.65)', lineHeight: 1.6, paddingTop: 8 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(253,251,247,0.2)', position: 'relative', padding: '0 48px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.p500, animation: 'dataNodePulse 2s ease-in-out infinite' }} />
          © 2025 LOKAL AI · Powered by Solana
        </div>
      </div>

      {/* Right panel - form, edge-to-edge */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 32px',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            {mode === 'login' ? 'Selamat datang kembali' : 'Mulai perjalananmu'}
          </h1>
          <p style={{ fontSize: 15, color: T.g500, margin: '0 0 32px', lineHeight: 1.6 }}>
            {mode === 'signup'
              ? 'Buat akun gratis. Tidak perlu kartu kredit untuk mulai.'
              : 'Lanjutkan simulasi dan analisis cluster kamu.'}
          </p>

          {mode === 'signup' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Saya bergabung sebagai</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {roles.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    padding: '16px', borderRadius: 14,
                    border: `2px solid ${role === r.id ? T.p600 : T.c200}`,
                    background: role === r.id ? T.p100 : T.c50,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 200ms ease',
                    boxShadow: role === r.id ? '0 2px 8px rgba(27,122,101,0.1)' : 'none',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: role === r.id ? T.p600 : T.c200,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 12, transition: 'all 200ms ease',
                    }}>
                      {r.icon}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: role === r.id ? T.p600 : T.g900, marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: T.g500, lineHeight: 1.5 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {mode === 'signup' && (
                <InputField
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  prefix={<Users size={16} color={T.g500} />}
                />
              )}
              <InputField
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                prefix={<MessageCircle size={16} color={T.g500} />}
              />
              <InputField
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                prefix={<Lock size={16} color={T.g500} />}
              />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 12, marginBottom: 16, fontSize: 13, color: T.danger, border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <Button type="submit" full size="lg" disabled={loading} icon={loading ? undefined : <ArrowRight size={16} color={T.c50} />}>
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar Gratis'}
            </Button>
          </form>

          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: T.c200 }} />
            <span style={{ fontSize: 12, color: T.g500, fontWeight: 600 }}>atau lanjut dengan</span>
            <div style={{ flex: 1, height: 1, background: T.c200 }} />
          </div>

          <button onClick={handleGoogle} disabled={loading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px', borderRadius: 12, border: `1.5px solid ${T.c200}`,
            background: T.c50, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            fontWeight: 600, color: T.g700, transition: 'all 200ms ease',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = T.p400;
              (e.currentTarget as HTMLElement).style.background = T.p100;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = T.c200;
              (e.currentTarget as HTMLElement).style.background = T.c50;
            }}
          >
            <GoogleIcon />
            Google
          </button>

          <div style={{
            marginTop: 20, padding: '14px 16px', background: T.p100,
            borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
            border: `1px solid ${T.p400}20`,
          }}>
            <Wallet size={18} color={T.p600} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: T.p600, lineHeight: 1.6 }}>
              Hubungkan wallet Solana (Phantom) setelah masuk untuk fitur pembayaran dan klaim reward.
            </span>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              color: T.p600, fontFamily: 'inherit', fontWeight: 600,
              padding: '8px 16px', borderRadius: 8,
              transition: 'background 200ms',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.p100; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              {mode === 'login' ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}
