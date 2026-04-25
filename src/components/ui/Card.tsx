import { T } from '@/lib/constants/mock-data';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number;
  className?: string;
}

export function Card({ children, header, footer, style = {}, padding = 20, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: T.c50,
        borderRadius: 14,
        border: `1px solid ${T.c200}`,
        overflow: 'hidden',
        ...style,
      }}
    >
      {header && (
        <div style={{
          padding: `${padding}px ${padding}px 14px`,
          borderBottom: `1px solid ${T.c200}`,
        }}>
          {header}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
      {footer && (
        <div style={{
          padding: `14px ${padding}px ${padding}px`,
          borderTop: `1px solid ${T.c200}`,
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}
