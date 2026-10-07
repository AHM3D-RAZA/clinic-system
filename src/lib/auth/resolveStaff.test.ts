import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken } from "./session";
import { hashPassword } from "./passwordHash";
import { resolveStaffFromToken } from "./resolveStaff";

const SECRET = "resolve-test-secret-at-least-32-characters";
const accounts = JSON.stringify([
  { email: "desk@clinic.test", name: "Desk Person", passwordHash: hashPassword("pw") },
]);

describe("resolveStaffFromToken", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", SECRET);
    vi.stubEnv("STAFF_ACCOUNTS", accounts);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("resolves a valid session to its account", async () => {
    const token = await createSessionToken("desk@clinic.test", SECRET, 60);
    expect((await resolveStaffFromToken(token))?.name).toBe("Desk Person");
  });

  it("rejects missing, forged, and removed-user sessions", async () => {
    expect(await resolveStaffFromToken(undefined)).toBeNull();
    expect(await resolveStaffFromToken(await createSessionToken("desk@clinic.test", "x".repeat(40), 60))).toBeNull();
    expect(await resolveStaffFromToken(await createSessionToken("gone@clinic.test", SECRET, 60))).toBeNull();
  });

  it("fails closed when AUTH_SECRET is not configured", async () => {
    const token = await createSessionToken("desk@clinic.test", SECRET, 60);
    vi.stubEnv("AUTH_SECRET", "");
    expect(await resolveStaffFromToken(token)).toBeNull();
  });
});
