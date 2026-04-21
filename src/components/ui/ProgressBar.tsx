import { T } from '@/lib/constants/mock-data';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  label?: string;
}

export function ProgressBar({ value, max = 100, color = T.p600, height = 6, label }: ProgressBarProps) {
  const pct = (value / max) * 100;
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: T.g500 }}>
          <span>{label}</span>
          <span style={{ fontWeight: 700, color: T.g900 }}>{value}/{max}</span>
        </div>
      )}
      <div style={{ height, background: T.c200, borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 600ms ease' }} />
      </div>
    </div>
  );
}
