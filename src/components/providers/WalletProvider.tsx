'use client';

import { useCallback, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import type { WalletError } from '@solana/wallet-adapter-base';
import { WalletSyncMount } from '@/components/session/WalletSyncMount';

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint =
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL ??
    'https://api.devnet.solana.com';

  // Only Phantom — avoids pulling in WalletConnect's 84KB + pino chain
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const onError = useCallback((error: WalletError) => {
    // Surface wallet errors visibly in dev instead of silent failures
    console.error('[Wallet]', error.name, error.message);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/*
       * autoConnect={true} is required so that after the user selects a wallet
       * in WalletModal, the adapter calls connect() automatically and opens
       * the Phantom popup.
       *
       * Side-effect: on subsequent page loads, the wallet-adapter reads
       * localStorage key "walletName" and reconnects silently (no popup) if
       * Phantom is already unlocked. This is expected UX — the wallet was
       * already approved. If Phantom is locked, it shows its own unlock UI.
       *
       * To force a fresh connect on every load you would need to clear
       * localStorage.removeItem("walletName") on sign-out, which syncUser
       * handles via the disconnect event listener in useWalletSync.
       */}
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          <WalletSyncMount />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
