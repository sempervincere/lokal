import { T } from '@/lib/constants/mock-data';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizes = { sm: 16, md: 24, lg: 36 };
const borders = { sm: '2px', md: '2.5px', lg: '3px' };

export function LoadingSpinner({ size = 'md', color = T.p600, className }: LoadingSpinnerProps) {
  const px = sizes[size];
  const bw = borders[size];
  return (
    <div
      className={className}
      aria-label="Loading"
      role="status"
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: `${bw} solid ${color}22`,
        borderTopColor: color,
        animation: 'lokal-spin 0.7s linear infinite',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}
