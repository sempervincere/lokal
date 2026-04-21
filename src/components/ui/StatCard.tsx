import { T } from '@/lib/constants/mock-data';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  trend?: number | null;
}

export function StatCard({ icon, label, value, sub, color = T.p600, trend }: StatCardProps) {
  return (
    <div style={{
      background: T.c50,
      border: `1px solid ${T.c200}`,
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: T.p100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        {trend != null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700,
            color: trend >= 0 ? T.success : T.danger,
          }}>
            {trend >= 0
              ? <TrendingUp size={12} color={T.success} />
              : <TrendingDown size={12} color={T.danger} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.g500, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}
