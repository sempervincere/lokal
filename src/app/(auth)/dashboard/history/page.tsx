import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/Badge';
import { T } from '@/lib/constants/mock-data';
import Link from 'next/link';
import { ActiveTimer } from './ActiveTimer';
import { FileText, MessageCircle, Clock, MapPin, ChevronRight, Lock } from 'lucide-react';

export default async function BOHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      cluster: { select: { name: true } },
      conceptForm: { select: { conceptName: true } },
      report: { select: { status: true } },
    }
  });

  const now = new Date();
  const activeSessions = sessions.filter(s => s.status === 'ACTIVE' && s.expiresAt && s.expiresAt > now);
  const pastSessions = sessions.filter(s => !(s.status === 'ACTIVE' && s.expiresAt && s.expiresAt > now));

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: T.c50 }}>
      
      {/* ACTIVE SIMULATIONS */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.success, boxShadow: `0 0 0 4px ${T.success}30`, animation: 'pulse 2s infinite' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>Simulasi Aktif (Chat Terbuka)</div>
        </div>
        
        {activeSessions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', border: `1px dashed ${T.c200}`, borderRadius: 20, color: T.g500, fontSize: 14 }}>
            Tidak ada simulasi yang sedang berjalan. <br/>
            <Link href="/dashboard/clusters" style={{ color: T.p600, fontWeight: 600, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>Mulai Konsultasi Baru</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeSessions.map((s) => (
              <div key={s.id} style={{ 
                background: '#fff', borderRadius: 20, border: `1px solid ${T.p400}40`, padding: '24px', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: T.p600 }} />
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Badge variant="active">Active Session</Badge>
                    <span style={{ fontSize: 12, color: T.g500, fontWeight: 500 }}>{s.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 4 }}>{s.conceptForm?.conceptName || 'Draft'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.g500, fontSize: 13 }}>
                    <MapPin size={14} /> {s.cluster.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Sisa Waktu</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, justifyContent: 'flex-end' }}>
                      <Clock size={18} color="#F59E0B" />
                      <ActiveTimer expiresAt={s.expiresAt!.toISOString()} />
                    </div>
                  </div>
                  <div style={{ width: 1, height: 40, background: T.c200 }} />
                  <Link href={`/session/${s.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: T.g900, borderRadius: 12, padding: '12px 20px',
                    fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', transition: 'all 200ms',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <FileText size={16} /> Lihat Laporan & Lanjutkan Pesan <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAST SIMULATIONS */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 20, letterSpacing: '-0.01em' }}>Riwayat Simulasi</div>
        
        {pastSessions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', border: `1px dashed ${T.c200}`, borderRadius: 20, color: T.g500, fontSize: 14 }}>
            Belum ada riwayat simulasi.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pastSessions.map((s) => (
              <div key={s.id} style={{ 
                background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, padding: '20px 24px', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24
              }}>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: T.g500, fontWeight: 500 }}>{s.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>{s.conceptForm?.conceptName || 'Draft'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.g500, fontSize: 13 }}>
                    <MapPin size={14} /> {s.cluster.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#EF4444', fontWeight: 600, background: '#FEF2F2', padding: '4px 10px', borderRadius: 9999 }}>
                      <Lock size={12} /> Expired 00:00:00
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/session/${s.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${T.c200}`,
                      borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: T.g900, textDecoration: 'none'
                    }}>
                      <FileText size={15} /> Lihat Laporan & Riwayat Pesan <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
