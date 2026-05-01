'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, X } from 'lucide-react';
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
    <div style={{ display: 'grid', gridTemplateColumns: selectedCluster ? '1fr 300px' : '1fr', transition: 'grid-template-columns 300ms ease', borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden', minHeight: 420 }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <ClusterMap
          clusters={clusters}
          onClusterClick={(slug) => setSelectedSlug(slug)}
          broadView={true}
          height={420}
        />
      </div>

      {selectedCluster && (
        <div style={{
          background: '#fff',
          borderLeft: `1px solid ${T.c200}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 200ms ease',
        }}>
          <div style={{ padding: '16px 18px 14px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: selectedCluster.status === 'ACTIVE' ? T.p600 : T.g500, borderRadius: '50%' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cluster Dipilih
              </div>
            </div>
            <button
              onClick={() => setSelectedSlug(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g500, padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ padding: '16px 18px', flex: 1, overflow: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.g900, marginBottom: 2, lineHeight: 1.3 }}>
              {selectedCluster.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.g500, marginBottom: 14 }}>
              <MapPin size={11} />
              {selectedCluster.anchorLabel}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: T.p100, padding: '10px 12px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, marginBottom: 4 }}>Confidence</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.p600, lineHeight: 1 }}>{selectedCluster.confidenceScore}%</div>
              </div>
              <div style={{ background: T.c100, padding: '10px 12px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, marginBottom: 4 }}>Status</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedCluster.status === 'ACTIVE' ? T.p600 : T.g500 }}>
                  {selectedCluster.status === 'ACTIVE' ? 'Aktif' : 'Seeding'}
                </div>
              </div>
            </div>

            <div style={{ background: T.c50, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.c200}`, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.g700, marginBottom: 8 }}>Data Cluster</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: T.g500 }}>Cluster ID</span>
                  <span style={{ color: T.g900, fontWeight: 600, fontFamily: 'monospace', fontSize: 11 }}>{selectedCluster.slug}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: T.g500 }}>Coordinate</span>
                  <span style={{ color: T.g900, fontWeight: 600, fontFamily: 'monospace', fontSize: 11 }}>{selectedCluster.anchorLat.toFixed(4)}, {selectedCluster.anchorLng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 18px 16px', borderTop: `1px solid ${T.c200}`, flexShrink: 0 }}>
            <Link
              href={`/clusters/${selectedCluster.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '11px 14px',
                background: T.p600,
                color: '#fff',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'background 150ms',
              }}
            >
              Lihat Detail Cluster
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}