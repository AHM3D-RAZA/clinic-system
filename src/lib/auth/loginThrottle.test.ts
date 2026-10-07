import { describe, expect, it } from "vitest";
import { MAX_FAILURES, WINDOW_MS, clearFailures, isThrottled, recordFailure } from "./loginThrottle";

describe("loginThrottle", () => {
  it("blocks after MAX_FAILURES and releases after the window", () => {
    const key = "t1";
    const t0 = 1000;
    for (let i = 0; i < MAX_FAILURES; i++) {
      expect(isThrottled(key, t0)).toBe(false);
      recordFailure(key, t0);
    }
    expect(isThrottled(key, t0 + 1)).toBe(true);
    expect(isThrottled(key, t0 + WINDOW_MS)).toBe(false);
  });

  it("clears on success and isolates keys", () => {
    for (let i = 0; i < MAX_FAILURES; i++) recordFailure("t2", 0);
    expect(isThrottled("t3", 0)).toBe(false);
    clearFailures("t2");
    expect(isThrottled("t2", 0)).toBe(false);
  });
});
