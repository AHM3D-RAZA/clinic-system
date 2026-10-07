import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

const SECRET = "a-test-secret-that-is-at-least-32-chars-long";
const NOW = 1_800_000_000_000;

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await createSessionToken("a@b.co", SECRET, 60, NOW);
    expect(await verifySessionToken(token, SECRET, NOW + 1000)).toEqual({ sub: "a@b.co", exp: NOW / 1000 + 60 });
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken("a@b.co", SECRET, 60, NOW);
    expect(await verifySessionToken(token, SECRET, NOW + 61_000)).toBeNull();
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createSessionToken("a@b.co", SECRET, 60, NOW);
    expect(await verifySessionToken(token, `${SECRET}-other`, NOW)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken("a@b.co", SECRET, 60, NOW);
    const [, signature] = token.split(".");
    const forged = btoa(JSON.stringify({ sub: "boss@b.co", exp: NOW / 1000 + 999 })).replace(/=+$/, "");
    expect(await verifySessionToken(`${forged}.${signature}`, SECRET, NOW)).toBeNull();
  });

  it.each([undefined, "", "abc", "a.b.c", "!!!.???"])("rejects malformed input %j", async (token) => {
    expect(await verifySessionToken(token, SECRET, NOW)).toBeNull();
  });
});
