'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, Download, Loader2, CheckCircle2,
  AlertTriangle, ExternalLink, ArrowDownLeft, ReceiptText,
  TrendingUp, Percent,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EarningRecord {
  id: string;
  type: string;
  amountIdrx: number;
  description: string;
  createdAt: string;
  isPaid: boolean;
  paidAt: string | null;
}

interface WithdrawalRecord {
  date: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  earningCount: number;
}

interface EarningsData {
  totalIdrx: number;
  pendingIdrx: number;
  estimatedThisMonthIdrx: number;
  shareRate: number;
  shareRateLabel: string;
  perSessionIdrx: number;
  tier: { tier: number; label: string; multiplier: number };
  records: EarningRecord[];
  withdrawalHistory: WithdrawalRecord[];
}

const TYPE_LABELS: Record<string, string> = {
  SESSION_SHARE: 'Revenue share',
  FIELD_SUBMISSION: 'Submit field',
  REFRESH_BONUS: 'Bonus refresh',
};

const WITHDRAWAL_FEE_RATE = 0.02;
const MIN_WITHDRAWAL_IDRX = 10_000;

function formatRupiah(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return `Rp ${n.toLocaleString('id')}`;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${date}, ${hh}:${mm}`;
}

function StatCard3({
  icon,
  label,
  value,
  sub,
  bg,
  border,
  labelColor,
  valueColor,
  subColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  bg: string;
  border: string;
  labelColor: string;
  valueColor: string;
  subColor: string;
}) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700, color: valueColor,
        letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
        fontFamily: 'var(--font-mono), monospace',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: subColor, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function SectionHeader({ icon, title, sub, total }: {
  icon: React.ReactNode; title: string; sub?: string; total?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: T.p100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: T.g500, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {total && (
        <div style={{
          padding: '4px 12px', borderRadius: 9999,
          background: T.p100, fontSize: 12, fontWeight: 700, color: T.p600,
          fontFamily: 'var(--font-mono), monospace',
        }}>
          Total: {total}
        </div>
      )}
    </div>
  );
}

export default function COEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<{
    netAmount: number; signature: string; feeAmount: number;
  } | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/co/earnings')
      .then(r => { if (!r.ok) throw new Error('Gagal memuat'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleWithdraw = useCallback(async () => {
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      const res = await fetch('/api/co/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || 'Gagal melakukan withdraw');
      setWithdrawSuccess({
        netAmount: responseData.withdrawal.netAmount,
        signature: responseData.withdrawal.signature,
        feeAmount: responseData.withdrawal.feeAmount,
      });
      fetchData();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setWithdrawing(false);
    }
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: T.danger }}>{error || 'Data tidak tersedia'}</div>
      </div>
    );
  }

  const {
    totalIdrx, pendingIdrx, estimatedThisMonthIdrx,
    shareRateLabel, perSessionIdrx, tier,
    records, withdrawalHistory,
  } = data;

  const feeAmount = Math.floor(pendingIdrx * WITHDRAWAL_FEE_RATE);
  const netAmount = pendingIdrx - feeAmount;
  const canWithdraw = pendingIdrx >= MIN_WITHDRAWAL_IDRX;

  const tierRepRange = tier.tier === 1 ? '0-39' : tier.tier === 2 ? '40-69' : '70-100';

  // Totals for section headers
  const totalWithdrawn = withdrawalHistory.reduce((s, w) => s + w.netAmount, 0);
  const totalEarnings = records.reduce((s, r) => s + r.amountIdrx, 0);

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '28px 32px',
      animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    }}>
      {/* Stat Cards - consistent 3-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard3
          icon={<DollarSign size={15} color={T.p600} />}
          label="Total Pendapatan"
          value={formatRupiah(totalIdrx)}
          sub="sejak bergabung"
          bg={T.c50}
          border={T.c200}
          labelColor={T.g500}
          valueColor={T.g900}
          subColor={T.g500}
        />
        <StatCard3
          icon={<Percent size={15} color={T.g500} />}
          label="Revenue Share Rate"
          value={shareRateLabel}
          sub={`${tier.label} (Rep ${tierRepRange}) · Rp ${perSessionIdrx.toLocaleString('id')}/sesi`}
          bg={T.c50}
          border={T.c200}
          labelColor={T.g500}
          valueColor={T.g900}
          subColor={T.success}
        />
        <StatCard3
          icon={<TrendingUp size={15} color={T.p600} />}
          label="Estimasi Bulan Ini"
          value={formatRupiah(estimatedThisMonthIdrx || pendingIdrx || 0)}
          sub={`Share ${shareRateLabel} x Rp ${perSessionIdrx.toLocaleString('id')}/sesi`}
          bg={T.p100}
          border={`${T.p400}30`}
          labelColor={T.p600}
          valueColor={T.p600}
          subColor={T.p500}
        />
      </div>

      {/* Withdrawal Section */}
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Tarik Pendapatan</div>
            <div style={{ fontSize: 12, color: T.g500 }}>Transfer IDRX ke dompet kamu</div>
          </div>
          {pendingIdrx > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: T.g500 }}>Saldo Tersedia</div>
              <div style={{
                fontSize: 22, fontWeight: 700, color: T.success,
                fontFamily: 'var(--font-mono), monospace', fontVariantNumeric: 'tabular-nums',
              }}>
                {formatRupiah(pendingIdrx)}
              </div>
            </div>
          )}
        </div>

        {pendingIdrx > 0 && (
          <div style={{ background: T.c100, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: T.g500 }}>Saldo Pending</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono), monospace', color: T.g700 }}>
                Rp {pendingIdrx.toLocaleString('id')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: T.g500 }}>Biaya platform (2%)</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono), monospace', color: T.danger }}>
                -Rp {feeAmount.toLocaleString('id')}
              </span>
            </div>
            <div style={{ height: 1, background: T.c200, margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>Diterima</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono), monospace', color: T.success }}>
                Rp {netAmount.toLocaleString('id')}
              </span>
            </div>
          </div>
        )}

        {withdrawSuccess ? (
          <div style={{ background: T.p100, borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <CheckCircle2 size={20} color={T.success} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 4 }}>Withdrawal Berhasil!</div>
              <div style={{ fontSize: 12, color: T.g500 }}>
                Rp {withdrawSuccess.netAmount.toLocaleString('id')} telah dikirim ke dompet kamu.
                <br />Biaya platform: Rp {withdrawSuccess.feeAmount.toLocaleString('id')}
              </div>
              <a
                href={`https://explorer.solana.com/tx/${withdrawSuccess.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.p600, marginTop: 8, textDecoration: 'none' }}
              >
                Lihat di Explorer <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : withdrawError ? (
          <div style={{ background: `${T.danger}10`, borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <AlertTriangle size={20} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.danger, marginBottom: 4 }}>Gagal Withdraw</div>
              <div style={{ fontSize: 12, color: T.g500 }}>{withdrawError}</div>
            </div>
          </div>
        ) : null}

        {!withdrawSuccess && (
          <button
            onClick={handleWithdraw}
            disabled={!canWithdraw || withdrawing}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 9999, border: 'none',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              color: T.c50, background: canWithdraw ? T.p600 : T.g500,
              cursor: canWithdraw ? 'pointer' : 'not-allowed',
              opacity: canWithdraw ? 1 : 0.5,
              transition: 'all 150ms', width: '100%',
            }}
          >
            {withdrawing ? (
              <><Loader2 size={16} style={{ animation: 'lokal-spin 800ms linear infinite' }} />Memproses...</>
            ) : (
              <><Download size={16} />{canWithdraw ? `Tarik ${formatRupiah(netAmount)}` : `Min. ${formatRupiah(MIN_WITHDRAWAL_IDRX)} untuk withdraw`}</>
            )}
          </button>
        )}
      </div>

      {/* Withdrawal History */}
      {withdrawalHistory.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeader
            icon={<ArrowDownLeft size={16} color={T.p600} />}
            title="Riwayat Penarikan"
            sub="Ringkasan setiap penarikan yang sudah diproses"
            total={formatRupiah(totalWithdrawn)}
          />
          <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
                  {['Tanggal & Waktu', 'Bruto', 'Biaya (2%)', 'Diterima', 'Sesi'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: T.g500,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.map((w, i) => (
                  <tr key={w.date}
                    style={{
                      borderBottom: i < withdrawalHistory.length - 1 ? `1px solid ${T.c200}` : 'none',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = T.c100)}
                    onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontSize: 13, color: T.g700 }}>
                      {formatDateTime(w.date)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'var(--font-mono), monospace', color: T.g700, fontVariantNumeric: 'tabular-nums' }}>
                      Rp {w.grossAmount.toLocaleString('id')}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'var(--font-mono), monospace', color: T.danger, fontVariantNumeric: 'tabular-nums' }}>
                      -Rp {w.feeAmount.toLocaleString('id')}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono), monospace', color: T.success, fontVariantNumeric: 'tabular-nums' }}>
                      Rp {w.netAmount.toLocaleString('id')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant="active" style={{ fontSize: 10 }}>
                        {w.earningCount} sesi
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Total row */}
              <tfoot>
                <tr style={{ borderTop: `2px solid ${T.c200}`, background: T.p100 }}>
                  <td colSpan={3} style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Dicairkan
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-mono), monospace', color: T.p600, fontVariantNumeric: 'tabular-nums' }}>
                    Rp {totalWithdrawn.toLocaleString('id')}
                  </td>
                  <td style={{ padding: '12px 20px' }} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Earning Records */}
      <SectionHeader
        icon={<ReceiptText size={16} color={T.p600} />}
        title="Riwayat Pendapatan"
        sub="Detail setiap sesi yang menghasilkan pendapatan"
        total={formatRupiah(totalEarnings)}
      />
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        {records.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: T.g500 }}>
            Belum ada riwayat pendapatan.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
                {['Tipe', 'Jumlah', 'Tanggal & Waktu', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: T.g500,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((e, i) => (
                <tr key={e.id}
                  style={{
                    borderBottom: i < records.length - 1 ? `1px solid ${T.c200}` : 'none',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = T.c100)}
                  onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontSize: 13, color: T.g700 }}>
                    {TYPE_LABELS[e.type] || e.type}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 700, color: T.success, fontVariantNumeric: 'tabular-nums' }}>
                    +Rp {e.amountIdrx.toLocaleString('id')}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: T.g500 }}>
                    {formatDateTime(e.createdAt)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <Badge variant={e.isPaid ? 'active' : 'seeding'} style={{ fontSize: 10 }}>
                      {e.isPaid ? 'Dicairkan' : 'Menunggu'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total row */}
            <tfoot>
              <tr style={{ borderTop: `2px solid ${T.c200}`, background: T.p100 }}>
                <td colSpan={1} style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Pendapatan
                </td>
                <td style={{ padding: '12px 20px', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-mono), monospace', color: T.p600, fontVariantNumeric: 'tabular-nums' }}>
                  +Rp {totalEarnings.toLocaleString('id')}
                </td>
                <td colSpan={2} style={{ padding: '12px 20px', fontSize: 12, color: T.g500 }}>
                  {records.length} transaksi
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
