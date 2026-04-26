import { createHash } from 'crypto';

/**
 * Produces a deterministic JSON string with all object keys sorted recursively.
 *
 * Why not JSON.stringify(obj, keys.sort()): the array replacer acts as a WHITELIST
 * and strips nested keys — all field values serialize to {}, making every hash identical.
 */
function sortedJsonify(val: unknown): string {
  if (Array.isArray(val)) {
    return '[' + val.map(sortedJsonify).join(',') + ']';
  }
  if (val !== null && typeof val === 'object') {
    const pairs = Object.keys(val as object)
      .sort()
      .map(k => `${JSON.stringify(k)}:${sortedJsonify((val as Record<string, unknown>)[k])}`);
    return '{' + pairs.join(',') + '}';
  }
  return JSON.stringify(val);
}

/**
 * Canonical SHA-256 hash for a field value.
 *
 * FROZEN serialization: all object keys sorted recursively so insertion order
 * never affects the output. { value, fieldCode } === { fieldCode, value }.
 *
 * Do NOT change the serialization — every existing on-chain hash becomes invalid.
 */
export function computeFieldHash(fieldCode: string, value: unknown): string {
  const normalized = sortedJsonify({ fieldCode, value });
  return createHash('sha256').update(normalized).digest('hex');
}
