'use client';

import { T } from '@/lib/constants/mock-data';

export default function COLoading() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif", background: T.c50 }}>
      {/* Sidebar skeleton */}
      <aside style={{ width: 240, background: T.c50, borderRight: `1px solid ${T.c200}`, display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.c200}` }}>
          <div style={{ width: 80, height: 28, background: T.c200, borderRadius: 6 }} />
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.c200 }} />
            <div>
              <div style={{ width: 100, height: 12, background: T.c200, borderRadius: 4, marginBottom: 4 }} />
              <div style={{ width: 60, height: 10, background: T.c200, borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10 }}>
              <div style={{ width: 17, height: 17, background: T.c200, borderRadius: 4 }} />
              <div style={{ width: 80, height: 12, background: T.c200, borderRadius: 4 }} />
            </div>
          ))}
        </nav>
      </aside>

      {/* Content skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ padding: '20px 32px', borderBottom: `1px solid ${T.c200}`, background: T.c50, flexShrink: 0 }}>
          <div style={{ width: 120, height: 20, background: T.c200, borderRadius: 4 }} />
        </header>
        <div style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${T.c200}`, borderTopColor: T.p600, borderRadius: '50%', animation: 'lokal-spin 800ms linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, color: T.g500 }}>Memuat...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
