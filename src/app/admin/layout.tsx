'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    id: 'fields',
    href: '/admin/fields',
    icon: FileText,
    label: 'Field Review',
  },
  {
    id: 'clusters',
    href: '/admin/clusters',
    icon: MapPin,
    label: 'Clusters',
  },
  {
    id: 'survey-audit',
    href: '/admin/survey-audit',
    icon: ShieldAlert,
    label: 'Survey Audit',
  },
  {
    id: 'users',
    href: '/admin/users',
    icon: Users,
    label: 'Users',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPORARY: Set to true to bypass admin role check for UI preview.
// Set to false before production / demo day.
// ═══════════════════════════════════════════════════════════════════════════════
const PREVIEW_MODE = false;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const activePage =
    NAV_ITEMS.find((n) => {
      if (n.href === '/admin') return pathname === '/admin';
      return pathname.startsWith(n.href);
    })?.id ?? 'dashboard';

  const [ready, setReady] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{
    fullName: string;
    email: string;
  } | null>(null);
  const [previewWarning, setPreviewWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) {
          if (PREVIEW_MODE && res.status === 403) {
            // Allow preview without admin role
            if (!cancelled) {
              setAdminInfo({
                fullName: 'Preview User',
                email: 'preview@lokal.id',
              });
              setPreviewWarning(true);
            }
          } else {
            throw new Error('NOT_ADMIN');
          }
        } else {
          const data = await res.json();
          if (!cancelled) {
            setAdminInfo({
              fullName: data.user.fullName,
              email: data.user.email,
            });
          }
        }
      } catch {
        if (!cancelled) router.replace('/');
        return;
      }
      if (!cancelled) setReady(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  // Show skeleton sidebar immediately, update with real info when ready
  const sidebarContent = (
    <aside
      style={{
        width: 240,
        background: T.c50,
        borderRight: `1px solid ${T.c200}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo + Admin Info */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${T.c200}`,
        }}
      >
        <Image src="/logo.png" alt="LOKAL" width={80} height={28} style={{ objectFit: 'contain' }} />
        {ready && adminInfo ? (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={16} color={T.p600} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g900 }}>{adminInfo.fullName}</div>
              <div style={{ fontSize: 11, color: T.g500 }}>Administrator</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.c200 }} />
            <div>
              <div style={{ width: 80, height: 12, background: T.c200, borderRadius: 4, marginBottom: 4 }} />
              <div style={{ width: 60, height: 10, background: T.c200, borderRadius: 4 }} />
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((n) => {
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

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.c200}` }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 500,
            color: T.g500,
            background: 'transparent',
            transition: 'all 150ms',
            textAlign: 'left',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = T.c100;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <LogOut size={16} color={T.g500} />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        background: T.c50,
      }}
    >
      {/* Sidebar */}
      {sidebarContent}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '20px 32px',
            borderBottom: `1px solid ${T.c200}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: T.c50,
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: T.g900,
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {NAV_ITEMS.find((n) => n.id === activePage)?.label ??
              'Dashboard'}
          </h1>
          <div style={{ fontSize: 12, color: T.g500 }}>Administrator</div>
        </header>

        {/* Preview Warning Banner */}
        {previewWarning && (
          <div
            style={{
              background: T.warning + '15',
              borderBottom: `1px solid ${T.warning}30`,
              padding: '10px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={16} color={T.warning} />
            <span style={{ fontSize: 12, color: T.warning, fontWeight: 600 }}>
              PREVIEW MODE: Admin role check is disabled. Set{' '}
              <code style={{ fontFamily: 'monospace', background: T.c200, padding: '1px 5px', borderRadius: 4 }}>
                PREVIEW_MODE = false
              </code>{' '}
              in layout.tsx before demo.
            </span>
          </div>
        )}

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? T.p600 : T.g700,
        background: active ? T.p100 : hov ? T.c100 : 'transparent',
        transition: 'all 150ms',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {icon}
      {label}
    </Link>
  );
}
