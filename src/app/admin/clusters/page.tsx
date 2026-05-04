'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  MapPin,
  Plus,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2,
  FileText,
  User,
  Clock,
  Check,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { CreateClusterModal } from '@/components/admin/CreateClusterModal';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ClusterOwner {
  id: string;
  user: { fullName: string; email: string };
}

interface ClusterRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  anchorLabel: string;
  status: 'SEEDING' | 'ACTIVE' | 'DEPRECATED';
  dataCompleteness: number;
  confidenceScore: number;
  totalValidatedFields: number;
  onchainSlug: string | null;
  createdAt: string;
  owner: { user: { fullName: string; email: string } } | null;
  _count: { fieldValues: number };
}

interface ProposalRecord {
  id: string;
  coId: string;
  clusterName: string;
  clusterDescription: string | null;
  anchorType: string;
  corridorDesc: string;
  anchorLat: number;
  anchorLng: number;
  anchorLabel: string;
  radiusKm: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: string;
  clusterOwner: {
    id: string;
    user: { fullName: string; email: string };
  } | null;
}

interface BannerState {
  type: 'success' | 'error';
  message: string;
}

type TabId = 'clusters' | 'proposals';

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function AdminClustersPage() {
  const [activeTab, setActiveTab] = useState<TabId>('clusters');

  // Clusters state
  const [clusters, setClusters] = useState<ClusterRecord[]>([]);
  const [owners, setOwners] = useState<ClusterOwner[]>([]);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [clustersError, setClustersError] = useState<string | null>(null);

  // Proposals state
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [proposalsError, setProposalsError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Shared UI state
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Proposal action state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actingProposal, setActingProposal] = useState<ProposalRecord | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Proposal detail view
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProposal, setDetailProposal] = useState<ProposalRecord | null>(null);

  /* ── Fetchers ─────────────────────────────────────────────────────────── */

  const fetchClusters = useCallback(async () => {
    setClustersLoading(true);
    setClustersError(null);
    try {
      const res = await fetch('/api/admin/clusters');
      if (!res.ok) throw new Error('Gagal memuat cluster');
      const data = await res.json();
      setClusters(data.clusters || []);
      setOwners(data.owners || []);
    } catch (e: any) {
      setClustersError(e.message || 'Terjadi kesalahan');
    } finally {
      setClustersLoading(false);
    }
  }, []);

  const fetchProposals = useCallback(async () => {
    setProposalsLoading(true);
    setProposalsError(null);
    try {
      const res = await fetch('/api/admin/proposals');
      if (!res.ok) throw new Error('Gagal memuat proposal');
      const data = await res.json();
      setProposals(data.proposals || []);
      setPendingCount(data.proposals?.filter((p: ProposalRecord) => p.status === 'PENDING').length || 0);
    } catch (e: any) {
      setProposalsError(e.message || 'Terjadi kesalahan');
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClusters();
    fetchProposals();
  }, [fetchClusters, fetchProposals]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

  /* ── Actions ──────────────────────────────────────────────────────────── */

  async function handleCreateCluster(body: Record<string, any>) {
    try {
      const res = await fetch('/api/admin/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat cluster');
      setBanner({ type: 'success', message: `Cluster "${data.cluster.name}" berhasil dibuat!` });
      setModalOpen(false);
      fetchClusters();
    } catch (e: any) {
      setBanner({ type: 'error', message: e.message || 'Gagal membuat cluster' });
    }
  }

  function openActionModal(proposal: ProposalRecord, type: 'APPROVE' | 'REJECT') {
    setActingProposal(proposal);
    setActionType(type);
    setActionModalOpen(true);
  }

  function openDetailModal(proposal: ProposalRecord) {
    setDetailProposal(proposal);
    setDetailModalOpen(true);
  }

  async function handleProposalAction(reason?: string) {
    if (!actingProposal || !actionType) return;

    if (actionType === 'REJECT' && (!reason || !reason.trim())) {
      setBanner({ type: 'error', message: 'Alasan penolakan wajib diisi.' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: actingProposal.id,
          action: actionType,
          ...(actionType === 'REJECT' ? { rejectReason: reason!.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Aksi gagal');

      const actionLabel = actionType === 'APPROVE' ? 'disetujui' : 'ditolak';
      setBanner({
        type: 'success',
        message: `Proposal "${actingProposal.clusterName}" berhasil ${actionLabel}.`,
      });
      setActionModalOpen(false);
      setActingProposal(null);
      setActionType(null);
      fetchProposals();
      if (actionType === 'APPROVE') fetchClusters();
    } catch (e: any) {
      setBanner({ type: 'error', message: e.message || 'Aksi gagal' });
    } finally {
      setActionLoading(false);
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 32px',
        animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
            Cluster Management
          </div>
          <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
            Kelola cluster dan review proposal dari Cluster Owner.
          </div>
        </div>
        {activeTab === 'clusters' && (
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 20px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: T.p600,
              color: T.c50,
              transition: 'all 150ms',
              boxShadow: '0 2px 8px rgba(27,122,101,0.25)',
            }}
          >
            <Plus size={15} /> Buat Cluster Baru
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <TabSwitcher activeTab={activeTab} onChange={setActiveTab} pendingCount={pendingCount} />

      {/* Banner */}
      {banner && (
        <div
          style={{
            background: banner.type === 'success' ? '#ECFDF5' : '#FEE2E2',
            border: `1px solid ${banner.type === 'success' ? T.success + '30' : T.danger + '30'}`,
            borderRadius: 12,
            padding: '14px 18px',
            marginTop: 20,
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 size={18} color={T.success} />
          ) : (
            <AlertTriangle size={18} color={T.danger} />
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: T.g900, flex: 1 }}>
            {banner.message}
          </span>
          <button onClick={() => setBanner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g500 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ marginTop: 20 }}>
        {activeTab === 'clusters' ? (
          <ClustersTab
            clusters={clusters}
            loading={clustersLoading}
            error={clustersError}
            onRetry={fetchClusters}
            onCreate={() => setModalOpen(true)}
          />
        ) : (
          <ProposalsTab
            proposals={proposals}
            loading={proposalsLoading}
            error={proposalsError}
            onRetry={fetchProposals}
            onAction={openActionModal}
            onViewDetail={openDetailModal}
          />
        )}
      </div>

      {/* Create Cluster Modal */}
      <CreateClusterModal open={modalOpen} onClose={() => setModalOpen(false)} owners={owners} onSubmit={handleCreateCluster} />

      {/* Proposal Action Modal */}
      <ProposalActionModal
        open={actionModalOpen}
        onClose={() => { if (!actionLoading) { setActionModalOpen(false); setActingProposal(null); setActionType(null); }}}
        proposal={actingProposal}
        actionType={actionType}
        loading={actionLoading}
        onConfirm={handleProposalAction}
      />

      {/* Proposal Detail Modal */}
      <ProposalDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        proposal={detailProposal}
        onAction={openActionModal}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Tab Switcher
   ═══════════════════════════════════════════════════════════════════════════ */

function TabSwitcher({ activeTab, onChange, pendingCount }: { activeTab: TabId; onChange: (t: TabId) => void; pendingCount: number }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'clusters', label: 'Clusters' },
    { id: 'proposals', label: 'Proposals' },
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        background: T.c100,
        borderRadius: 12,
        padding: 4,
        gap: 4,
        border: `1px solid ${T.c200}`,
      }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: active ? 700 : 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: active ? '#fff' : 'transparent',
              color: active ? T.p600 : T.g500,
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 150ms',
            }}
          >
            {tab.label}
            {tab.id === 'proposals' && pendingCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  borderRadius: 9999,
                  background: '#E5493A',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '0 6px',
                  boxShadow: '0 2px 6px rgba(229,73,58,0.35)',
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Clusters Tab
   ═══════════════════════════════════════════════════════════════════════════ */

function ClustersTab({
  clusters,
  loading,
  error,
  onRetry,
  onCreate,
}: {
  clusters: ClusterRecord[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
}) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#FEE2E2', border: `1px solid ${T.danger}30`, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={18} color={T.danger} />
        <span style={{ fontSize: 14, color: T.danger }}>{error}</span>
        <button onClick={onRetry} style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: T.p600, background: 'none', border: 'none', cursor: 'pointer' }}>
          Coba lagi
        </button>
      </div>
    );
  }

  if (clusters.length === 0) {
    return <EmptyStateClusters onCreate={onCreate} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {clusters.map((cluster) => (
        <ClusterCard key={cluster.id} cluster={cluster} />
      ))}
    </div>
  );
}

function ClusterCard({ cluster }: { cluster: ClusterRecord }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`/admin/clusters/${cluster.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: T.c50,
        border: `1px solid ${T.c200}`,
        borderRadius: 16,
        padding: '20px 24px',
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(26,26,26,0.08)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={20} color={T.p600} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
              {cluster.name}
            </div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono), monospace' }}>{cluster.slug}</span>
              <span>·</span>
              <span>{cluster.anchorLabel}</span>
              {cluster.onchainSlug && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: T.p600, fontWeight: 600 }}>
                  <CheckCircle2 size={10} /> On-chain
                </span>
              )}
            </div>
          </div>
        </div>
        <Badge variant={cluster.status === 'ACTIVE' ? 'active' : 'seeding'}>{cluster.status}</Badge>
      </div>

      <ProgressBar
        value={cluster.totalValidatedFields}
        max={20}
        label="Progress Tier 1"
        color={cluster.dataCompleteness >= 80 ? T.success : cluster.dataCompleteness >= 50 ? T.warning : T.danger}
      />

      <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
        <StatItem label="Data Completeness" value={`${cluster.dataCompleteness}%`} color={T.g900} />
        <StatItem label="Confidence Score" value={`${cluster.confidenceScore}/100`} color={cluster.confidenceScore >= 65 ? T.success : T.warning} />
        <StatItem label="Fields" value={`${cluster.totalValidatedFields}/20`} color={T.g700} />
        <StatItem label="Owner" value={cluster.owner?.user.fullName ?? '—'} color={T.g500} />
      </div>
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Proposals Tab
   ═══════════════════════════════════════════════════════════════════════════ */

function ProposalsTab({
  proposals,
  loading,
  error,
  onRetry,
  onAction,
  onViewDetail,
}: {
  proposals: ProposalRecord[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAction: (p: ProposalRecord, type: 'APPROVE' | 'REJECT') => void;
  onViewDetail: (p: ProposalRecord) => void;
}) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#FEE2E2', border: `1px solid ${T.danger}30`, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={18} color={T.danger} />
        <span style={{ fontSize: 14, color: T.danger }}>{error}</span>
        <button onClick={onRetry} style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: T.p600, background: 'none', border: 'none', cursor: 'pointer' }}>
          Coba lagi
        </button>
      </div>
    );
  }

  const pending = proposals.filter((p) => p.status === 'PENDING');
  const decided = proposals.filter((p) => p.status !== 'PENDING');

  if (proposals.length === 0) {
    return (
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <FileText size={24} color={T.p600} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum ada proposal</div>
        <div style={{ fontSize: 13, color: T.g500 }}>Cluster Owner belum mengajukan proposal cluster.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Pending Proposals */}
      {pending.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.warning }} />
            Pending Review
            <span style={{ fontSize: 11, color: T.g500, fontWeight: 600 }}>({pending.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map((p) => (
              <ProposalCard key={p.id} proposal={p} onAction={onAction} onViewDetail={onViewDetail} />
            ))}
          </div>
        </div>
      )}

      {/* Decided Proposals */}
      {decided.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.g500 }} />
            Riwayat Keputusan
            <span style={{ fontSize: 11, color: T.g500, fontWeight: 600 }}>({decided.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {decided.map((p) => (
              <ProposalCard key={p.id} proposal={p} onAction={onAction} onViewDetail={onViewDetail} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProposalCard({
  proposal,
  onAction,
  onViewDetail,
}: {
  proposal: ProposalRecord;
  onAction: (p: ProposalRecord, type: 'APPROVE' | 'REJECT') => void;
  onViewDetail: (p: ProposalRecord) => void;
}) {
  const isPending = proposal.status === 'PENDING';

  return (
    <div
      onClick={() => onViewDetail(proposal)}
      style={{
        background: T.c50,
        border: `1px solid ${T.c200}`,
        borderRadius: 16,
        padding: '20px 24px',
        transition: 'all 150ms',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.p400; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.c200; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={18} color={T.p600} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>{proposal.clusterName}</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <User size={11} /> {proposal.clusterOwner?.user.fullName ?? '—'}
              </span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {new Date(proposal.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </div>
        <Badge
          variant={
            proposal.status === 'APPROVED'
              ? 'success'
              : proposal.status === 'REJECTED'
                ? 'danger'
                : 'warn'
          }
        >
          {proposal.status}
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
        <DetailItem label="Anchor Type" value={proposal.anchorType} />
        <DetailItem label="Corridor" value={proposal.corridorDesc} />
        <DetailItem label="Koordinat" value={`${proposal.anchorLat.toFixed(4)}, ${proposal.anchorLng.toFixed(4)}`} />
      </div>

      {proposal.clusterDescription && (
        <div style={{ fontSize: 12, color: T.g700, lineHeight: 1.5, marginBottom: 14, padding: '10px 14px', background: T.c100, borderRadius: 10 }}>
          {proposal.clusterDescription}
        </div>
      )}

      {proposal.adminNote && (
        <div style={{ fontSize: 12, color: T.g500, marginBottom: 14, fontStyle: 'italic' }}>
          Catatan admin: {proposal.adminNote}
        </div>
      )}

      {isPending && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(proposal, 'APPROVE'); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: T.success,
              color: T.c50,
              transition: 'all 150ms',
            }}
          >
            <Check size={13} /> Setuju & Buat Cluster
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(proposal, 'REJECT'); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 9999,
              border: `1.5px solid ${T.danger}`,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: 'transparent',
              color: T.danger,
              transition: 'all 150ms',
            }}
          >
            <X size={13} /> Tolak
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Proposal Action Modal
   ═══════════════════════════════════════════════════════════════════════════ */

function ProposalActionModal({
  open,
  onClose,
  proposal,
  actionType,
  loading,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  proposal: ProposalRecord | null;
  actionType: 'APPROVE' | 'REJECT' | null;
  loading: boolean;
  onConfirm: (reason?: string) => void;
}) {
  const isReject = actionType === 'REJECT';
  const [localReason, setLocalReason] = useState('');

  // Reset local reason when modal opens
  useEffect(() => {
    if (open) setLocalReason('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isReject ? `Tolak Proposal — ${proposal?.clusterName ?? ''}` : `Setujui Proposal — ${proposal?.clusterName ?? ''}`}
      maxWidth={480}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isReject ? (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 5 }}>
              Alasan Penolakan <span style={{ color: T.danger }}>*</span>
            </label>
            <RejectTextarea value={localReason} onChange={setLocalReason} />
            <div style={{ fontSize: 11, color: T.g500, marginTop: 4 }}>
              Alasan ini akan diberitahukan ke Cluster Owner.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: T.g700, lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>
              Setujui proposal <strong>{proposal?.clusterName}</strong> dari{' '}
              <strong>{proposal?.clusterOwner?.user.fullName}</strong>?
            </p>
            <p style={{ margin: '10px 0 0' }}>
              Cluster akan otomatis dibuat dari data proposal ini. CO akan langsung
              ditugaskan sebagai owner cluster.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: 9999,
              border: `1.5px solid ${T.c200}`,
              background: 'transparent',
              color: T.g700,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(isReject ? localReason : undefined)}
            disabled={loading || (isReject && !localReason.trim())}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 22px',
              borderRadius: 9999,
              border: 'none',
              background: isReject ? T.danger : T.success,
              color: T.c50,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading || (isReject && !localReason.trim()) ? 'not-allowed' : 'pointer',
              opacity: loading || (isReject && !localReason.trim()) ? 0.6 : 1,
              transition: 'all 150ms',
            }}
          >
            {loading ? (
              <><Loader2 size={14} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
            ) : isReject ? (
              <><X size={14} />Tolak Proposal</>
            ) : (
              <><Check size={14} />Setuju & Buat</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Proposal Detail Modal
   ═══════════════════════════════════════════════════════════════════════════ */

function ProposalDetailModal({
  open,
  onClose,
  proposal,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  proposal: ProposalRecord | null;
  onAction: (p: ProposalRecord, type: 'APPROVE' | 'REJECT') => void;
}) {
  if (!proposal) return null;
  const isPending = proposal.status === 'PENDING';

  return (
    <Modal open={open} onClose={onClose} title={`Detail Proposal — ${proposal.clusterName}`} maxWidth={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* CO Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: T.c100, borderRadius: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color={T.p600} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{proposal.clusterOwner?.user.fullName ?? '—'}</div>
            <div style={{ fontSize: 12, color: T.g500 }}>{proposal.clusterOwner?.user.email ?? '—'}</div>
          </div>
          <Badge
            variant={proposal.status === 'APPROVED' ? 'success' : proposal.status === 'REJECTED' ? 'danger' : 'warn'}
            style={{ marginLeft: 'auto' }}
          >
            {proposal.status}
          </Badge>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <DetailItem label="Nama Cluster" value={proposal.clusterName} />
          <DetailItem label="Anchor Type" value={proposal.anchorType} />
          <DetailItem label="Corridor" value={proposal.corridorDesc} />
          <DetailItem label="Radius" value={`${proposal.radiusKm} km`} />
          <DetailItem label="Latitude" value={proposal.anchorLat.toFixed(6)} />
          <DetailItem label="Longitude" value={proposal.anchorLng.toFixed(6)} />
          <DetailItem label="Anchor Label" value={proposal.anchorLabel} />
          <DetailItem label="Diajukan" value={new Date(proposal.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </div>

        {proposal.clusterDescription && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Deskripsi Cluster</div>
            <div style={{ fontSize: 13, color: T.g700, lineHeight: 1.6, padding: '12px 14px', background: T.c100, borderRadius: 10 }}>
              {proposal.clusterDescription}
            </div>
          </div>
        )}

        {proposal.adminNote && (
          <div style={{ padding: '12px 14px', background: '#FEE2E2', borderRadius: 10, border: `1px solid ${T.danger}30` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, marginBottom: 4 }}>Catatan Admin</div>
            <div style={{ fontSize: 13, color: T.g700, lineHeight: 1.5 }}>{proposal.adminNote}</div>
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={() => { onClose(); onAction(proposal, 'APPROVE'); }}
              style={{
                flex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 9999, border: 'none',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                background: T.success, color: T.c50, transition: 'all 150ms',
              }}
            >
              <Check size={14} /> Setuju & Buat Cluster
            </button>
            <button
              onClick={() => { onClose(); onAction(proposal, 'REJECT'); }}
              style={{
                flex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${T.danger}`,
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                background: 'transparent', color: T.danger, transition: 'all 150ms',
              }}
            >
              <X size={14} /> Tolak Proposal
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Shared Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{value || '—'}</div>
    </div>
  );
}

function RejectTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Jelaskan mengapa proposal ini ditolak..."
      rows={4}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 10,
        border: `1.5px solid ${focused ? T.p500 : T.c200}`,
        fontFamily: 'inherit',
        fontSize: 13,
        color: T.g900,
        background: '#fff',
        outline: 'none',
        resize: 'vertical',
        lineHeight: 1.5,
        boxShadow: focused ? `0 0 0 3px ${T.p100}` : 'none',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function EmptyStateClusters({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <MapPin size={24} color={T.p600} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum ada cluster</div>
      <div style={{ fontSize: 13, color: T.g500, maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
        Buat cluster pertama untuk mulai mengumpulkan data lapangan.
      </div>
      <button
        onClick={onCreate}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '10px 20px', borderRadius: 9999, border: 'none',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer', background: T.p600, color: T.c50,
        }}
      >
        <Plus size={15} /> Buat Cluster
      </button>
    </div>
  );
}
