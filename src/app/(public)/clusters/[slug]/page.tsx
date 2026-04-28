import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, MapPin, ExternalLink, Database, Activity, Navigation, Anchor } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { deriveClusterStats } from '@/lib/utils/clusterStats';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { ClusterMap } from '@/components/cluster/ClusterMap';
import { ClusterStats } from '@/components/cluster/ClusterStats';
import { ClusterCTACard } from '@/components/cluster/ClusterCTACard';

export const revalidate = 60;

async function getCluster(slug: string) {
  const cluster = await prisma.cluster.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      anchorLat: true,
      anchorLng: true,
      anchorLabel: true,
      radiusKm: true,
      confidenceScore: true,
      dataCompleteness: true,
      totalValidatedFields: true,
      status: true,
      onchainSlug: true,
      owner: {
        select: {
          coScore: true,
          nftMintAddress: true,
          user: { select: { fullName: true } },
        },
      },
      fieldValues: {
        select: {
          fieldCode: true,
          fieldName: true,
          category: true,
          status: true,
          solTxSignature: true,
          fieldHash: true,
        },
        orderBy: { fieldCode: 'asc' },
      },
    },
  });

  if (!cluster) return null;

  const keyStats = deriveClusterStats(
    cluster.fieldValues.map((f) => ({ fieldCode: f.fieldCode, value: null, status: f.status }))
  );

  return { ...cluster, keyStats };
}

