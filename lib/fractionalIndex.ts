import { generateKeyBetween } from 'fractional-indexing'

export function keyBetween(a: string | null, b: string | null): string {
  if (a !== null && b !== null && a >= b) {
    // Defensive: callers should always pass a < b. If they don't (e.g. a stale
    // render order), fall back to inserting after `a` instead of throwing/duplicating.
    return generateKeyBetween(a, null)
  }
  return generateKeyBetween(a, b)
}

export function firstKey(): string {
  return generateKeyBetween(null, null)
}
