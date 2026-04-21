import { T } from '@/lib/constants/mock-data';

interface ConfidenceRingProps {
  score: number;
  size?: number;
}

export function ConfidenceRing({ score, size = 48 }: ConfidenceRingProps) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? T.p600 : score >= 65 ? T.warning : T.danger;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.c200} strokeWidth={3} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size < 44 ? 10 : 11, fontWeight: 700, color,
      }}>
        {score}
      </div>
    </div>
  );
}
