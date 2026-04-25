'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, FileText, DollarSign, MapPin, LogOut, Award, Wallet } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const NAV_ITEMS = [
  { id: 'overview', href: '/co/dashboard', icon: Activity,    label: 'Overview' },
  { id: 'fields',   href: '/co/fields',    icon: FileText,    label: 'Data Fields' },
  { id: 'earnings', href: '/co/earnings',  icon: DollarSign,  label: 'Pendapatan' },
  { id: 'cluster',  href: '/co/cluster',   icon: MapPin,      label: 'Cluster Saya' },
];

export default function COLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const activePage = NAV_ITEMS.find(n => pathname.startsWith(n.href))?.id ?? 'overview';

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif", background: T.c50 }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: T.c50, borderRight: `1px solid ${T.c200}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        {/* Logo + CO info */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.c200}` }}>
          <a href="/">
            <Image src="/logo.png" alt="LOKAL" width={80} height={28} style={{ objectFit: 'contain' }} />
          </a>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={16} color={T.p600} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g900 }}>Rizky F.</div>
              <div style={{ fontSize: 11, color: T.g500 }}>Cluster Owner · Tier 3</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(n => {
            const active = activePage === n.id;
            const IconComp = n.icon;
            return (
              <SidebarLink key={n.id} href={n.href} active={active} icon={<IconComp size={17} color={active ? T.p600 : T.g500} />} label={n.label} />
            );
          })}
        </nav>

        {/* Wallet + logout */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.c200}` }}>
          {connected && publicKey ? (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: T.p100, marginBottom: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Wallet Terhubung</div>
              <div style={{ fontSize: 11, color: T.g500, fontFamily: 'var(--font-mono), monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
              </div>
              <button onClick={() => disconnect()} style={{ marginTop: 6, fontSize: 11, color: T.danger, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                Putuskan
              </button>
            </div>
          ) : (
            <button onClick={() => setVisible(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              color: T.e600, background: T.e100, transition: 'all 150ms', width: '100%', marginBottom: 6,
            }}>
              <Wallet size={15} color={T.e600} />
              Hubungkan Wallet
            </button>
          )}
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

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ padding: '20px 32px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.c50, flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: 0, letterSpacing: '-0.01em' }}>
            {NAV_ITEMS.find(n => n.id === activePage)?.label ?? 'Dashboard'}
          </h1>
          <div style={{ fontSize: 12, color: T.g500 }}>Cluster Owner</div>
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
    <a href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
      textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 500,
      color: active ? T.p600 : T.g700,
      background: active ? T.p100 : hov ? T.c100 : 'transparent',
      transition: 'all 150ms',
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {icon}
      {label}
    </a>
  );
}
