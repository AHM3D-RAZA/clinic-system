import { describe, expect, it } from "vitest";
import { findStaffAccount, initialsOf, readAuthSecret, readStaffAccounts, toIdentity } from "./staffAccounts";

const account = { email: "Desk@Clinic.test", name: "Sana Malik", title: "Front desk", passwordHash: "scrypt.a.b" };

describe("readAuthSecret", () => {
  it("requires at least 32 characters", () => {
    expect(readAuthSecret({ AUTH_SECRET: "short" })).toBeNull();
    expect(readAuthSecret({})).toBeNull();
    expect(readAuthSecret({ AUTH_SECRET: "x".repeat(32) })).toBe("x".repeat(32));
  });
});

describe("readStaffAccounts", () => {
  it("parses valid accounts and lowercases emails", () => {
    const list = readStaffAccounts({ STAFF_ACCOUNTS: JSON.stringify([account]) });
    expect(list).toHaveLength(1);
    expect(list[0].email).toBe("desk@clinic.test");
  });

  it.each([undefined, "", "not json", "{}", "[1]", JSON.stringify([{ ...account, passwordHash: "plaintext" }])])(
    "fails closed on bad config %j",
    (raw) => {
      expect(readStaffAccounts({ STAFF_ACCOUNTS: raw })).toEqual([]);
    },
  );

  it("drops invalid entries but keeps valid ones", () => {
    const list = readStaffAccounts({ STAFF_ACCOUNTS: JSON.stringify([{ nope: 1 }, account]) });
    expect(list).toHaveLength(1);
  });
});

describe("identity helpers", () => {
  it("finds accounts case-insensitively", () => {
    const list = readStaffAccounts({ STAFF_ACCOUNTS: JSON.stringify([account]) });
    expect(findStaffAccount("  DESK@clinic.test ", list)?.name).toBe("Sana Malik");
    expect(findStaffAccount("other@clinic.test", list)).toBeUndefined();
  });

  it("derives initials", () => {
    expect(initialsOf("Sana Malik")).toBe("SM");
    expect(initialsOf("Aamir")).toBe("AA");
    expect(initialsOf("  ")).toBe("?");
  });

  it("exposes only identity fields (no hash)", () => {
    const identity = toIdentity({ ...account, email: "desk@clinic.test" });
    expect(identity).toEqual({ email: "desk@clinic.test", name: "Sana Malik", title: "Front desk", initials: "SM" });
  });
});
