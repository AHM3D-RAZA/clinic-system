import type { StaffAccount, StaffIdentity } from "./types";

const MIN_SECRET_LENGTH = 32;

/** The signing secret, or null if it is missing or too short (auth fails closed). */
export function readAuthSecret(env: Record<string, string | undefined> = process.env): string | null {
  const secret = env.AUTH_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

function isAccount(value: unknown): value is StaffAccount {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.email === "string" &&
    v.email.includes("@") &&
    typeof v.name === "string" &&
    v.name.trim() !== "" &&
    typeof v.passwordHash === "string" &&
    v.passwordHash.startsWith("scrypt.") &&
    (v.title === undefined || typeof v.title === "string")
  );
}

/**
 * Parses STAFF_ACCOUNTS (a JSON array). Any malformed input yields an
 * empty list, so a bad config means nobody can sign in — never that
 * everybody can.
 */
export function readStaffAccounts(env: Record<string, string | undefined> = process.env): StaffAccount[] {
  const raw = env.STAFF_ACCOUNTS;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAccount).map((account) => ({ ...account, email: account.email.trim().toLowerCase() }));
  } catch {
    return [];
  }
}

export function findStaffAccount(email: string, accounts: StaffAccount[] = readStaffAccounts()): StaffAccount | undefined {
  const wanted = email.trim().toLowerCase();
  return accounts.find((account) => account.email === wanted);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function toIdentity(account: StaffAccount): StaffIdentity {
  return { email: account.email, name: account.name, title: account.title, initials: initialsOf(account.name) };
}
