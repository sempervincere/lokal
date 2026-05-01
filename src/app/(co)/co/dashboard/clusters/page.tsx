'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';

interface ClusterSummary {
  id: string;
  slug: string;
  name: string;
  anchorLabel: string;
  status: string;
  confidenceScore: number;
  dataCompleteness: number;
  totalValidatedFields: number;
  updatedAt: string;
}

interface ProposalSummary {
  id: string;
  clusterName: string;
  clusterDescription: string | null;
  anchorLabel: string;
  status: string;
  occupation: string;
  areaDuration: string;
  primaryAnchor: string;
  adminNote: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Baru saja';
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)}h lalu`;
}

export default function COClusterListPage() {
  const router = useRouter();
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/co/clusters/list')
      .then(r => r.json())
      .then(data => {
        setClusters(data.clusters || []);
        setProposals(data.proposals || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: T.danger }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>Cluster Saya</div>
          <div style={{ fontSize: 13, color: T.g500, marginTop: 2 }}>{clusters.length} active · {proposals.length} pending proposal</div>
        </div>
        <Button
          icon={<Plus size={16} color={T.c50} />}
          onClick={() => router.push('/co/clusters/create')}
        >
          Buat Cluster Baru
        </Button>
      </div>

      {/* Active Clusters */}
      {clusters.length === 0 ? (
        <div style={{
          background: T.c50, border: `1px dashed ${T.c200}`, borderRadius: 16,
          padding: '48px 24px', textAlign: 'center', marginBottom: 24,
        }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MapPin size={24} color={T.p600} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum ada cluster</div>
          <div style={{ fontSize: 13, color: T.g500, maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
            Kamu belum memiliki cluster aktif. Ajukan proposal cluster pertama kamu untuk mulai mengumpulkan data dan menghasilkan pendapatan.
          </div>
          <Button icon={<Plus size={16} color={T.c50} />} onClick={() => router.push('/co/clusters/create')}>
            Ajukan Cluster Pertama
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 32 }}>
          {clusters.map(c => (
            <div
              key={c.id}
              onClick={() => router.push('/co/cluster')}
              style={{
                background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '20px',
                cursor: 'pointer', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.p600; e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,122,101,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.c200; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Badge variant={c.status === 'ACTIVE' ? 'active' : 'seeding'}>
                  {c.status === 'ACTIVE' ? 'Active' : c.status}
                </Badge>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.g500 }}>
                  <ShieldCheck size={12} color={T.p600} />
                  {c.confidenceScore}/100
                </div>
              </div>
              <MapPlaceholder accent="#E6F3EF" color={T.p400} height={100} />
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: T.g500, marginBottom: 10 }}>{c.anchorLabel}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: T.g500 }}>
                  <span>{c.totalValidatedFields} field tervalidasi</span>
                  <span>·</span>
                  <span>{c.dataCompleteness}% lengkap</span>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {timeAgo(c.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Proposals */}
      {proposals.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 12 }}>Proposal Menunggu Review</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proposals.map(p => (
              <div key={p.id} style={{
                background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 2 }}>{p.clusterName}</div>
                  <div style={{ fontSize: 12, color: T.g500 }}>{p.anchorLabel} · {p.occupation} · {timeAgo(p.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {p.adminNote && (
                    <span style={{ fontSize: 11, color: T.warning, maxWidth: 160 }}>{p.adminNote}</span>
                  )}
                  <Badge variant={
                    p.status === 'PENDING' ? 'seeding' :
                    p.status === 'APPROVED' ? 'active' : 'danger'
                  }>
                    {p.status === 'PENDING' ? 'Menunggu Review' :
                     p.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
