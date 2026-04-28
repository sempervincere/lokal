'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { ClusterMap } from './ClusterMap';

interface ClusterBrief {
  anchorLat: number;
  anchorLng: number;
  anchorLabel: string;
  slug: string;
  name: string;
  confidenceScore: number;
  status: string;
}

interface ClustersMapInteractiveProps {
  clusters: ClusterBrief[];
}

export function ClustersMapInteractive({ clusters }: ClustersMapInteractiveProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedCluster = clusters.find((c) => c.slug === selectedSlug) ?? null;

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.c200}` }}>
      <ClusterMap
        clusters={clusters}
        onClusterClick={(slug) => setSelectedSlug(slug)}
        broadView={true}
        height={420}
      />

      {selectedCluster && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: '#fff',
          borderRadius: 12,
          border: `1px solid ${T.c200}`,
          padding: '16px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          minWidth: 200,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, background: T.p600, borderRadius: '50%' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cluster Dipilih
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.g900, marginBottom: 4 }}>
            {selectedCluster.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.g500, marginBottom: 12 }}>
            <MapPin size={11} />
            {selectedCluster.anchorLabel}
          </div>
          <div style={{ fontSize: 12, color: T.g700, marginBottom: 12 }}>
            Confidence: <strong style={{ color: T.p600 }}>{selectedCluster.confidenceScore}%</strong>
          </div>
          <Link
            href={`/clusters/${selectedCluster.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 14px',
              background: T.p600,
              color: '#fff',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Lihat Detail
            <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
