import { Suspense } from 'react';
import { MapPin, Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { deriveClusterStats } from '@/lib/utils/clusterStats';
import { T } from '@/lib/constants/mock-data';
import { ClusterCard } from '@/components/cluster/ClusterCard';
import { ClustersMapInteractive } from '@/components/cluster/ClustersMapInteractive';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const revalidate = 60;

async function getClusters() {
  const clusters = await prisma.cluster.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      anchorLat: true,
      anchorLng: true,
      anchorLabel: true,
      confidenceScore: true,
      dataCompleteness: true,
      totalValidatedFields: true,
      status: true,
      fieldValues: {
        where: { status: 'VALIDATED' },
        select: { fieldCode: true, value: true, status: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return clusters.map(({ fieldValues, ...rest }) => ({
    ...rest,
    keyStats: deriveClusterStats(fieldValues),
  }));
}

export default async function ClustersPage() {
  const clusters = await getClusters();

  const mapClusters = clusters
    .filter((c) => c.anchorLat != null && c.anchorLng != null)
    .map((c) => ({
      anchorLat: c.anchorLat!,
      anchorLng: c.anchorLng!,
      anchorLabel: c.anchorLabel ?? c.name,
      slug: c.slug,
      name: c.name,
      confidenceScore: c.confidenceScore,
      status: c.status,
    }));

  const avgConfidence = clusters.length > 0
    ? Math.round(clusters.reduce((s, c) => s + c.confidenceScore, 0) / clusters.length)
    : 0;

  const totalValidated = clusters.reduce((s, c) => s + c.totalValidatedFields, 0);

  return (
    <main style={{ minHeight: '100vh', background: T.c50 }}>
      {/* Page header */}
      <section style={{
        background: `linear-gradient(160deg, ${T.p600} 0%, ${T.p500} 100%)`,
        padding: '52px 24px 44px',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8, fontSize: 13, marginBottom: 10 }}>
            <MapPin size={14} />
            <span>Cluster Browser</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
            Jelajahi Cluster F&amp;B
          </h1>
          <p style={{ margin: '10px 0 0', opacity: 0.85, fontSize: 15, maxWidth: 540, lineHeight: 1.6 }}>
            Setiap cluster mewakili koridor hiperlokal 1.5km dengan data pasar terverifikasi
            dari Cluster Owner di lapangan.
          </p>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
            <StatChip value={clusters.length} label="Cluster Aktif" />
            <StatChip value={totalValidated} label="Field Tervalidasi" />
            <StatChip value={`${avgConfidence}%`} label="Rata-rata Confidence" />
          </div>
        </div>
      </section>

      {/* Map section */}
      {mapClusters.length > 0 && (
        <section style={{ maxWidth: 1100, margin: '32px auto 0', padding: '0 24px' }}>
          <Suspense fallback={
            <div style={{
              height: 420,
              background: '#fff',
              borderRadius: 16,
              border: `1px solid ${T.c200}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LoadingSpinner size="md" />
            </div>
          }>
            <ClustersMapInteractive clusters={mapClusters} />
          </Suspense>
        </section>
      )}

      {/* Cluster grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' }}>
        {clusters.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, color: T.g500 }}>
                <strong style={{ color: T.g900 }}>{clusters.length}</strong> cluster ditemukan
              </div>
            </div>
            <Suspense fallback={<LoadingSpinner size="md" />}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 20,
              }}>
                {clusters.map((cluster) => (
                  <ClusterCard key={cluster.id} cluster={cluster} />
                ))}
              </div>
            </Suspense>
          </>
        )}
      </section>
    </main>
  );
}

function StatChip({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      borderRadius: 10,
      padding: '10px 18px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>{label}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 24px',
      background: '#fff',
      borderRadius: 16,
      border: `1px solid ${T.c200}`,
    }}>
      <Search size={40} color={T.g500} style={{ margin: '0 auto 16px' }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>Belum ada cluster aktif</div>
      <div style={{ fontSize: 14, color: T.g500, marginTop: 8 }}>
        Cluster sedang dalam proses seeding. Pantau terus!
      </div>
    </div>
  );
}
