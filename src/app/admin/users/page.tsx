'use client';

import { T } from '@/lib/constants/mock-data';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 32px',
        animation:
          'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.g900,
            letterSpacing: '-0.01em',
          }}
        >
          Users
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          Daftar semua pengguna platform LOKAL.
        </div>
      </div>

      <div
        style={{
          background: T.c50,
          border: `1px solid ${T.c200}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: T.p100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Users size={24} color={T.p600} />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: T.g900,
            marginBottom: 6,
          }}
        >
          User Management
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.g500,
            maxWidth: 400,
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          Halaman ini akan menampilkan daftar semua pengguna platform. Fitur
          sedang dalam pengembangan — Phase 6.
        </div>
      </div>
    </div>
  );
}
