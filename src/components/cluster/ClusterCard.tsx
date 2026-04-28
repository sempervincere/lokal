'use client';

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { ClusterStats } from './ClusterStats';
import type { ClusterKeyStats } from '@/lib/utils/clusterStats';

export interface ClusterCardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  anchorLabel: string;
  confidenceScore: number;
  dataCompleteness: number;
  totalValidatedFields: number;
  status: string;
  keyStats?: ClusterKeyStats | null;
}

interface ClusterCardProps {
  cluster: ClusterCardData;
}

export function ClusterCard({ cluster }: ClusterCardProps) {
  const statusVariant = cluster.status === 'ACTIVE' ? 'active' : 'seeding';
  const statusLabel = cluster.status === 'ACTIVE' ? 'Aktif' : 'Sedang Dikumpulkan';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: `1px solid ${T.c200}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 200ms ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Header strip */}
      <div style={{
        background: `linear-gradient(135deg, ${T.p600} 0%, ${T.p500} 100%)`,
        padding: '18px 20px 14px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{cluster.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, opacity: 0.85, fontSize: 12 }}>
              <MapPin size={12} />
              <span>{cluster.anchorLabel}</span>
            </div>
          </div>
          <Badge variant={statusVariant} style={{ flexShrink: 0, marginTop: 2 }}>
            {statusLabel}
          </Badge>
        </div>

        {cluster.description && (
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8, lineHeight: 1.5 }}>
            {cluster.description}
          </div>
        )}
      </div>

      {/* Stats body */}
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <ClusterStats
          confidenceScore={cluster.confidenceScore}
          dataCompleteness={cluster.dataCompleteness}
          totalValidatedFields={cluster.totalValidatedFields}
        />

        {/* Key stats pills */}
        {cluster.keyStats && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {cluster.keyStats.priceCeiling != null && (
              <KeyStatChip label="Price Ceiling" value={`Rp ${cluster.keyStats.priceCeiling.toLocaleString('id-ID')}`} />
            )}
            {cluster.keyStats.peakHour && (
              <KeyStatChip label="Peak" value={cluster.keyStats.peakHour} />
            )}
            {cluster.keyStats.trafficLevel && (
              <KeyStatChip label="Traffic" value={cluster.keyStats.trafficLevel} />
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 18px' }}>
        <Link
          href={`/clusters/${cluster.slug}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            background: T.p600,
            color: '#fff',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            transition: 'background 150ms',
          }}
        >
          Lihat Cluster
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function KeyStatChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: T.p100,
      borderRadius: 6,
      padding: '3px 8px',
      display: 'flex',
      gap: 4,
      alignItems: 'center',
      fontSize: 11,
    }}>
      <span style={{ color: T.g500, fontWeight: 600 }}>{label}:</span>
      <span style={{ color: T.p600, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
