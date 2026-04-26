import { describe, it, expect } from 'vitest';
import { computeFieldHash } from '../fieldHash';

describe('computeFieldHash', () => {
  it('returns a 64-character hex string', () => {
    const hash = computeFieldHash('B1', { max_wtp: 28000 });
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic — same input always produces same output', () => {
    const hash1 = computeFieldHash('B1', { max_wtp: 28000 });
    const hash2 = computeFieldHash('B1', { max_wtp: 28000 });
    expect(hash1).toBe(hash2);
  });

  it('key order in value object does NOT affect the hash', () => {
    const hashA = computeFieldHash('B1', { x: 1, y: 2 });
    const hashB = computeFieldHash('B1', { y: 2, x: 1 });
    expect(hashA).toBe(hashB);
  });

  it('different field codes produce different hashes', () => {
    const hashB1 = computeFieldHash('B1', { max_wtp: 28000 });
    const hashM1 = computeFieldHash('M1', { max_wtp: 28000 });
    expect(hashB1).not.toBe(hashM1);
  });

  it('different values produce different hashes', () => {
    const hash1 = computeFieldHash('B1', { max_wtp: 28000 });
    const hash2 = computeFieldHash('B1', { max_wtp: 29000 });
    expect(hash1).not.toBe(hash2);
  });

  it('handles nested JSON values', () => {
    const hash = computeFieldHash('M3', {
      competitors: [{ name: 'Kopi Kenangan', price_range: 'mid' }],
    });
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('handles primitive string values', () => {
    const hash = computeFieldHash('C2', 'low');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('handles numeric values', () => {
    const hash = computeFieldHash('MS1', 3500);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  // GOLDEN VALUE — FROZEN. If this ever changes, on-chain hashes are broken.
  // Serialized form: {"fieldCode":"B1","value":{"max_wtp":28000}}
  it('golden value: B1 with max_wtp=28000 is stable', () => {
    expect(computeFieldHash('B1', { max_wtp: 28000 })).toBe(
      '7aafdcc140e4786b8403869a54997b9bce7387ee82b580714880833c989a9a2e',
    );
  });
});
