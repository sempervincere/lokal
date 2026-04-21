import { T } from '@/lib/constants/mock-data';

interface MapPlaceholderProps {
  accent?: string;
  color?: string;
  height?: number;
  label?: string;
}

export function MapPlaceholder({ accent = T.p100, color = T.p400, height = 120, label = '' }: MapPlaceholderProps) {
  const id = 'mp' + color.replace('#', '');
  return (
    <div style={{ height, background: accent, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      <svg width="100%" height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <line x1="0" y1="24" x2="24" y2="0" stroke={color} strokeWidth="0.5" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#${id})`} />
        <circle cx="50%" cy="50%" r="22" fill={color} opacity="0.12" />
        <circle cx="50%" cy="50%" r="12" fill={color} opacity="0.2" />
        <circle cx="50%" cy="50%" r="5" fill={color} opacity="0.7" />
        {label && (
          <text x="50%" y="85%" textAnchor="middle" fontSize="10" fill={color} opacity="0.6" fontFamily="inherit">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
