import { Check } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface StepsProgressProps {
  steps: string[];
  current: number;
}

export function StepsProgress({ steps, current }: StepsProgressProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 60 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < current ? T.p600 : i === current ? T.p600 : T.c200,
              color: i <= current ? T.c50 : T.g500,
              fontSize: 12, fontWeight: 700,
              transition: 'all 250ms',
            }}>
              {i < current ? <Check size={13} color={T.c50} /> : i + 1}
            </div>
            <span style={{
              fontSize: 10,
              color: i === current ? T.p600 : T.g500,
              fontWeight: i === current ? 600 : 400,
              whiteSpace: 'nowrap',
            }}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1,
              height: 2,
              background: i < current ? T.p600 : T.c200,
              margin: '0 4px 14px',
              transition: 'all 250ms',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}
