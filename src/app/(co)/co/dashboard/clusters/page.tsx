'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Plus, ShieldCheck, Clock, X, Edit3, AlertCircle,
  CheckCircle2, XCircle, Building2, Users, ChevronRight,
} from 'lucide-react';
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
  physicalPresence: string;
  sampleBusinesses: any;
  anchorType: string;
  corridorDesc: string;
  anchorLat: number;
  anchorLng: number;
  radiusKm: number;
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

const DURATION_LABELS: Record<string, string> = {
  under_6mo: 'Kurang dari 6 bulan',
  '6mo_2y': '6 bulan — 2 tahun',
  '2y_plus': 'Lebih dari 2 tahun',
};

const PRESENCE_LABELS: Record<string, string> = {
  daily: 'Setiap hari',
  '3x_week': '3× seminggu',
  weekly: 'Seminggu sekali',
  whenever: 'Kalau perlu saja',
};

const ANCHOR_TYPE_LABELS: Record<string, string> = {
  university: 'Gerbang Universitas',
  mall: 'Pusat Perbelanjaan (Mall)',
  market: 'Pasar Tradisional',
  station: 'Stasiun / Terminal',
  office: 'Kawasan Perkantoran',
  residential: 'Kawasan Perumahan',
};

function getStatusIcon(status: string) {
  if (status === 'APPROVED') return <CheckCircle2 size={20} color={T.success} />;
  if (status === 'REJECTED') return <XCircle size={20} color={T.danger} />;
  return <Clock size={20} color={T.warning} />;
}

function getStatusBadgeVariant(status: string) {
  if (status === 'APPROVED') return 'active';
  if (status === 'REJECTED') return 'danger';
  return 'seeding';
}

function getStatusLabel(status: string) {
  if (status === 'APPROVED') return 'Disetujui';
  if (status === 'REJECTED') return 'Ditolak';
  return 'Menunggu Review';
}

function parseBusinesses(raw: any): Array<{ name: string; location: string; priceRange: string }> {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { const p = JSON.parse(String(raw)); return Array.isArray(p) ? p : []; } catch { return []; }
}

