'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnect } from '@/components/survey/WalletConnect';
import { SurveyWizard } from '@/components/survey/SurveyWizard';
import { CheckCircle2, MapPin, Users, Clock, ClipboardList, Wallet, LogOut, Mail } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { PublicWalletProvider } from '@/components/providers/PublicWalletProvider';

interface SurveyPageProps {
  params: { slug: string };
  searchParams: { token?: string };
}

interface ClusterInfo {
  id: string;
  name: string;
  slug: string;
  location: string;
}

/* ─── Shared style tokens ─── */
const S = {
  page: { minHeight: '100vh', background: T.c50, fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" } as React.CSSProperties,
  container: { maxWidth: 560, margin: '0 auto', padding: '24px 16px' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 9999, border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: T.c50, background: T.p600, cursor: 'pointer', transition: 'all 150ms', width: '100%' } as React.CSSProperties,
};

export default function SurveyPage({ params, searchParams }: SurveyPageProps) {
  return (
    <PublicWalletProvider>
      <SurveyPageInner params={params} searchParams={searchParams} />
    </PublicWalletProvider>
  );
}

function SurveyPageInner({ params, searchParams }: SurveyPageProps) {
  const { slug } = params;
  const { token } = searchParams;
  const router = useRouter();
  const { connected, disconnect } = useWallet();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cluster, setCluster] = useState<ClusterInfo | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [justDisconnected, setJustDisconnected] = useState(false);

  useEffect(() => {
    if (!token) { setError('Token survey tidak valid'); setLoading(false); return; }
    fetch(`/api/survey/${slug}?token=${token}`)
      .then(async (res) => { if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Gagal memuat survey'); } return res.json(); })
      .then((data) => { setCluster(data.cluster); setExistingSubmission(data.existingSubmission); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, token]);

  const handleWalletConnect = useCallback((walletAddress: string, emailAddress?: string) => {
    // Ignore auto-reconnect right after user explicitly disconnected
    if (justDisconnected) {
      setJustDisconnected(false);
      return;
    }
    setWallet(walletAddress);
    if (emailAddress) setEmail(emailAddress);
  }, [justDisconnected]);

  const handleDisconnect = useCallback(() => {
    setJustDisconnected(true);
    disconnect();
    setWallet(null);
    setEmail(null);
  }, [disconnect]);

  const handleSurveyComplete = useCallback(() => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${T.c200}`, borderTopColor: T.p600, borderRadius: '50%', animation: 'lokal-spin 800ms linear infinite', margin: '0 auto' }} />
          <p style={{ fontSize: 13, color: T.g500, marginTop: 16 }}>Memuat survey...</p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error || !cluster) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ ...S.card, padding: 40, textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.e100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: 24 }}>😕</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 8 }}>Oops!</h2>
          <p style={{ fontSize: 13, color: T.g500, marginBottom: 24 }}>{error || 'Survey tidak ditemukan'}</p>
          <button onClick={() => router.push('/')} style={{ ...S.btnPrimary, width: 'auto' }}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  /* ─── Submitted / Existing State ─── */
  if (existingSubmission || submitted) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={32} color={T.p600} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Terima kasih!</h2>
            <p style={{ fontSize: 14, color: T.g500, marginBottom: 4 }}>Survey kamu sudah berhasil dikirim.</p>
            <p style={{ fontSize: 12, color: T.g500 }}>Jawaban akan direview oleh Cluster Owner. Reward akan dikirim ke dompet kamu setelah diverifikasi.</p>
          </div>

          {/* Timeline */}
          <div style={{ ...S.card, padding: '24px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              <Clock size={16} color={T.p600} />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.p600 }}>Proses Review</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { num: 1, title: 'Cluster Owner Review', desc: 'Jawaban kamu akan dicek oleh CO', active: true },
                { num: 2, title: 'Admin Validasi', desc: 'Data akan divalidasi oleh admin', active: false },
                { num: 3, title: 'Reward Dikirim', desc: 'IDRX akan dikirim ke dompet kamu', active: false },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: step.active ? T.p600 : T.c200,
                    color: step.active ? '#fff' : T.g500,
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: step.active ? T.g900 : T.g500 }}>{step.title}</div>
                    <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => router.push('/vault')} style={S.btnPrimary}>
            Lihat Reward Saya
          </button>
        </div>
      </div>
    );
  }

  /* ─── Main Survey State ─── */
  return (
    <div style={S.page}>
      {/* Header — LOKAL Logo Only */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.c200}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="LOKAL" width={80} height={28} style={{ objectFit: 'contain' }} />
          </a>

          {/* Wallet info + disconnect */}
          {wallet && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: T.c100, borderRadius: 9999 }}>
                {email ? (
                  <Mail size={14} color={T.p600} />
                ) : (
                  <Wallet size={14} color={T.p600} />
                )}
                <span style={{ fontSize: 12, fontWeight: 600, color: T.g700, fontFamily: 'var(--font-mono), monospace' }}>
                  {wallet.slice(0, 5)}...{wallet.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                style={{
                  padding: '6px 10px', borderRadius: 8, border: 'none',
                  background: 'transparent', cursor: 'pointer', color: T.danger,
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${T.danger}10`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={14} />
                <span style={{ display: 'none' }}>Putus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={S.container}>
        {/* Info card */}
        <div style={{ ...S.card, padding: '20px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClipboardList size={20} color={T.p600} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 3 }}>{cluster.name}</h2>
            <p style={{ fontSize: 12, color: T.g500, marginBottom: 10 }}>{cluster.location}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.g500 }}>
                <Users size={14} color={T.g500} />15 pertanyaan
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.g500 }}>
                <Clock size={14} color={T.g500} />5–10 menit
              </span>
            </div>
          </div>
        </div>

        {/* Wallet connection or Survey form — full width within container */}
        {!wallet ? (
          <WalletConnect onConnect={handleWalletConnect} onDisconnect={handleDisconnect} />
        ) : (
          <SurveyWizard
            wallet={wallet}
            email={email || undefined}
            clusterSlug={slug}
            clusterName={cluster.name}
            token={token || ''}
            onComplete={handleSurveyComplete}
          />
        )}
      </div>
    </div>
  );
}
