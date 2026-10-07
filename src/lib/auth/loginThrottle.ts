/**
 * Tiny in-memory brake on password guessing: after MAX_FAILURES failed
 * attempts for the same key inside WINDOW_MS, further attempts are refused
 * until the window passes. Per-process only — good enough for a pilot,
 * not a substitute for a shared limiter once there are several servers.
 */
export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

interface Entry {
  count: number;
  firstAt: number;
}

const globalStore = globalThis as unknown as { __clinicsysLoginAttempts?: Map<string, Entry> };
const attempts = (globalStore.__clinicsysLoginAttempts ??= new Map<string, Entry>());

function live(key: string, now: number): Entry | undefined {
  const entry = attempts.get(key);
  if (entry && now - entry.firstAt >= WINDOW_MS) {
    attempts.delete(key);
    return undefined;
  }
  return entry;
}

export function isThrottled(key: string, now: number = Date.now()): boolean {
  return (live(key, now)?.count ?? 0) >= MAX_FAILURES;
}

export function recordFailure(key: string, now: number = Date.now()): void {
  const entry = live(key, now);
  if (entry) entry.count += 1;
  else attempts.set(key, { count: 1, firstAt: now });
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
