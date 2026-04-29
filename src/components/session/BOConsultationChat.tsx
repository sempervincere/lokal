'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { InputField } from '@/components/ui/InputField';

interface ClusterData {
  id: string;
  name: string;
  [key: string]: any;
}

export function BOConsultationChat({
  cluster: c,
  sessionId,
  onBack,
  expiresAt,
  initialMsgs,
  onMsgsChange,
  isExpired: sessionIsExpired,
}: {
  cluster: ClusterData;
  sessionId: string | null;
  onBack: () => void;
  expiresAt: string | null;
  initialMsgs: any;
  onMsgsChange: any;
  isExpired?: boolean;
}) {
  const [msgs, setMsgs] = useState<Array<{ id: number; role: 'ai' | 'user'; text: string }>>(
    initialMsgs || [
      {
        id: 0,
        role: 'ai',
        text: `Selamat datang di sesi konsultasi berbayar untuk **${c.name}**! Laporan kamu sudah saya baca. Tanya apa saja — strategi harga, lokasi, menu, kompetitor, atau rencana launch. Sesi ini aktif 12 jam.`,
      },
    ]
  );
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [persona, setPersona] = useState<'motivated' | 'realistic' | 'strategic'>('realistic');

  useEffect(() => {
    onMsgsChange?.(msgs);
  }, [msgs, onMsgsChange]);

  // Load past messages from DB when viewing an expired session's history
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}/messages`)
      .then(r => r.json())
      .then((data: Array<{ id: string; role: string; content: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          const historicalMsgs = data.map((m: any, i: number) => ({
            id: Date.now() + i,
            role: m.role === 'assistant' ? ('ai' as const) : ('user' as const),
            text: m.content,
          }));
          setMsgs(prev => {
            if (sessionIsExpired) return historicalMsgs;
            return [prev[0], ...historicalMsgs];
          });
        } else {
          setMsgs([{ id: 0, role: 'ai', text: 'Belum ada riwayat percakapan untuk sesi ini.' }]);
        }
      })
      .catch(console.error);
  }, [sessionId, sessionIsExpired]);

  const getTimeLeft = () => {
    if (!expiresAt) return 43200;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  };
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    const history = msgs
      .filter(m => m.id !== 0)
      .map(m => ({
        role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
        content: m.text,
      }));

    setMsgs(m => [...m, { id: Date.now(), role: 'user', text }]);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch('/api/chat/paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clusterId: c.id,
          sessionId: sessionId ?? undefined,
          messages: [...history, { role: 'user', content: text }],
          persona: customMode ? persona : 'realistic',
        }),
      });

      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      const aiMsgId = Date.now() + 1;
      setTyping(false);
      setMsgs(m => [...m, { id: aiMsgId, role: 'ai', text: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              setMsgs(m =>
                m.map(msg => (msg.id === aiMsgId ? { ...msg, text: msg.text + parsed.content } : msg))
              );
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now(), role: 'ai', text: 'Maaf, terjadi kesalahan. Coba kirim lagi.' }]);
    }
  };

  const bold = (t: string) =>
    t.split(/\*\*(.*?)\*\*/g).map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p));
  const expired = timeLeft === 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' , height: '100%', overflow: 'hidden'}}>

      {/* Header */}
      <div style={{ padding: '14px 24px', background: `linear-gradient(135deg, ${T.g900} 0%, #1e1b4b 100%)`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={18} color="rgba(255,255,255,0.6)" />
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageCircle size={18} color={T.c50} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.c50 }}>
              {sessionIsExpired ? 'Riwayat Konsultasi' : 'Konsultasi AI'} — {c.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: expired || sessionIsExpired ? '#EF4444' : '#4ADE80',
                }}
              />
              {sessionIsExpired ? 'Sesi berakhir · Hanya baca' : expired ? 'Sesi habis' : `Berakhir dalam: ${fmt(timeLeft)}`}
            </div>
          </div>
          <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.12)', color: T.c50 }}>
            Sesi Berbayar
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, background: T.c50 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'ai' && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: T.g900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                  flexShrink: 0,
                  alignSelf: 'flex-end',
                }}
              >
                <Sparkles size={13} color={T.c50} />
              </div>
            )}
            <div
              style={{
                maxWidth: '78%',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? T.g900 : '#fff',
                color: m.role === 'user' ? T.c50 : T.g900,
                fontSize: 14,
                lineHeight: 1.6,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {bold(m.text)}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: '#fff', borderRadius: '16px 16px 16px 4px', width: 'fit-content', marginLeft: 36 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: T.g500,
                  animation: `bounceDot 1.2s ease ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '14px 24px 20px', borderTop: `1px solid ${T.c200}`, background: '#fff', flexShrink: 0 }}>
        {expired || sessionIsExpired ? (
          <div
            style={{
              textAlign: 'center',
              padding: '14px',
              background: '#FEF2F2',
              borderRadius: 12,
              fontSize: 13,
              color: '#EF4444',
              fontWeight: 600,
            }}
          >
            {sessionIsExpired ? 'Sesi ini telah berakhir. Kamu hanya dapat membaca riwayat percakapan.' : 'Sesi konsultasi 12 jam sudah berakhir.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Compact Persona Picker Left Aligned */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#f8fafc',
                  padding: '4px 4px 4px 12px',
                  borderRadius: 9999,
                  border: `1px solid ${T.c200}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.g900 }}>Custom Mode</span>
                  <button
                    onClick={() => setCustomMode(!customMode)}
                    style={{
                      width: 28,
                      height: 16,
                      borderRadius: 9999,
                      background: customMode ? T.p600 : T.c200,
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 200ms',
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: 2,
                        left: customMode ? 14 : 2,
                        transition: 'left 200ms',
                      }}
                    />
                  </button>
                </div>
                <div style={{ width: 1, height: 14, background: T.c200 }} />
                <div
                  style={{
                    display: 'flex',
                    gap: 2,
                    opacity: customMode ? 1 : 0.4,
                    pointerEvents: customMode ? 'auto' : 'none',
                    transition: 'opacity 200ms',
                  }}
                >
                  {[
                    { id: 'motivated', label: 'Motivated' },
                    { id: 'realistic', label: 'Realistic' },
                    { id: 'strategic', label: 'Strategic' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id as any)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 9999,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 11,
                        fontWeight: persona === p.id && customMode ? 700 : 500,
                        background: persona === p.id && customMode ? T.g900 : 'transparent',
                        color: persona === p.id && customMode ? T.c50 : T.g500,
                        transition: 'all 200ms',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <InputField
                  placeholder="Tanya apa saja tentang konsep dan strategi bisnis kamu..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || typing}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: !input.trim() || typing ? T.c200 : T.g900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ArrowRight size={17} color={!input.trim() || typing ? T.g500 : T.c50} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