export default async function ClusterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cluster = await getCluster(slug);
  if (!cluster) notFound();

  const validatedFields = cluster.fieldValues.filter((f) => f.status === 'VALIDATED');
  const onchainFields = validatedFields.filter((f) => f.solTxSignature);

  return (
    <main style={{ minHeight: '100vh', background: T.c50 }}>
      {/* Back nav */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 24px 0' }}>
        <Link
          href="/clusters"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: T.g500, textDecoration: 'none', fontWeight: 600,
          }}
        >
          <ArrowLeft size={14} />
          Semua Cluster
        </Link>
      </div>

      {/* Hero header */}
      <section style={{
        background: `linear-gradient(160deg, ${T.p600} 0%, ${T.p500} 100%)`,
        padding: '32px 24px 36px',
        marginTop: 16,
        color: '#fff',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8, fontSize: 12, marginBottom: 8 }}>
                <MapPin size={12} />
                <span>{cluster.anchorLabel}</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                {cluster.name}
              </h1>
              {cluster.description && (
                <p style={{ margin: '10px 0 0', opacity: 0.85, fontSize: 14, maxWidth: 520, lineHeight: 1.6 }}>
                  {cluster.description}
                </p>
              )}
            </div>
            <Badge variant={cluster.status === 'ACTIVE' ? 'active' : 'seeding'} style={{ flexShrink: 0, marginTop: 4 }}>
              {cluster.status === 'ACTIVE' ? 'Aktif' : 'Sedang Dikumpulkan'}
            </Badge>
          </div>

          {/* CO proof strip */}
          {cluster.owner && (
            <div style={{
              marginTop: 20,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '10px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
            }}>
              <ShieldCheck size={14} />
              <span>CO: <strong>{cluster.owner.user?.fullName ?? 'LOKAL Admin'}</strong></span>
              {cluster.owner.nftMintAddress && (
                <span style={{ opacity: 0.75 }}>· Soulbound NFT terverifikasi</span>
              )}
              <span style={{ opacity: 0.75 }}>· CO Score {cluster.owner.coScore}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Map */}
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' }}>
              <ClusterMap
                anchorLat={cluster.anchorLat}
                anchorLng={cluster.anchorLng}
                anchorLabel={cluster.anchorLabel}
                radiusKm={cluster.radiusKm}
                height={340}
                showControls={true}
              />
              <div style={{
                padding: '12px 16px',
                borderTop: `1px solid ${T.c200}`,
                display: 'flex',
                gap: 16,
                fontSize: 12,
                color: T.g500,
              }}>
                <span>📍 {cluster.anchorLabel}</span>
                <span>⌀ {cluster.radiusKm}km radius</span>
                <span>{cluster.totalValidatedFields}/20 fields tervalidasi</span>
              </div>
            </div>

            {/* Market Intelligence cards */}
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.c200}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Market Intelligence</div>
                <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>Data ringkas koridor {cluster.anchorLabel}</div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                background: T.c200,
              }}>
                <StatCard
                  icon={<Activity size={16} color={T.p600} />}
                  label="Kelengkapan Data"
                  value={`${cluster.dataCompleteness}%`}
                  highlight={cluster.dataCompleteness >= 70}
                />
                <StatCard
                  icon={<Database size={16} color={T.p600} />}
                  label="Field Tervalidasi"
                  value={`${cluster.totalValidatedFields}/20`}
                  highlight={cluster.totalValidatedFields >= 15}
                />
                <StatCard
                  icon={<Navigation size={16} color={T.p600} />}
                  label="Radius Catchment"
                  value={`${cluster.radiusKm} km`}
                />
                <StatCard
                  icon={<MapPin size={16} color={T.p600} />}
                  label="Anchor Point"
                  value={cluster.anchorLabel ?? '—'}
                  small
                />
                <StatCard
                  icon={<ShieldCheck size={16} color={T.p600} />}
                  label="CO Score"
                  value={cluster.owner?.coScore != null ? `${cluster.owner.coScore}/100` : '—'}
                />
                <StatCard
                  icon={<Anchor size={16} color={T.p600} />}
                  label="On-chain Fields"
                  value={`${onchainFields.length} dianchor`}
                  highlight={onchainFields.length > 0}
                />
              </div>
            </div>

            {/* On-chain proof section */}
            {onchainFields.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={15} color={T.p600} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Bukti On-Chain</div>
                    <div style={{ fontSize: 12, color: T.g500, marginTop: 1 }}>
                      {onchainFields.length} field hash dianchor ke Solana devnet via program <code style={{ fontSize: 11 }}>lokal_core</code>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {onchainFields.map((f) => (
                    <a
                      key={f.fieldCode}
                      href={`https://explorer.solana.com/tx/${f.solTxSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: T.c50,
                        borderRadius: 8,
                        fontSize: 12,
                        textDecoration: 'none',
                        color: T.g900,
                        border: `1px solid ${T.c200}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontFamily: 'monospace',
                          color: T.p600,
                          fontWeight: 700,
                          background: T.p100,
                          padding: '2px 7px',
                          borderRadius: 4,
                          fontSize: 11,
                        }}>{f.fieldCode}</span>
                        <span style={{ color: T.g500 }}>
                          {f.solTxSignature?.slice(0, 16)}…
                        </span>
                      </div>
                      <ExternalLink size={12} color={T.g500} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right col: stats + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Data completeness */}
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, padding: '20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginBottom: 16 }}>Kelengkapan Data</div>
              <ClusterStats
                confidenceScore={cluster.confidenceScore}
                dataCompleteness={cluster.dataCompleteness}
                totalValidatedFields={cluster.totalValidatedFields}
              />
            </div>

            {/* On-chain proof sidebar (small summary) */}
            {onchainFields.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.c200}`, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <ShieldCheck size={15} color={T.p600} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.g900 }}>Verified On-Chain</div>
                </div>
                <div style={{ fontSize: 12, color: T.g500, lineHeight: 1.6, marginBottom: 10 }}>
                  {onchainFields.length} field hash dianchor ke Solana devnet.
                </div>
                {onchainFields.slice(0, 3).map((f) => (
                  <a
                    key={f.fieldCode}
                    href={`https://explorer.solana.com/tx/${f.solTxSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', background: T.c50, borderRadius: 8,
                      fontSize: 12, textDecoration: 'none', color: T.g900,
                      marginBottom: 4, border: `1px solid ${T.c200}`,
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', color: T.p600, fontWeight: 700 }}>{f.fieldCode}</span>
                    <ExternalLink size={11} color={T.g500} />
                  </a>
                ))}
              </div>
            )}

            {/* CTA card */}
            <ClusterCTACard
              clusterId={cluster.id}
              clusterName={cluster.name}
              clusterSlug={cluster.slug}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
  small = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div style={{
      background: '#fff',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {icon}
        <span style={{ fontSize: 11, color: T.g500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: small ? 13 : 18,
        fontWeight: 800,
        color: highlight ? T.p600 : T.g900,
        lineHeight: 1.2,
      }}>
        {value}
      </div>
    </div>
  );
}
