import { T } from '@/lib/constants/mock-data';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfidenceRing } from '@/components/ui/ConfidenceRing';

interface ClusterStatsProps {
  confidenceScore: number;
  dataCompleteness: number;
  totalValidatedFields: number;
}

export function ClusterStats({ confidenceScore, dataCompleteness, totalValidatedFields }: ClusterStatsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ConfidenceRing score={confidenceScore} size={44} />
          <div>
            <div style={{ fontSize: 11, color: T.g500, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Confidence Score
            </div>
            <div style={{ fontSize: 13, color: T.g900, fontWeight: 700, marginTop: 1 }}>
              {confidenceScore >= 80 ? 'Sangat Akurat' : confidenceScore >= 60 ? 'Cukup Akurat' : 'Sedang Dikumpulkan'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.p600 }}>{totalValidatedFields}</div>
          <div style={{ fontSize: 11, color: T.g500 }}>field tervalidasi</div>
        </div>
      </div>

      <ProgressBar
        value={totalValidatedFields}
        max={20}
        color={T.p600}
        height={6}
        label="Kelengkapan Data"
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <StatPill label="Kelengkapan" value={`${dataCompleteness}%`} />
        <StatPill label="Tier 1 Fields" value={`${totalValidatedFields}/20`} />
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      flex: 1,
      background: T.c100,
      borderRadius: 8,
      padding: '6px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.g900 }}>{value}</div>
    </div>
  );
}
