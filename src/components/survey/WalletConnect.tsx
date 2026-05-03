'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { Loader2, Wallet, Mail, ChevronRight, Info } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface WalletConnectProps {
  onConnect: (wallet: string, email?: string) => void;
  isConnected?: boolean;
  connectedWallet?: string | null;
}

const S = {
  card: { background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' } as React.CSSProperties,
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 9999, border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: T.c50, background: T.p600, cursor: 'pointer', transition: 'all 150ms', width: '100%' } as React.CSSProperties,
  btnSecondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 9999, border: `1.5px solid ${T.c200}`, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: T.g700, background: T.c50, cursor: 'pointer', transition: 'all 150ms', width: '100%' } as React.CSSProperties,
  input: { width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: `1px solid ${T.c200}`, fontFamily: 'inherit', fontSize: 14, color: T.g900, background: '#fff', outline: 'none', transition: 'border-color 150ms' } as React.CSSProperties,
};

export function WalletConnect({ onConnect, isConnected, connectedWallet }: WalletConnectProps) {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { connection } = useConnection();
  const [tiplinkEmail, setTiplinkEmail] = useState('');
  const [tiplinkLoading, setTiplinkLoading] = useState(false);
  const [showTiplink, setShowTiplink] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      onConnect(publicKey.toString());
    }
  }, [connected, publicKey, onConnect]);

  const handleTiplinkConnect = useCallback(async () => {
    if (!tiplinkEmail || !tiplinkEmail.includes('@')) return;
    setTiplinkLoading(true);
    try {
      const response = await fetch('/api/auth/tiplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tiplinkEmail }),
      });
      if (!response.ok) throw new Error('Failed to create wallet');
      const data = await response.json();
      onConnect(data.walletAddress, tiplinkEmail);
    } catch (error) {
      console.error('Tiplink error:', error);
    } finally {
      setTiplinkLoading(false);
    }
  }, [tiplinkEmail, onConnect]);

  if (isConnected && connectedWallet) {
    return (
      <div style={{ ...S.card, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color={T.p600} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.g900 }}>Terhubung</p>
              <p style={{ fontSize: 11, color: T.g500, fontFamily: 'var(--font-mono), monospace', marginTop: 2 }}>
                {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
              </p>
            </div>
          </div>
          <button
            onClick={() => disconnect()}
            style={{ fontSize: 12, color: T.danger, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontFamily: 'inherit' }}
          >
            Putus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Main connect card */}
      <div style={{ ...S.card, padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Wallet size={26} color={T.p600} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Hubungkan Dompet</h3>
          <p style={{ fontSize: 13, color: T.g500 }}>Kamu perlu hubungkan dompet untuk mengisi survey</p>
        </div>

        {/* Phantom / Solana Wallet */}
        <div style={{ marginBottom: 16 }}>
          <WalletMultiButton style={{ width: '100%', background: T.p600, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '12px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer' }} />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: T.c200 }} />
          <span style={{ fontSize: 11, color: T.g500, fontWeight: 500 }}>atau</span>
          <div style={{ flex: 1, height: 1, background: T.c200 }} />
        </div>

        {/* Tiplink option */}
        {!showTiplink ? (
          <button
            onClick={() => setShowTiplink(true)}
            style={S.btnSecondary}
          >
            <Mail size={16} color={T.g700} />
            Lanjut dengan Email
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color={T.g500} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={tiplinkEmail}
                onChange={(e) => setTiplinkEmail(e.target.value)}
                placeholder="email@example.com"
                style={{
                  ...S.input,
                  borderColor: inputFocus ? T.p600 : T.c200,
                  boxShadow: inputFocus ? `0 0 0 3px ${T.p100}` : 'none',
                }}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleTiplinkConnect()}
              />
            </div>
            <button
              onClick={handleTiplinkConnect}
              disabled={tiplinkLoading || !tiplinkEmail.includes('@')}
              style={{
                ...S.btnPrimary,
                opacity: (tiplinkLoading || !tiplinkEmail.includes('@')) ? 0.5 : 1,
                cursor: (tiplinkLoading || !tiplinkEmail.includes('@')) ? 'not-allowed' : 'pointer',
              }}
            >
              {tiplinkLoading ? (
                <><Loader2 size={16} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
              ) : (
                <>Lanjutkan<ChevronRight size={16} /></>
              )}
            </button>
            <button
              onClick={() => setShowTiplink(false)}
              style={{ fontSize: 12, color: T.g500, background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}
            >
              Kembali
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0 4px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <Info size={11} color={T.p600} />
        </div>
        <p style={{ fontSize: 11, color: T.g500, lineHeight: 1.6 }}>
          Dompet kamu digunakan untuk identitas dan menerima reward. Tidak ada biaya untuk mengisi survey.
        </p>
      </div>
    </div>
  );
}
