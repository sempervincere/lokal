'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, BarChart2, MapPin, ArrowRight } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface ClusterCTACardProps {
  clusterId: string;
  clusterName: string;
  clusterSlug: string;
}

export function ClusterCTACard({ clusterName }: ClusterCTACardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* CTA card */}
      <div style={{
        background: `linear-gradient(135deg, ${T.p600} 0%, ${T.p500} 100%)`,
        borderRadius: 16,
        padding: '22px 20px',
        color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
          Simulasikan Bisnis Kamu
        </div>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 18, lineHeight: 1.6 }}>
          Chat gratis 7 pesan. Lanjut dengan laporan lengkap 10 seksi + 12 jam konsultasi.
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'block',
            width: '100%',
            background: '#fff',
            color: T.p600,
            border: 'none',
            borderRadius: 10,
            padding: '11px 16px',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          Coba Gratis Dulu
        </button>
        <div style={{ fontSize: 11, opacity: 0.75 }}>
          Laporan penuh: Rp 400.000 IDRX
        </div>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '32px 28px',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: T.c200,
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: T.g700,
              }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: T.p100,
              borderRadius: 8,
              padding: '5px 12px',
              marginBottom: 16,
            }}>
              <div style={{ width: 8, height: 8, background: T.p600, borderRadius: '50%' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {clusterName}
              </span>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: T.g900, margin: '0 0 8px' }}>
              Selamat datang di LOKAL
            </h2>
            <p style={{ fontSize: 13, color: T.g500, lineHeight: 1.6, margin: '0 0 24px' }}>
              LOKAL punya dua tipe pengguna. Pilih yang paling sesuai dengan kamu.
            </p>

            {/* Role cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <RoleCard
                icon={<BarChart2 size={20} color={T.p600} />}
                title="Business Owner (BO)"
                description="Ingin validasi konsep F&B? Daftar sebagai BO. Dapatkan 7 pesan gratis + laporan simulasi lengkap (Rp 400K)."
              />
              <RoleCard
                icon={<MapPin size={20} color={T.p600} />}
                title="Cluster Owner (CO)"
                description="Ingin hasilkan pendapatan dari data lapangan? Daftar sebagai CO. Kontribusi data, dapatkan revenue share."
              />
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <Link
                href="/login?role=bo"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '11px 14px',
                  background: T.p600,
                  color: '#fff',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                Daftar sebagai BO
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/login?role=co"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '11px 14px',
                  background: T.p100,
                  color: T.p600,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                  border: `1px solid ${T.p400}`,
                }}
              >
                Daftar sebagai CO
                <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link
                href="/login"
                style={{ fontSize: 13, color: T.g500, textDecoration: 'none', fontWeight: 600 }}
              >
                Sudah punya akun? <span style={{ color: T.p600 }}>Masuk</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RoleCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      padding: '14px 16px',
      background: T.c50,
      borderRadius: 12,
      border: `1px solid ${T.c200}`,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 40,
        height: 40,
        background: T.p100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.g900, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: T.g500, lineHeight: 1.6 }}>{description}</div>
      </div>
    </div>
  );
}
