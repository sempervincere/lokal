import { describe, it, expect, vi, beforeAll } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createPaymentTransaction } from '../idrxTransfer';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_IDRX_MINT_ADDRESS', '4piP71BittDqdL7vusSgj7ikcoamd8UuCWKZTsUeu8ur');
  vi.stubEnv('NEXT_PUBLIC_PLATFORM_WALLET', 'AaT2jw3M6RJnRLwMGZbxvLEqaWVKzQasaV6Mkp61K8Km');
});

describe('createPaymentTransaction', () => {
  const buyerWallet = new PublicKey('11111111111111111111111111111111');
  const sessionId = 'test-session-abc-123';

  it('returns a Transaction with exactly 2 instructions', () => {
    const tx = createPaymentTransaction(buyerWallet, sessionId);
    expect(tx.instructions).toHaveLength(2);
  });

  it('first instruction is Memo with sessionId encoded as UTF-8', () => {
    const tx = createPaymentTransaction(buyerWallet, sessionId);
    const memoIx = tx.instructions[0];
    const MEMO_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    expect(memoIx.programId.equals(MEMO_ID)).toBe(true);
    expect(Buffer.from(memoIx.data).toString('utf-8')).toBe(sessionId);
  });

  it('second instruction targets the SPL Token program (TransferChecked)', () => {
    const tx = createPaymentTransaction(buyerWallet, sessionId);
    const transferIx = tx.instructions[1];
    expect(transferIx.programId.equals(TOKEN_PROGRAM_ID)).toBe(true);
  });

  it('different sessionIds produce different Memo data', () => {
    const tx1 = createPaymentTransaction(buyerWallet, 'session-aaa');
    const tx2 = createPaymentTransaction(buyerWallet, 'session-bbb');
    const data1 = Buffer.from(tx1.instructions[0].data).toString('utf-8');
    const data2 = Buffer.from(tx2.instructions[0].data).toString('utf-8');
    expect(data1).not.toBe(data2);
  });

  it('Memo instruction has no account keys', () => {
    const tx = createPaymentTransaction(buyerWallet, sessionId);
    expect(tx.instructions[0].keys).toHaveLength(0);
  });
});
