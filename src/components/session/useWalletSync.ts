'use client';

/**
 * useWalletSync
 *
 * Listens to the Solana wallet adapter's connect/disconnect events and
 * persists the wallet address to the LOKAL Prisma users table via
 * PATCH /api/auth/wallet.
 *
 * Usage: Mount once in a Client Component that lives inside SolanaWalletProvider.
 *
 * Why a hook and not a Provider effect?
 * - The WalletProvider is already a large bundle (deferred via dynamic import).
 * - Keeping the sync logic separate means we can tree-shake it on pages that
 *   don't need it and test it in isolation.
 *
 * Auto-connect behavior explained:
 * - wallet-adapter persists the last selected wallet name in localStorage
 *   under the key "walletName".
 * - With autoConnect=true, on every page load the adapter reads that key and
 *   reconnects silently (no popup) if Phantom is already unlocked.
 * - This is EXPECTED — the user already approved Phantom during a previous
 *   session. If Phantom is locked, the extension shows its own unlock UI.
 * - On disconnect (or sign-out), we clear localStorage.removeItem("walletName")
 *   so the next page load starts fresh with no auto-connect.
 */

import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function useWalletSync() {
  const { publicKey, connected, disconnect } = useWallet();
  const lastSyncedAddress = useRef<string | null>(null);

  useEffect(() => {
    const address = publicKey?.toBase58() ?? null;

    // Avoid duplicate API calls for the same address
    if (address === lastSyncedAddress.current) return;
    lastSyncedAddress.current = address;

    // Fire-and-forget — non-blocking. Errors are logged server-side.
    fetch('/api/auth/wallet', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address }),
    }).catch((err) => {
      console.warn('[useWalletSync] Could not sync wallet address:', err);
    });

    // When wallet disconnects, clear localStorage so autoConnect doesn't
    // silently reconnect on the next page load
    if (!connected && !address) {
      localStorage.removeItem('walletName');
    }
  }, [publicKey, connected]);

  return { disconnect };
}
