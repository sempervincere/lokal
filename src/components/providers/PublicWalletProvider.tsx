'use client';

import dynamic from 'next/dynamic';

const SolanaWalletProvider = dynamic(
  () => import('@/components/providers/WalletProvider').then(m => m.SolanaWalletProvider),
  { ssr: false, loading: () => null },
);

export function PublicWalletProvider({ children }: { children: React.ReactNode }) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
