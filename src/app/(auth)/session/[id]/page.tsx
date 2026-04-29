'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BOReport } from '@/components/session/BOReport';

interface SessionData {
  id: string;
  clusterId: string;
  userId: string;
  status: string;
  expiresAt: string | null;
  conceptForm?: {
    conceptName?: string;
    fbSubcategory?: string;
    menuItems?: Array<{ name: string; price: number }>;
  };
  cluster: { id: string; name: string };
  report?: {
    status: string;
    sections?: Record<string, any>;
    errorMessage?: string;
  };
}

interface ClusterData {
  id: string;
  name: string;
  slug: string;
  keyStats: any;
  [key: string]: any;
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<SessionData | null>(null);
  const [cluster, setCluster] = useState<ClusterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    Promise.all([fetch(`/api/sessions/${sessionId}`).then(r => r.json()), fetch('/api/clusters').then(r => r.json())])
      .then(([sessionData, clustersData]) => {
        setSession(sessionData);
        setIsExpired(!sessionData.expiresAt || new Date(sessionData.expiresAt) < new Date());

        const matchingCluster = (clustersData || []).find((c: any) => c.id === sessionData.clusterId);
        setCluster(matchingCluster);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', fontSize: 14, color: '#999' }}>Memuat laporan...</div>;
  }

  if (!session || !cluster) {
    return <div style={{ padding: 40, textAlign: 'center', fontSize: 14, color: '#999' }}>Sesi tidak ditemukan</div>;
  }

  return (
    <BOReport
      cluster={cluster}
      sessionId={sessionId}
      onBack={() => router.push('/dashboard/history')}
      onStartConsultation={() => router.push(`/session/${sessionId}/chat`)}
      onViewHistory={() => router.push(`/session/${sessionId}/chat`)}
      initialSession={session}
      onSessionLoaded={setSession}
      isExpired={isExpired}
    />
  );
}
