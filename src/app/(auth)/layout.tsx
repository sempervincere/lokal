'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, MapPin, FileText, CreditCard, Wallet, LogOut, User } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';

const SolanaWalletProvider = dynamic(
  () => import('@/components/providers/WalletProvider').then(m => m.SolanaWalletProvider),
  { ssr: false, loading: () => null },
);

const NAV_ITEMS = [
  { id: 'overview',     href: '/dashboard',              icon: Activity,   label: 'Overview' },
  { id: 'clusters',     href: '/dashboard/clusters',     icon: MapPin,     label: 'Clusters' },
  { id: 'history',      href: '/dashboard/history',      icon: FileText,   label: 'Riwayat Simulasi' },
  { id: 'subscription', href: '/dashboard/subscription', icon: CreditCard, label: 'Langganan' },
  { id: 'profile',      href: '/dashboard/profile',      icon: User,       label: 'Profil' },
];

// Exact match for /dashboard, prefix match for all others
function getActiveId(pathname: string) {
  if (pathname === '/dashboard') return 'overview';
  const match = NAV_ITEMS.slice(1).find(n => pathname.startsWith(n.href));
  return match?.id ?? 'overview';
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SolanaWalletProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </SolanaWalletProvider>
  );
}

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  // Session-only routes (concept, report) don't need the sidebar
  const isSessionRoute = pathname.startsWith('/session/');
  if (isSessionRoute) return <>{children}</>;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  const activePage = getActiveId(pathname);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif", background: T.c50 }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: T.c50, borderRight: `1px solid ${T.c200}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.c200}` }}>
          <a href="/">
            <Image src="/logo.png" alt="LOKAL" width={80} height={28} style={{ objectFit: 'contain' }} />
          </a>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(n => {
            const active = activePage === n.id;
            const IconComp = n.icon;
            return (
              <SidebarLink
                key={n.id}
                href={n.href}
                active={active}
                icon={<IconComp size={17} color={active ? T.p600 : T.g500} />}
                label={n.label}
              />
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.c200}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => connected ? disconnect() : setVisible(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              color: connected ? T.success : T.e600,
              background: connected ? T.p100 : T.e100,
              transition: 'all 150ms', width: '100%',
            }}>
            <Wallet size={15} color={connected ? T.success : T.e600} />
            {connected && publicKey
              ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
              : 'Hubungkan Wallet'}
            {connected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, marginLeft: 'auto' }} />}
          </button>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            color: T.g500, background: 'transparent', transition: 'all 150ms', textAlign: 'left', width: '100%',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = T.c100)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={16} color={T.g500} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ padding: '20px 32px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.c50, flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: 0, letterSpacing: '-0.01em' }}>
              {NAV_ITEMS.find(n => n.id === activePage)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div style={{ fontSize: 12, color: T.g500 }}>Business Owner</div>
        </header>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
      textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 500,
      color: active ? T.p600 : T.g700,
      background: active ? T.p100 : hov ? T.c100 : 'transparent',
      transition: 'all 150ms',
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {icon}
      {label}
    </Link>
  );
}
