import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./passwordHash";

describe("passwordHash", () => {
  it("verifies the right password and rejects the wrong one", () => {
    const stored = hashPassword("correct horse");
    expect(verifyPassword("correct horse", stored)).toBe(true);
    expect(verifyPassword("wrong horse", stored)).toBe(false);
  });

  it("salts: same password hashes differently", () => {
    expect(hashPassword("x")).not.toBe(hashPassword("x"));
  });

  it("uses a dotenv-safe format (no $)", () => {
    expect(hashPassword("x")).toMatch(/^scrypt\.[\w-]+\.[\w-]+$/);
  });

  it.each(["", "plain", "scrypt.only", "scrypt..", "bcrypt.a.b"])("rejects malformed stored value %j", (stored) => {
    expect(verifyPassword("x", stored)).toBe(false);
  });

  it("accepts hashes made by scripts/auth.mjs (no format drift)", () => {
    const stored = execFileSync("node", ["scripts/auth.mjs", "hash", "cli-password"], { encoding: "utf8" }).trim();
    expect(verifyPassword("cli-password", stored)).toBe(true);
  });
});
