'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, TrendingUp, Clock, CheckCircle2, Loader2, Download, ArrowRight, AlertTriangle, Inbox, FileText, ShieldCheck, Coins, LogOut, Mail, X, ChevronRight } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { PublicKey } from '@solana/web3.js';
import { PublicWalletProvider } from '@/components/providers/PublicWalletProvider';

interface VaultClaim {
  id: string;
  fieldCodes: string[];
  approvedCount: number;
  amount: number;
  status: string;
  distributedAt: string | null;
  createdAt: string;
}

interface ClusterVault {
  cluster: { id: string; slug: string; name: string; location: string };
  claims: VaultClaim[];
  totalEarned: number;
  totalDistributed: number;
  totalPending: number;
}

interface VaultSummary {
  totalEarned: number;
  totalDistributed: number;
  totalPending: number;
  canWithdraw: boolean;
  minWithdrawal: number;
}

/* ─── Shared style tokens ─── */
const S = {
  page: { minHeight: '100vh', background: T.c50, fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" } as React.CSSProperties,
  container: { maxWidth: 720, margin: '0 auto', padding: '32px 24px' } as React.CSSProperties,
  card: { background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' } as React.CSSProperties,
  sectionTitle: { fontSize: 18, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em', marginBottom: 16 } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' } as React.CSSProperties,
  value: { fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', marginTop: 6 } as React.CSSProperties,
  unit: { fontSize: 12, color: T.g500, marginTop: 2 } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 28px', borderRadius: 9999, border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: T.c50, background: T.p600, cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  btnSecondary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 28px', borderRadius: 9999, border: `1.5px solid ${T.p600}`, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: T.p600, background: 'transparent', cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: T.danger, background: 'transparent', cursor: 'pointer', transition: 'all 150ms' } as React.CSSProperties,
  badge: (bg: string, color: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: bg, color }),
};

export default function VaultPage() {
  return (
    <PublicWalletProvider>
      <VaultPageInner />
    </PublicWalletProvider>
  );
}

function VaultPageInner() {
  const router = useRouter();
  const { publicKey, connected, disconnect } = useWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [clusters, setClusters] = useState<ClusterVault[]>([]);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Email lookup state
  const [emailInput, setEmailInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailMode, setEmailMode] = useState<{ wallet: string; email: string } | null>(null);

  // Email-user withdraw modal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawWalletInput, setWithdrawWalletInput] = useState('');
  const [withdrawWalletError, setWithdrawWalletError] = useState<string | null>(null);
  const [withdrawWalletLoading, setWithdrawWalletLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) { setSummary(null); setClusters([]); return; }
    setLoading(true); setError(null);
    fetch(`/api/vault?wallet=${publicKey.toString()}`)
      .then(async (res) => { if (!res.ok) throw new Error('Gagal memuat data vault'); return res.json(); })
      .then((data) => { setSummary(data.summary); setClusters(data.clusters || []); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [connected, publicKey]);

  const handleWithdraw = useCallback(async () => {
    if (emailMode) {
      // Email users must enter a wallet address first
      setWithdrawModalOpen(true);
      return;
    }
    if (!publicKey) return;
    setWithdrawing(true); setError(null);
    try {
      const res = await fetch('/api/vault/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: publicKey.toString() }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Gagal melakukan withdraw'); }
      const data = await res.json();
      setWithdrawSuccess(`Berhasil! ${data.withdrawal.amount} IDRX telah dikirim ke dompet kamu.`);
      const refreshRes = await fetch(`/api/vault?wallet=${publicKey.toString()}`);
      const refreshData = await refreshRes.json();
      setSummary(refreshData.summary); setClusters(refreshData.clusters || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Terjadi kesalahan'); }
    finally { setWithdrawing(false); }
  }, [publicKey, emailMode]);

  const handleEmailLookup = useCallback(async () => {
    if (!emailInput.includes('@')) return;
    setEmailLoading(true); setError(null);
    try {
      // Resolve email → wallet via TipLink API
      const tipRes = await fetch('/api/auth/tiplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      });
      if (!tipRes.ok) throw new Error('Gagal menemukan dompet untuk email ini');
      const tipData = await tipRes.json();
      const wallet = tipData.walletAddress;

      // Fetch vault data for this wallet
      const vaultRes = await fetch(`/api/vault?wallet=${wallet}`);
      if (!vaultRes.ok) throw new Error('Gagal memuat data vault');
      const vaultData = await vaultRes.json();

      setEmailMode({ wallet, email: emailInput });
      setSummary(vaultData.summary);
      setClusters(vaultData.clusters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setEmailLoading(false);
    }
  }, [emailInput]);

  const handleEmailWithdraw = useCallback(async () => {
    if (!withdrawWalletInput.trim()) {
      setWithdrawWalletError('Alamat dompet wajib diisi');
      return;
    }
    // Validate Solana address
    try {
      new PublicKey(withdrawWalletInput.trim());
    } catch {
      setWithdrawWalletError('Alamat dompet Solana tidak valid');
      return;
    }
    if (!emailMode) return;

    setWithdrawWalletLoading(true); setWithdrawWalletError(null); setError(null);
    try {
      const res = await fetch('/api/vault/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: emailMode.wallet, targetWallet: withdrawWalletInput.trim() }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Gagal melakukan withdraw'); }
      const data = await res.json();
      setWithdrawSuccess(`Berhasil! ${data.withdrawal.amount} IDRX telah dikirim ke dompet ${withdrawWalletInput.slice(0, 5)}...${withdrawWalletInput.slice(-4)}.`);
      setWithdrawModalOpen(false);
      setWithdrawWalletInput('');
      // Refresh
      const refreshRes = await fetch(`/api/vault?wallet=${emailMode.wallet}`);
      const refreshData = await refreshRes.json();
      setSummary(refreshData.summary); setClusters(refreshData.clusters || []);
    } catch (err) {
      setWithdrawWalletError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setWithdrawWalletLoading(false);
    }
  }, [withdrawWalletInput, emailMode]);

  const resetEmailMode = useCallback(() => {
    setEmailMode(null);
    setSummary(null);
    setClusters([]);
    setEmailInput('');
    setShowEmailForm(false);
    setWithdrawSuccess(null);
    setError(null);
  }, []);

  /* ─── Not Connected State ─── */
  if (!connected && !emailMode) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', padding: '56px 0 40px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Wallet size={32} color={T.p600} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.g900, marginBottom: 8, letterSpacing: '-0.01em' }}>Vault LOKAL</h1>
            <p style={{ fontSize: 14, color: T.g500, maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Lihat dan kelola reward dari kontribusi survey kamu. Hubungkan dompet untuk mulai.
            </p>

            {/* Wallet button wrapper — centered and sized */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: '100%', maxWidth: 320 }}>
                <WalletMultiButton />
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 320 }}>
                <div style={{ flex: 1, height: 1, background: T.c200 }} />
                <span style={{ fontSize: 11, color: T.g500, fontWeight: 500 }}>atau</span>
                <div style={{ flex: 1, height: 1, background: T.c200 }} />
              </div>

              {/* Email lookup */}
              {!showEmailForm ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  style={{ ...S.btnSecondary, width: '100%', maxWidth: 320 }}
                >
                  <Mail size={18} />
                  Lanjut dengan Email
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color={T.g500} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="email@example.com"
                      style={{
                        width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: `1.5px solid ${T.c200}`,
                        fontFamily: 'inherit', fontSize: 14, color: T.g900, background: '#fff', outline: 'none',
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailLookup()}
                    />
                  </div>
                  <button
                    onClick={handleEmailLookup}
                    disabled={emailLoading || !emailInput.includes('@')}
                    style={{
                      ...S.btnPrimary,
                      opacity: (emailLoading || !emailInput.includes('@')) ? 0.5 : 1,
                      cursor: (emailLoading || !emailInput.includes('@')) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {emailLoading ? (
                      <><Loader2 size={16} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
                    ) : (
                      <>Cek Vault<ChevronRight size={16} /></>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowEmailForm(false); setEmailInput(''); }}
                    style={{ fontSize: 12, color: T.g500, background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}
                  >
                    Kembali
                  </button>
                </div>
              )}

              <button onClick={() => router.push('/clusters')} style={S.btnSecondary}>
                Lihat Cluster
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* How it works */}
          <div style={{ marginTop: 48 }}>
            <p style={{ ...S.label, textAlign: 'center', marginBottom: 20 }}>Cara Kerja</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: <FileText size={22} color="#1B7A65" />, bg: '#E6F3EF', title: 'Isi Survey', desc: 'Jawab pertanyaan seputar area cluster' },
                { icon: <ShieldCheck size={22} color="#2A9D82" />, bg: '#E8F5E9', title: 'Diverifikasi', desc: 'Jawaban direview oleh Cluster Owner' },
                { icon: <Coins size={22} color="#D4A03D" />, bg: '#FFF8E1', title: 'Dapat Reward', desc: 'IDRX dikirim langsung ke dompet kamu' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 14, padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: T.g500, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div style={S.page}>
        <div style={{ ...S.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${T.c200}`, borderTopColor: T.p600, borderRadius: '50%', animation: 'lokal-spin 800ms linear infinite' }} />
          <p style={{ fontSize: 13, color: T.g500, marginTop: 16 }}>Memuat data vault...</p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error && !summary) {
    return (
      <div style={S.page}>
        <div style={{ ...S.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ ...S.card, padding: 40, textAlign: 'center', maxWidth: 420, width: '100%' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.e100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color={T.e600} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 8 }}>Gagal Memuat Data</h2>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 24, lineHeight: 1.5 }}>{error}</p>
            {emailMode ? (
              <button onClick={resetEmailMode} style={S.btnPrimary}>Kembali</button>
            ) : (
              <button onClick={() => window.location.reload()} style={S.btnPrimary}>Coba Lagi</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const walletDisplay = connected && publicKey
    ? publicKey.toString()
    : emailMode?.wallet || '';

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header with wallet badge + disconnect */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em', marginBottom: 4 }}>Vault LOKAL</h1>
            <p style={{ fontSize: 14, color: T.g500 }}>Lihat dan kelola reward dari kontribusi survey kamu</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Wallet status badge */}
            {walletDisplay && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: T.c100, borderRadius: 9999 }}>
                {emailMode ? (
                  <Mail size={14} color={T.p600} />
                ) : (
                  <Wallet size={14} color={T.p600} />
                )}
                <span style={{ fontSize: 12, fontWeight: 600, color: T.g700, fontFamily: 'var(--font-mono), monospace' }}>
                  {walletDisplay.slice(0, 5)}...{walletDisplay.slice(-4)}
                </span>
              </div>
            )}
            <button onClick={() => { if (emailMode) resetEmailMode(); else disconnect(); }} style={S.btnGhost}>
              <LogOut size={14} />
              {emailMode ? 'Ganti Akun' : 'Putuskan Wallet'}
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <SummaryCard icon={<TrendingUp size={20} color={T.p600} />} label="Total Earned" value={summary?.totalEarned || 0} unit="IDRX" bg={T.p100} />
          <SummaryCard icon={<CheckCircle2 size={20} color={T.success} />} label="Sudah Dikirim" value={summary?.totalDistributed || 0} unit="IDRX" bg="#E8F5E9" />
          <SummaryCard icon={<Clock size={20} color={T.warning} />} label="Pending" value={summary?.totalPending || 0} unit="IDRX" bg="#FFF8E1" />
        </div>

        {/* Withdraw section */}
        {summary && summary.totalPending > 0 && (
          <div style={{ marginBottom: 24 }}>
            {withdrawSuccess ? (
              <div style={{ background: T.p100, border: `1px solid ${T.p600}22`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>Withdraw Berhasil!</p>
                  <p style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>{withdrawSuccess}</p>
                </div>
              </div>
            ) : (
              <div style={{ ...S.card, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>Tarik Reward</p>
                  <p style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>Minimum penarikan: {summary.minWithdrawal.toLocaleString('id')} IDRX</p>
                </div>
                <button onClick={handleWithdraw} disabled={!summary.canWithdraw || withdrawing}
                  style={{ ...S.btnPrimary, opacity: (!summary.canWithdraw || withdrawing) ? 0.5 : 1, cursor: (!summary.canWithdraw || withdrawing) ? 'not-allowed' : 'pointer' }}>
                  {withdrawing ? <><Loader2 size={16} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
                    : <><Download size={16} />Tarik {summary.totalPending.toLocaleString('id')} IDRX</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Email mode note */}
        {emailMode && (
          <div style={{ background: '#E0F2FE', border: '1.5px solid #BAE6FD', borderRadius: 12, padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={16} color="#0EA5E9" />
            <span style={{ fontSize: 13, color: '#0EA5E9', fontWeight: 600 }}>
              Mode Email: {emailMode.email} — Untuk withdraw, kamu perlu memasukkan alamat dompet Phantom.
            </span>
          </div>
        )}

        {/* Clusters list */}
        <div>
          <h2 style={S.sectionTitle}>Kontribusi per Cluster</h2>
          {clusters.length === 0 ? (
            <div style={{ ...S.card, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.c100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Inbox size={24} color={T.g500} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Belum ada kontribusi</p>
              <p style={{ fontSize: 12, color: T.g500, marginBottom: 20 }}>Isi survey untuk mendapatkan reward</p>
              <button onClick={() => router.push('/clusters')} style={S.btnPrimary}>Lihat Cluster<ArrowRight size={16} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {clusters.map((clusterVault) => (
                <ClusterCard key={clusterVault.cluster.id} clusterVault={clusterVault} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email-user withdraw modal */}
      {withdrawModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setWithdrawModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: T.c50, borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: `1px solid ${T.c200}`, overflow: 'hidden' }}
          >
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>Withdraw ke Dompet</div>
                <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>Masukkan alamat dompet Phantom untuk menerima IDRX</div>
              </div>
              <button onClick={() => setWithdrawModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g500, padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 6 }}>
                  Alamat Dompet Solana <span style={{ color: T.danger }}>*</span>
                </label>
                <input
                  type="text"
                  value={withdrawWalletInput}
                  onChange={(e) => { setWithdrawWalletInput(e.target.value); setWithdrawWalletError(null); }}
                  placeholder="Contoh: 3psJ1RBf4Ci96xQdqyuC5HgqKntwyzr1jxuHaFyEVfJt"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${withdrawWalletError ? T.danger : T.c200}`,
                    fontFamily: 'var(--font-mono), monospace', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
                  }}
                />
                {withdrawWalletError && (
                  <div style={{ fontSize: 11, color: T.danger, marginTop: 6, fontWeight: 600 }}>{withdrawWalletError}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleEmailWithdraw}
                  disabled={withdrawWalletLoading}
                  style={{
                    flex: 1, padding: '10px 18px', borderRadius: 9999, border: 'none',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff', background: T.p600,
                    cursor: withdrawWalletLoading ? 'not-allowed' : 'pointer',
                    opacity: withdrawWalletLoading ? 0.6 : 1,
                  }}
                >
                  {withdrawWalletLoading ? (
                    <><Loader2 size={14} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
                  ) : (
                    <>Konfirmasi Withdraw</>
                  )}
                </button>
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${T.c200}`, background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: T.g700, cursor: 'pointer' }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */
function SummaryCard({ icon, label, value, unit, bg }: { icon: React.ReactNode; label: string; value: number; unit: string; bg: string }) {
  return (
    <div style={{ ...S.card, padding: '18px 16px', background: bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={S.label}>{label}</span>
      </div>
      <div style={S.value}>{value.toLocaleString('id')}</div>
      <div style={S.unit}>{unit}</div>
    </div>
  );
}

function ClusterCard({ clusterVault }: { clusterVault: ClusterVault }) {
  const [expanded, setExpanded] = useState(false);
  const { cluster, claims, totalEarned } = clusterVault;
  return (
    <div style={S.card}>
      <button onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={18} color={T.p600} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>{cluster.name}</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>{cluster.location}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.p600, letterSpacing: '-0.02em' }}>{totalEarned.toLocaleString('id')}</div>
          <div style={{ fontSize: 11, color: T.g500 }}>IDRX</div>
        </div>
      </button>
      {expanded && claims.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.c200}` }}>
          {claims.map((claim, idx) => (
            <div key={claim.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: idx < claims.length - 1 ? `1px solid ${T.c200}` : 'none', background: idx % 2 === 0 ? 'transparent' : T.c100 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1 }}>
                  {claim.fieldCodes.slice(0, 5).map((code) => (
                    <span key={code} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, fontWeight: 600, color: T.p600, background: T.p100, padding: '3px 8px', borderRadius: 6 }}>{code}</span>
                  ))}
                  {claim.fieldCodes.length > 5 && (
                    <span style={{ fontSize: 10, color: T.g500, background: T.c200, padding: '3px 8px', borderRadius: 6 }}>+{claim.fieldCodes.length - 5}</span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: T.g500, whiteSpace: 'nowrap' }}>{new Date(claim.createdAt).toLocaleDateString('id', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.g900, whiteSpace: 'nowrap' }}>{claim.amount.toLocaleString('id')} IDRX</span>
                <StatusBadge status={claim.status} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!expanded && claims.length > 0 && (
        <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: T.g500 }}>{claims.length} klaim</span>
          <span style={{ fontSize: 11, color: T.p600, fontWeight: 600 }}>• Klik untuk detail</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'DISTRIBUTED') return <span style={S.badge(T.p100, T.p600)}><CheckCircle2 size={12} />Dikirim</span>;
  return <span style={S.badge(T.c200, T.g500)}><Clock size={12} />Pending</span>;
}
