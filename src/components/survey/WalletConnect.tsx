'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, Wallet, Mail, ChevronRight, Info } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface WalletConnectProps {
  onConnect: (wallet: string, email?: string) => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
  connectedWallet?: string | null;
}

const S = {
  card: { background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' } as React.CSSProperties,
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', borderRadius: 9999, border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: T.c50, background: T.p600, cursor: 'pointer', transition: 'all 150ms', width: '100%' } as React.CSSProperties,
  btnEmail: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', borderRadius: 9999, border: `2px solid ${T.p600}`, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: T.p600, background: T.p100, cursor: 'pointer', transition: 'all 150ms', width: '100%' } as React.CSSProperties,
  input: { width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: `1px solid ${T.c200}`, fontFamily: 'inherit', fontSize: 14, color: T.g900, background: '#fff', outline: 'none', transition: 'border-color 150ms' } as React.CSSProperties,
};

export function WalletConnect({ onConnect, onDisconnect, isConnected, connectedWallet }: WalletConnectProps) {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [tiplinkEmail, setTiplinkEmail] = useState('');
  const [tiplinkLoading, setTiplinkLoading] = useState(false);
  const [showTiplink, setShowTiplink] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const wasDisconnectedRef = useRef(false);

  useEffect(() => {
    // Don't reconnect if user just disconnected
    if (wasDisconnectedRef.current) {
      wasDisconnectedRef.current = false;
      return;
    }
    if (connected && publicKey) {
      onConnect(publicKey.toString());
    }
  }, [connected, publicKey, onConnect]);

  const handleDisconnect = useCallback(() => {
    wasDisconnectedRef.current = true;
    disconnect();
    onDisconnect?.();
  }, [disconnect, onDisconnect]);

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
            onClick={handleDisconnect}
            style={{ fontSize: 12, color: T.danger, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontFamily: 'inherit' }}
          >
            Putus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      {/* Main connect card */}
      <div style={{ ...S.card, padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Wallet size={28} color={T.p600} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Hubungkan Dompet</h3>
          <p style={{ fontSize: 13, color: T.g500, lineHeight: 1.5 }}>Kamu perlu hubungkan dompet untuk mengisi survey dan menerima reward</p>
        </div>

        {/* Custom Wallet Button — full width, matching email button */}
        <button
          onClick={() => setVisible(true)}
          style={{
            ...S.btnPrimary,
            marginBottom: 20,
          }}
        >
          <Wallet size={18} />
          Select Wallet
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: T.c200 }} />
          <span style={{ fontSize: 11, color: T.g500, fontWeight: 500 }}>atau</span>
          <div style={{ flex: 1, height: 1, background: T.c200 }} />
        </div>

        {/* Tiplink option */}
        {!showTiplink ? (
          <button
            onClick={() => setShowTiplink(true)}
            style={S.btnEmail}
          >
            <Mail size={18} color={T.p600} />
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