export default function COClusterListPage() {
  const router = useRouter();
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<ProposalSummary | null>(null);

  useEffect(() => {
    fetch('/api/co/clusters/list')
      .then(r => r.json())
      .then(data => { setClusters(data.clusters || []); setProposals(data.proposals || []); })
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
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>Cluster Saya</div>
          <div style={{ fontSize: 13, color: T.g500, marginTop: 2 }}>{clusters.length} active · {proposals.length} pending proposal</div>
        </div>
        <Button icon={<Plus size={16} color={T.c50} />} onClick={() => router.push('/co/clusters/create')}>Buat Cluster Baru</Button>
      </div>

      {/* Active Clusters */}
      {clusters.length === 0 ? (
        <div style={{ background: T.c50, border: `1px dashed ${T.c200}`, borderRadius: 16, padding: '48px 24px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MapPin size={24} color={T.p600} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum ada cluster</div>
          <div style={{ fontSize: 13, color: T.g500, maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
            Kamu belum memiliki cluster aktif. Ajukan proposal cluster pertama kamu untuk mulai mengumpulkan data dan menghasilkan pendapatan.
          </div>
          <Button icon={<Plus size={16} color={T.c50} />} onClick={() => router.push('/co/clusters/create')}>Ajukan Cluster Pertama</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 32 }}>
          {clusters.map(c => (
            <div key={c.id} onClick={() => router.push('/co/cluster')} style={{
              background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '20px',
              cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.p600; e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,122,101,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.c200; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Badge variant={c.status === 'ACTIVE' ? 'active' : 'seeding'}>{c.status === 'ACTIVE' ? 'Active' : c.status}</Badge>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.g500 }}>
                  <ShieldCheck size={12} color={T.p600} />{c.confidenceScore}/100
                </div>
              </div>
              <MapPlaceholder accent="#E6F3EF" color={T.p400} height={100} />
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: T.g500, marginBottom: 10 }}>{c.anchorLabel}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: T.g500 }}>
                  <span>{c.totalValidatedFields} field tervalidasi</span><span>·</span><span>{c.dataCompleteness}% lengkap</span><span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{timeAgo(c.updatedAt)}</span>
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
              <div key={p.id} onClick={() => setSelectedProposal(p)} style={{
                background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                cursor: 'pointer', transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.p400; e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,122,101,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.c200; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 2 }}>{p.clusterName}</div>
                  <div style={{ fontSize: 12, color: T.g500 }}>{p.anchorLabel} · {p.occupation} · {timeAgo(p.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {p.adminNote && <span style={{ fontSize: 11, color: T.warning, maxWidth: 160 }}>{p.adminNote}</span>}
                  <Badge variant={getStatusBadgeVariant(p.status)}>{getStatusLabel(p.status)}</Badge>
                  <ChevronRight size={16} color={T.g500} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Proposal Detail Slide-over Modal
          ════════════════════════════════════════════════════════ */}
      {selectedProposal && (
        <>
          {/* Backdrop */}
          <div onClick={() => setSelectedProposal(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(4px)', zIndex: 40, transition: 'opacity 200ms',
          }} />
          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 480,
            background: T.c50, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', zIndex: 50,
            overflowY: 'auto', animation: 'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}>
            <div style={{ padding: '28px 28px 40px' }}>
              {/* Panel Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {getStatusIcon(selectedProposal.status)}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>Detail Proposal</div>
                    <div style={{ marginTop: 4 }}><Badge variant={getStatusBadgeVariant(selectedProposal.status)}>{getStatusLabel(selectedProposal.status)}</Badge></div>
                  </div>
                </div>
                <button onClick={() => setSelectedProposal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }}>
                  <X size={20} color={T.g500} />
                </button>
              </div>

              {/* Admin note */}
              {selectedProposal.adminNote && (
                <div style={{ padding: '12px 16px', background: '#FEF3C7', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AlertCircle size={18} color={T.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.warning, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Catatan Admin</div>
                    <div style={{ fontSize: 13, color: T.g700 }}>{selectedProposal.adminNote}</div>
                  </div>
                </div>
              )}

              {/* Legitimasi Area */}
              <div style={{ background: T.c100, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={13} />Legitimasi Area
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { l: 'Status', v: selectedProposal.occupation },
                    { l: 'Durasi', v: DURATION_LABELS[selectedProposal.areaDuration] || selectedProposal.areaDuration },
                    { l: 'Anchor Point', v: selectedProposal.primaryAnchor },
                    { l: 'Kehadiran Fisik', v: PRESENCE_LABELS[selectedProposal.physicalPresence] || selectedProposal.physicalPresence },
                  ].map(r => (
                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 13 }}>
                      <span style={{ color: T.g500 }}>{r.l}</span>
                      <span style={{ color: T.g900, fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bisnis */}
              <div style={{ background: T.c100, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Bisnis F&B yang Dikenal</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {parseBusinesses(selectedProposal.sampleBusinesses).map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: T.p600, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ fontSize: 13, color: T.g700 }}>
                        <span style={{ fontWeight: 600, color: T.g900 }}>{b.name}</span>
                        <span style={{ color: T.g500 }}> · {b.location}</span>
                        {b.priceRange && b.priceRange !== '—' && <span style={{ color: T.g500 }}> · {b.priceRange}</span>}
                      </div>
                    </div>
                  ))}
                  {parseBusinesses(selectedProposal.sampleBusinesses).length === 0 && (
                    <div style={{ fontSize: 13, color: T.g500, fontStyle: 'italic' }}>Tidak ada data bisnis</div>
                  )}
                </div>
              </div>

              {/* Detail Cluster */}
              <div style={{ background: T.c100, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={13} />Detail Cluster
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { l: 'Nama Cluster', v: selectedProposal.clusterName },
                    { l: 'Tipe Anchor', v: ANCHOR_TYPE_LABELS[selectedProposal.anchorType] || selectedProposal.anchorType },
                    { l: 'Deskripsi', v: selectedProposal.corridorDesc },
                    { l: 'Koordinat', v: `${selectedProposal.anchorLat?.toFixed(5)}, ${selectedProposal.anchorLng?.toFixed(5)}` },
                    { l: 'Radius', v: `${selectedProposal.radiusKm} km` },
                  ].map(r => (
                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 13 }}>
                      <span style={{ color: T.g500 }}>{r.l}</span>
                      <span style={{ color: T.g900, fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedProposal.status === 'PENDING' && (
                <Button full icon={<Edit3 size={16} color={T.c50} />} onClick={() => router.push(`/co/dashboard/clusters/proposal/${selectedProposal.id}`)}>
                  Edit Proposal
                </Button>
              )}
              {selectedProposal.status === 'REJECTED' && (
                <div style={{ padding: '12px 16px', background: '#FEF3C7', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: T.g700 }}>Proposal ditolak. Kamu dapat mengajukan cluster baru dengan perbaikan sesuai catatan admin.</div>
                </div>
              )}
              {selectedProposal.status === 'APPROVED' && (
                <div style={{ padding: '12px 16px', background: T.p100, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: T.g700 }}>Proposal disetujui! Cluster kamu sedang dalam tahap persiapan data.</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
