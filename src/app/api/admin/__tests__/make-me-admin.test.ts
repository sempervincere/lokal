import { describe, it, expect } from 'vitest';

// Extracted allowlist guard logic — mirrors route.ts
const ADMIN_ALLOWLIST = [
  "dylansius.putra@gmail.com",
  "hibahdiskominfo@gmail.com",
];

function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_ALLOWLIST.includes(email.toLowerCase());
}

describe('make-me-admin allowlist guard', () => {
  it('allows dylansius.putra@gmail.com', () => {
    expect(isAllowed('dylansius.putra@gmail.com')).toBe(true);
  });

  it('allows hibahdiskominfo@gmail.com', () => {
    expect(isAllowed('hibahdiskominfo@gmail.com')).toBe(true);
  });

  it('blocks arbitrary email', () => {
    expect(isAllowed('attacker@evil.com')).toBe(false);
  });

  it('blocks null email', () => {
    expect(isAllowed(null)).toBe(false);
  });

  it('blocks undefined email', () => {
    expect(isAllowed(undefined)).toBe(false);
  });

  it('blocks empty string', () => {
    expect(isAllowed('')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isAllowed('DYLANSIUS.PUTRA@GMAIL.COM')).toBe(true);
  });

  it('blocks demo/test accounts', () => {
    expect(isAllowed('test@test.com')).toBe(false);
    expect(isAllowed('admin@lokal.com')).toBe(false);
  });
});
