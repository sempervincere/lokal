'use client';

import { useState, useEffect } from 'react';

export function ActiveTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (timeLeft === 0) {
    return <span style={{ color: '#EF4444', fontWeight: 700 }}>00:00:00</span>;
  }
  
  return <span style={{ color: '#F59E0B', fontWeight: 700 }}>{fmt(timeLeft)}</span>;
}
