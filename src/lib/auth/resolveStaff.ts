import { verifySessionToken } from "./session";
import { findStaffAccount, readAuthSecret, readStaffAccounts } from "./staffAccounts";
import type { StaffAccount } from "./types";

/**
 * Turns a session cookie value into the staff account it belongs to, or
 * null. The account must still exist in config, so removing someone from
 * STAFF_ACCOUNTS signs them out on their next request. Missing/short
 * AUTH_SECRET → always null (fails closed).
 */
export async function resolveStaffFromToken(token: string | undefined): Promise<StaffAccount | null> {
  const secret = readAuthSecret();
  if (!secret) return null;
  const payload = await verifySessionToken(token, secret);
  if (!payload) return null;
  return findStaffAccount(payload.sub, readStaffAccounts()) ?? null;
}
