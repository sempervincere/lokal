'use client';

/**
 * WalletSyncMount
 *
 * A thin Client Component that mounts useWalletSync inside SolanaWalletProvider.
 * Must be rendered as a child of SolanaWalletProvider (which requires 'use client').
 *
 * This pattern keeps layout.tsx as a pure Server Component while still giving
 * us the wallet event listeners we need.
 */

import { useWalletSync } from './useWalletSync';

export function WalletSyncMount() {
  useWalletSync();
  return null; // renders nothing — purely side-effect
}
