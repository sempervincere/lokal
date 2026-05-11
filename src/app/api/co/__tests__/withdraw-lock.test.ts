import { describe, it, expect } from 'vitest';

// In-memory DB simulation for optimistic lock logic
interface Earning {
  id: string;
  isPaid: boolean;
  paidAt: Date | null;
  amountIdrx: number;
}

function createDB(earnings: Earning[]) {
  const rows = earnings.map((e) => ({ ...e }));

  return {
    findMany: (coId: string) =>
      rows.filter((r) => !r.isPaid),

    updateMany: (ids: string[], setPaid: boolean, paidAt: Date | null) => {
      const targets = rows.filter(
        (r) => ids.includes(r.id) && r.isPaid === !setPaid
      );
      targets.forEach((r) => {
        r.isPaid = setPaid;
        r.paidAt = paidAt;
      });
      return { count: targets.length };
    },

    rows,
  };
}

async function simulateWithdraw(
  db: ReturnType<typeof createDB>,
  coId: string,
): Promise<{ status: number; error?: string }> {
  const unpaid = db.findMany(coId);

  if (unpaid.length === 0) {
    return { status: 400, error: 'NO_EARNINGS' };
  }

  const ids = unpaid.map((e) => e.id);
  const paidAt = new Date();
  const lockResult = db.updateMany(ids, true, paidAt);

  if (lockResult.count === 0) {
    return { status: 409, error: 'WITHDRAWAL_IN_PROGRESS' };
  }

  // Simulate Solana TX (always succeeds here)
  const txOk = true;

  if (!txOk) {
    db.updateMany(ids, false, null);
    return { status: 500, error: 'TX_FAILED' };
  }

  return { status: 200 };
}

describe('withdrawal optimistic lock', () => {
  it('single withdrawal succeeds', async () => {
    const db = createDB([
      { id: 'e1', isPaid: false, paidAt: null, amountIdrx: 50000 },
    ]);
    const result = await simulateWithdraw(db, 'co1');
    expect(result.status).toBe(200);
    expect(db.rows[0].isPaid).toBe(true);
  });

  it('concurrent requests: exactly 1 wins, 1 gets 409', async () => {
    const db = createDB([
      { id: 'e1', isPaid: false, paidAt: null, amountIdrx: 50000 },
    ]);

    // Snapshot both before either locks
    const unpaidA = db.findMany('co1');
    const unpaidB = db.findMany('co1');

    const idsA = unpaidA.map((e) => e.id);
    const idsB = unpaidB.map((e) => e.id);

    const paidAt = new Date();
    const lockA = db.updateMany(idsA, true, paidAt);
    const lockB = db.updateMany(idsB, true, paidAt);

    const results = [
      lockA.count > 0 ? { status: 200 } : { status: 409, error: 'WITHDRAWAL_IN_PROGRESS' },
      lockB.count > 0 ? { status: 200 } : { status: 409, error: 'WITHDRAWAL_IN_PROGRESS' },
    ];

    const successes = results.filter((r) => r.status === 200);
    const conflicts = results.filter((r) => r.status === 409);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(1);
  });

  it('returns NO_EARNINGS when nothing to withdraw', async () => {
    const db = createDB([
      { id: 'e1', isPaid: true, paidAt: new Date(), amountIdrx: 50000 },
    ]);
    const result = await simulateWithdraw(db, 'co1');
    expect(result.status).toBe(400);
    expect(result.error).toBe('NO_EARNINGS');
  });

  it('rollback on TX failure restores isPaid=false', async () => {
    const db = createDB([
      { id: 'e1', isPaid: false, paidAt: null, amountIdrx: 50000 },
    ]);

    const unpaid = db.findMany('co1');
    const ids = unpaid.map((e) => e.id);
    const paidAt = new Date();
    db.updateMany(ids, true, paidAt);

    // Simulate TX failure → rollback
    db.updateMany(ids, false, null);

    expect(db.rows[0].isPaid).toBe(false);
    expect(db.rows[0].paidAt).toBeNull();
  });

  it('already-paid earnings are not re-paid', async () => {
    const existingPaidAt = new Date('2025-01-01');
    const db = createDB([
      { id: 'e1', isPaid: true, paidAt: existingPaidAt, amountIdrx: 50000 },
    ]);

    const ids = ['e1'];
    const lockResult = db.updateMany(ids, true, new Date());

    expect(lockResult.count).toBe(0);
    expect(db.rows[0].paidAt?.toISOString()).toBe(existingPaidAt.toISOString());
  });
});
