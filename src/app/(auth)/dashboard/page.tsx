import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { CreditCard, FileText, MapPin, Star } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default async function BOOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { sessions: { include: { cluster: true, conceptForm: true } } }
  });

  if (!dbUser) return null;

  const totalSessions = dbUser.sessions.length;
  const activeClusters = new Set(dbUser.sessions.map(s => s.clusterId)).size;
  // Mock average score for now, or calculate if we implement CO feedback
  const avgScore = totalSessions > 0 ? 85 : 0; 
  
  const stats = [
    { icon: <CreditCard size={18} color={T.p600} />, label: 'Kredit Tersisa', value: dbUser.credits.toString(), sub: dbUser.isSubs ? dbUser.subsType : 'Pay-per-use', trend: null },
    { icon: <FileText size={18} color={T.p600} />, label: 'Total Sesi', value: totalSessions.toString(), sub: 'sesi total', trend: null },
    { icon: <MapPin size={18} color={T.p600} />, label: 'Cluster Aktif', value: activeClusters.toString(), sub: 'cluster dianalisis', trend: totalSessions > 0 ? 12 : null },
    { icon: <Star size={18} color={T.warning} />, label: 'Rata-rata Skor', value: avgScore.toString(), sub: 'skor kepercayaan', trend: null, color: T.warning },
  ];

  const recentSessions = dbUser.sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}>
      {/* Greeting */}
      <div className="animate-slide-in-right" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
          Selamat datang, {dbUser.fullName.split(' ')[0]} 👋
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          Berikut ringkasan aktivitas kamu di LOKAL.
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32, marginTop: 24 }}>
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} sub={s.sub} trend={s.trend} color={(s as any).color} />
        ))}
      </div>

      {/* Recent simulations */}
      <div className="animate-fade-in-up delay-200" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Simulasi Terbaru</div>
        
        {recentSessions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: T.c50, border: `1px dashed ${T.c200}`, borderRadius: 16, color: T.g500, fontSize: 14 }}>
            Belum ada sesi simulasi.
          </div>
        ) : (
          <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.c200}` }}>
                  {['Cluster', 'Konsep', 'Tanggal', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => {
                  const isActive = s.status === 'ACTIVE' && s.expiresAt && s.expiresAt > new Date();
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#FDFBF7] hover:-translate-y-[1px] transition-all duration-200"
                      style={{ borderBottom: i < recentSessions.length - 1 ? `1px solid ${T.c200}` : 'none' }}
                    >
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: T.g900 }}>{s.cluster.name}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: T.g700 }}>{s.conceptForm?.conceptName || 'Draft'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: T.g500 }}>{s.createdAt.toLocaleDateString('id-ID')}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <Badge variant={isActive ? 'active' : 'neutral'}>{isActive ? 'Aktif' : 'Selesai'}</Badge>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link href={`/session/${s.id}`} style={{
                          background: T.p100, border: 'none', borderRadius: 8, padding: '6px 12px',
                          fontSize: 12, fontWeight: 600, color: T.p600, cursor: 'pointer',
                          textDecoration: 'none', display: 'inline-block',
                        }}>Lihat</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick action banner */}
      <div className="animate-scale-in delay-300" style={{ background: T.p100, borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.p600, marginBottom: 6 }}>Siap validasi konsep baru?</div>
          <div style={{ fontSize: 13, color: T.p500 }}>Jelajahi cluster aktif dan mulai simulasi AI sekarang.</div>
        </div>
        <Link href="/dashboard/clusters" style={{ flexShrink: 0, textDecoration: 'none' }}>
          <Button icon={<MapPin size={16} color={T.c50} />}>
            Jelajahi Cluster
          </Button>
        </Link>
      </div>
    </div>
  );
}
