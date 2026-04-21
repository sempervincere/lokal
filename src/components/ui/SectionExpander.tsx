'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface Section {
  id: number;
  icon: string;
  title: string;
  summary: string;
  points: string[];
}

interface SectionExpanderProps {
  section: Section;
  delay?: number;
  iconElement?: React.ReactNode;
}

export function SectionExpander({ section, delay = 0, iconElement }: SectionExpanderProps) {
  const [open, setOpen] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: T.c100,
        border: `1px solid ${T.c200}`,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(8px)',
        transition: `opacity 300ms ease ${delay}ms, transform 300ms ease ${delay}ms`,
        boxShadow: open ? '0 2px 10px rgba(26,26,26,0.07)' : 'none',
      }}
    >
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: T.p100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {iconElement}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>
            {section.id}. {section.title}
          </div>
          <div style={{ fontSize: 12, color: T.g500, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {section.summary}
          </div>
        </div>
        <div style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '200ms', flexShrink: 0 }}>
          <ChevronDown size={16} color={T.g500} />
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${T.c200}` }}>
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {section.points.map((point, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: T.g700, lineHeight: 1.5 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.p400, flexShrink: 0, marginTop: 7 }} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
