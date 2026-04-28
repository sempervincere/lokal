'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BOConsultationChat } from '@/components/session/BOConsultationChat';

interface ClusterData {
  id: string;
  name: string;
  keyStats: any;
  [key: string]: any;
}

interface SessionData {
  id: string;
  clusterId: string;
  status: string;
  expiresAt: string | null;
  conceptForm?: any;
  cluster: { id: string; name: string };
  report?: any;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [cluster, setCluster] = useState<ClusterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<any[] | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/sessions/${sessionId}`).then(r => r.json()),
      fetch('/api/clusters').then(r => r.json()),
    ])
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
    return <div style={{ padding: 40, textAlign: 'center', fontSize: 14, color: '#999' }}>Memuat chat...</div>;
  }

  if (!session || !cluster) {
    return <div style={{ padding: 40, textAlign: 'center', fontSize: 14, color: '#999' }}>Sesi tidak ditemukan</div>;
  }

  return (
    <BOConsultationChat
      cluster={cluster}
      sessionId={sessionId}
      onBack={() => router.push(`/session/${sessionId}`)}
      expiresAt={session.expiresAt}
      initialMsgs={chatHistory}
      onMsgsChange={setChatHistory}
      isExpired={isExpired}
    />
  );
}
