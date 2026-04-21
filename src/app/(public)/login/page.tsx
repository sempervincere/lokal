'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart2, MapPin, ShieldCheck, Lock, Clock, ArrowRight, Wallet, Users, MessageCircle } from 'lucide-react';
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

  const supabase = createClient();

  const roles = [
    { id: 'bo' as const, icon: <BarChart2 size={16} color={role === 'bo' ? T.c50 : T.g500} />, title: 'Business Owner', desc: 'Ingin validasi konsep F&B saya' },
    { id: 'co' as const, icon: <MapPin size={16} color={role === 'co' ? T.c50 : T.g500} />, title: 'Cluster Owner', desc: 'Ingin kontribusi data lokal & hasilkan pendapatan' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role: role === 'bo' ? 'BUSINESS_OWNER' : 'CLUSTER_OWNER' } },
        });
        if (error) throw error;
        const dest = role === 'co' ? '/co/dashboard' : '/dashboard';
        router.push(dest);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      background: T.c50,
    }}>
      {/* Left panel — dark */}
      <div style={{
        flex: '0 0 44%', background: T.g900, padding: '48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse at 20% 80%, ${T.p600}22 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${T.e600}18 0%, transparent 50%)` }} />

        <a href="/" style={{ display: 'block', position: 'relative' }}>
          <Image src="/logo.png" alt="LOKAL" width={90} height={30} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </a>

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 700, color: T.c50, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            &ldquo;Simulate before<br />you operate.&rdquo;
          </p>
          <p style={{ fontSize: 15, color: 'rgba(253,251,247,0.5)', lineHeight: 1.65, margin: '0 0 36px', maxWidth: '38ch' }}>
            Validasi konsep F&B kamu dengan data hyperlokal terverifikasi sebelum mempertaruhkan modal.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: <ShieldCheck size={16} color={T.p400} />, text: '34+ data point terverifikasi per cluster' },
              { icon: <Lock size={16} color={T.p400} />, text: 'Pembayaran IDRX di Solana — transparan' },
              { icon: <Clock size={16} color={T.p400} />, text: 'Laporan + konsultasi AI 12 jam' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(253,251,247,0.65)', lineHeight: 1.5, paddingTop: 6 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(253,251,247,0.25)', position: 'relative' }}>
          © 2025 LOKAL AI · Powered by Solana
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 5%' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            {mode === 'login' ? 'Selamat datang kembali' : 'Buat akun baru'}
          </h1>
          <p style={{ fontSize: 14, color: T.g500, margin: '0 0 28px' }}>
            {mode === 'signup'
              ? 'Gratis untuk memulai. Tidak perlu kartu kredit.'
              : 'Lanjutkan simulasi kamu.'}
          </p>

          {/* Role selector — signup only */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Saya bergabung sebagai</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {roles.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    padding: '14px', borderRadius: 12,
                    border: `2px solid ${role === r.id ? T.p600 : T.c200}`,
                    background: role === r.id ? T.p100 : T.c50,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 150ms',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: role === r.id ? T.p600 : T.c200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      {r.icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: role === r.id ? T.p600 : T.g900, marginBottom: 3 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: T.g500, lineHeight: 1.4 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
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
              <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 10, marginBottom: 16, fontSize: 13, color: T.danger }}>
                {error}
              </div>
            )}

            <Button type="submit" full size="lg" disabled={loading} icon={loading ? undefined : <ArrowRight size={16} color={T.c50} />}>
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </Button>
          </form>

          {/* Google OAuth */}
          <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: T.c200 }} />
            <span style={{ fontSize: 12, color: T.g500, fontWeight: 600 }}>atau lanjut dengan</span>
            <div style={{ flex: 1, height: 1, background: T.c200 }} />
          </div>

          <button onClick={handleGoogle} disabled={loading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '11px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
            background: T.c50, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            fontWeight: 600, color: T.g700, transition: 'all 150ms',
          }}>
            <GoogleIcon />
            Google
          </button>

          {/* Wallet note */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: T.p100, borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Wallet size={16} color={T.p600} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: T.p600, lineHeight: 1.5 }}>
              Kamu perlu menghubungkan wallet Solana (Phantom) setelah masuk untuk fitur pembayaran.
            </span>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
              color: T.p600, fontFamily: 'inherit', fontWeight: 600,
            }}>
              {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
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
