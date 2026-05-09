'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Users, Search, ShieldCheck, MapPin, BarChart2, X,
  Mail, Wallet, Phone, Building2, Briefcase, Calendar,
  CheckCircle2, XCircle, Clock, Crown, UserCircle,
  ExternalLink, Copy, Check, ChevronLeft, ChevronRight,
  Loader2, TrendingUp, MessageSquare, FileText,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface UserStats {
  sessions: number;
  messages: number;
}

interface ClusterOwnerInfo {
  id: string;
  coScore: number;
  trustScore: number;
  isActive: boolean;
  nftMintAddress: string | null;
  clusters: number;
  earnings: number;
}

interface UserItem {
  id: string;
  email: string;
  fullName: string;
  role: 'BUSINESS_OWNER' | 'CLUSTER_OWNER' | 'ADMIN';
  walletAddress: string | null;
  phoneNumber: string | null;
  companyName: string | null;
  jobTitle: string | null;
  kycCompleted: boolean;
  credits: number;
  isSubs: boolean;
  subsType: string;
  createdAt: string;
  updatedAt: string;
  stats: UserStats;
  clusterOwner: ClusterOwnerInfo | null;
}

interface RoleDist {
  role: string;
  count: number;
}

interface PageStats {
  total: number;
  roleDistribution: RoleDist[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════════ */

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ADMIN: { label: 'Admin', color: '#7C3AED', bg: '#EDE9FE', icon: <Crown size={14} /> },
  BUSINESS_OWNER: { label: 'Business Owner', color: T.p600, bg: T.p100, icon: <BarChart2 size={14} /> },
  CLUSTER_OWNER: { label: 'Cluster Owner', color: '#0EA5E9', bg: '#E0F2FE', icon: <MapPin size={14} /> },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<PageStats | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'BUSINESS_OWNER' | 'CLUSTER_OWNER'>('ALL');
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Lock container scroll + auto-scroll to top when detail modal opens
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (detailUser) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      el.style.overflow = 'hidden';
    } else {
      el.style.overflow = 'auto';
    }
    return () => { el.style.overflow = 'auto'; };
  }, [detailUser]);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error === 'ADMIN_REQUIRED' ? 'Akses ditolak. Hanya admin yang dapat melihat data pengguna.' : 'Gagal memuat data');
      }
      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  function copyWallet(wallet: string) {
    navigator.clipboard.writeText(wallet);
    setCopiedWallet(wallet);
    setTimeout(() => setCopiedWallet(null), 2000);
  }

  const roleCounts = useMemo(() => {
    const map: Record<string, number> = { ADMIN: 0, BUSINESS_OWNER: 0, CLUSTER_OWNER: 0 };
    stats?.roleDistribution.forEach(r => { map[r.role] = r.count; });
    return map;
  }, [stats]);

  return (
    <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
          User Management
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          Kelola dan audit semua pengguna LOKAL: Business Owner, Cluster Owner, dan Admin.
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard icon={<Users size={18} color={T.p600} />} label="Total Pengguna" value={stats.total} color={T.p600} bg={T.p100} />
          <StatCard icon={<BarChart2 size={18} color={T.p600} />} label="Business Owner" value={roleCounts.BUSINESS_OWNER} color={T.p600} bg={T.p100} />
          <StatCard icon={<MapPin size={18} color="#0EA5E9" />} label="Cluster Owner" value={roleCounts.CLUSTER_OWNER} color="#0EA5E9" bg="#E0F2FE" />
          <StatCard icon={<Crown size={18} color="#7C3AED" />} label="Admin" value={roleCounts.ADMIN} color="#7C3AED" bg="#EDE9FE" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={14} color={T.g500} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau wallet..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: `1.5px solid ${T.c200}`,
              fontFamily: 'inherit', fontSize: 13, color: T.g900, background: '#fff', outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', background: T.c100, borderRadius: 10, padding: 3, gap: 3, border: `1px solid ${T.c200}` }}>
          {(['ALL', 'BUSINESS_OWNER', 'CLUSTER_OWNER', 'ADMIN'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: roleFilter === r ? 700 : 600,
                cursor: 'pointer', background: roleFilter === r ? '#fff' : 'transparent', color: roleFilter === r ? T.p600 : T.g500,
                boxShadow: roleFilter === r ? '0 1px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 150ms',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              {r === 'ALL' ? 'Semua' : ROLE_LABELS[r]?.label || r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color={T.p600} />
            Daftar Pengguna
            <span style={{ fontSize: 12, color: T.g500, fontWeight: 600 }}>({pagination.total})</span>
          </div>
          <div style={{ fontSize: 12, color: T.g500 }}>
            Halaman {pagination.page} dari {pagination.totalPages}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <XCircle size={28} color={T.danger} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Gagal Memuat Data</div>
            <div style={{ fontSize: 13, color: T.g500, marginBottom: 20 }}>{error}</div>
            <button
              onClick={() => fetchData(pagination.page)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 9999, border: 'none',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: T.c50, background: T.p600,
                cursor: 'pointer',
              }}
            >
              <Loader2 size={14} /> Coba Lagi
            </button>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={28} color={T.p600} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Belum Ada Pengguna</div>
            <div style={{ fontSize: 13, color: T.g500 }}>Tidak ada pengguna yang cocok dengan filter saat ini.</div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '280px 140px 120px 140px 100px 120px',
              gap: 12, padding: '12px 20px', background: T.c100, borderBottom: `1px solid ${T.c200}`,
              alignItems: 'center',
            }}>
              {['Pengguna', 'Role', 'Wallet', 'Kontak', 'Aktivitas', 'Bergabung'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
              ))}
            </div>

            {/* Table Body */}
            {users.map((user, idx) => {
              const roleInfo = ROLE_LABELS[user.role];
              return (
                <div
                  key={user.id}
                  onClick={() => setDetailUser(user)}
                  style={{
                    display: 'grid', gridTemplateColumns: '280px 140px 120px 140px 100px 120px', gap: 12,
                    padding: '14px 20px', alignItems: 'center',
                    borderBottom: idx < users.length - 1 ? `1px solid ${T.c200}` : 'none',
                    background: idx % 2 === 0 ? 'transparent' : T.c100,
                    cursor: 'pointer', transition: 'background 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.p100; }}
                  onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : T.c100; }}
                >
                  {/* User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: roleInfo?.bg || T.c100,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {roleInfo?.icon || <UserCircle size={16} color={T.g500} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.fullName}
                      </div>
                      <div style={{ fontSize: 11, color: T.g500, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Mail size={10} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                      background: roleInfo?.bg || T.c100, color: roleInfo?.color || T.g500,
                    }}>
                      {roleInfo?.icon}
                      {roleInfo?.label || user.role}
                    </span>
                  </div>

                  {/* Wallet */}
                  <div>
                    {user.walletAddress ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono), monospace', color: T.g700 }}>
                          {truncateWallet(user.walletAddress)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyWallet(user.walletAddress!); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.g500 }}
                        >
                          {copiedWallet === user.walletAddress ? <Check size={12} color={T.success} /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: T.g500 }}>Tidak ada</span>
                    )}
                  </div>

                  {/* Contact */}
                  <div>
                    {user.phoneNumber ? (
                      <div style={{ fontSize: 12, color: T.g700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={11} color={T.g500} />
                        {user.phoneNumber}
                      </div>
                    ) : user.companyName ? (
                      <div style={{ fontSize: 12, color: T.g700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={11} color={T.g500} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.companyName}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: T.g500 }}>Tidak ada</span>
                    )}
                  </div>

                  {/* Activity */}
                  <div style={{ fontSize: 12, color: T.g700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={11} color={T.g500} />
                      {user.stats.sessions} sesi
                    </div>
                  </div>

                  {/* Joined */}
                  <div style={{ fontSize: 11, color: T.g500 }}>
                    {new Date(user.createdAt).toLocaleDateString('id', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: `1px solid ${T.c200}` }}>
            <button
              onClick={() => fetchData(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              style={{
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.c200}`, background: '#fff',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.g700,
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <span style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: T.g900 }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchData(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              style={{
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.c200}`, background: '#fff',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: T.g700,
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
              }}
            >
              Berikutnya <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onCopy={copyWallet}
          copiedWallet={copiedWallet}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <div style={{ padding: '18px 16px', borderRadius: 14, background: bg, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value.toLocaleString('id')}</div>
    </div>
  );
}

function truncateWallet(wallet: string) {
  return `${wallet.slice(0, 5)}...${wallet.slice(-4)}`;
}

function UserDetailModal({ user, onClose, onCopy, copiedWallet }: { user: UserItem; onClose: () => void; onCopy: (w: string) => void; copiedWallet: string | null }) {
  const roleInfo = ROLE_LABELS[user.role];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.c50, borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: `1px solid ${T.c200}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.c200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: roleInfo?.bg || T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {roleInfo?.icon || <UserCircle size={22} color={T.g500} />}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>{user.fullName}</div>
              <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g500, padding: 4 }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Role & Status */}
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
              background: roleInfo?.bg || T.c100, color: roleInfo?.color || T.g500,
            }}>
              {roleInfo?.icon}
              {roleInfo?.label || user.role}
            </span>
            {user.kycCompleted && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#D1FAE5', color: T.success }}>
                <ShieldCheck size={12} /> KYC Lengkap
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <InfoItem icon={<Mail size={13} color={T.g500} />} label="Email" value={user.email} />
            <InfoItem icon={<Phone size={13} color={T.g500} />} label="Telepon" value={user.phoneNumber || 'Tidak ada'} />
            <InfoItem icon={<Building2 size={13} color={T.g500} />} label="Perusahaan" value={user.companyName || 'Tidak ada'} />
            <InfoItem icon={<Briefcase size={13} color={T.g500} />} label="Pekerjaan" value={user.jobTitle || 'Tidak ada'} />
            <InfoItem icon={<Calendar size={13} color={T.g500} />} label="Bergabung" value={new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <InfoItem icon={<TrendingUp size={13} color={T.g500} />} label="Kredit" value={user.credits.toLocaleString('id')} />
          </div>

          {/* Wallet */}
          {user.walletAddress && (
            <div style={{ padding: '14px 16px', background: '#fff', borderRadius: 12, border: `1.5px solid ${T.c200}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Wallet Address</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={16} color={T.p600} />
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono), monospace', color: T.g900, wordBreak: 'break-all', flex: 1 }}>{user.walletAddress}</span>
                <button
                  onClick={() => onCopy(user.walletAddress!)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.g500, flexShrink: 0 }}
                >
                  {copiedWallet === user.walletAddress ? <Check size={16} color={T.success} /> : <Copy size={16} />}
                </button>
                <a href={`https://solscan.io/account/${user.walletAddress}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{ color: T.p600, padding: 4 }}>
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}

          {/* Activity Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: '14px 16px', background: '#fff', borderRadius: 12, border: `1.5px solid ${T.c200}`, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.p600 }}>{user.stats.sessions}</div>
              <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>Total Sesi</div>
            </div>
            <div style={{ padding: '14px 16px', background: '#fff', borderRadius: 12, border: `1.5px solid ${T.c200}`, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.p600 }}>{user.stats.messages}</div>
              <div style={{ fontSize: 11, color: T.g500, marginTop: 2 }}>Total Pesan</div>
            </div>
          </div>

          {/* CO Info */}
          {user.clusterOwner && (
            <div style={{ padding: '16px', background: '#E0F2FE', borderRadius: 12, border: '1.5px solid #BAE6FD' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> Info Cluster Owner
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><span style={{ fontSize: 10, color: T.g500 }}>CO Score</span><div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{user.clusterOwner.coScore}</div></div>
                <div><span style={{ fontSize: 10, color: T.g500 }}>Trust Score</span><div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{user.clusterOwner.trustScore}</div></div>
                <div><span style={{ fontSize: 10, color: T.g500 }}>Cluster</span><div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{user.clusterOwner.clusters}</div></div>
                <div><span style={{ fontSize: 10, color: T.g500 }}>Earnings</span><div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>Rp {user.clusterOwner.earnings.toLocaleString('id')}</div></div>
              </div>
              {user.clusterOwner.nftMintAddress && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #BAE6FD' }}>
                  <span style={{ fontSize: 10, color: T.g500 }}>NFT Mint</span>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono), monospace', color: T.g700, wordBreak: 'break-all' }}>{user.clusterOwner.nftMintAddress}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}
