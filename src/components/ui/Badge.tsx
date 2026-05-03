import { T } from '@/lib/constants/mock-data';

type Variant = 'active' | 'seeding' | 'danger' | 'warn' | 'dark' | 'neutral' | 'info' | 'success';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  style?: React.CSSProperties;
  className?: string;
}

const variantStyles: Record<Variant, { bg: string; color: string }> = {
  active:  { bg: T.p100, color: T.p600 },
  seeding: { bg: '#FEF3C7', color: '#92400E' },
  danger:  { bg: '#FEE2E2', color: T.danger },
  warn:    { bg: T.e100, color: T.e600 },
  dark:    { bg: T.g900, color: T.c50 },
  neutral: { bg: T.c200, color: T.g500 },
  info:    { bg: '#EAF3F7', color: T.info },
  success: { bg: T.p100, color: T.p600 },
};

export function Badge({ children, variant = 'active', style = {}, className }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <span className={className} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.01em',
      background: v.bg,
      color: v.color,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  );
}
