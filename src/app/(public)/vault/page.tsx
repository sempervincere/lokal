'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, TrendingUp, Clock, CheckCircle2, Loader2, Download, ArrowRight, AlertTriangle, Inbox, FileText, ShieldCheck, Coins, LogOut } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
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
  }, [publicKey]);

  /* ─── Not Connected State ─── */
  if (!connected) {
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
  if (error) {
    return (
      <div style={S.page}>
        <div style={{ ...S.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ ...S.card, padding: 40, textAlign: 'center', maxWidth: 420, width: '100%' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.e100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color={T.e600} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 8 }}>Gagal Memuat Data</h2>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 24, lineHeight: 1.5 }}>{error}</p>
            <button onClick={() => window.location.reload()} style={S.btnPrimary}>Coba Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header with disconnect */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em', marginBottom: 4 }}>Vault LOKAL</h1>
            <p style={{ fontSize: 14, color: T.g500 }}>Lihat dan kelola reward dari kontribusi survey kamu</p>
          </div>
          <button onClick={() => disconnect()} style={S.btnGhost}>
            <LogOut size={14} />
            Putuskan Wallet
          </button>
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
