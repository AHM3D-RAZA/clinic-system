import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_PATH, SESSION_COOKIE } from "./constants";
import { resolveStaffFromToken } from "./resolveStaff";
import { toIdentity } from "./staffAccounts";
import type { StaffIdentity } from "./types";

/** The signed-in staff member for this request, or null. */
export async function getCurrentStaff(): Promise<StaffIdentity | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const account = await resolveStaffFromToken(token);
  return account ? toIdentity(account) : null;
}

/**
 * Server-side gate for pages/layouts. The proxy already redirects
 * unauthenticated requests (and carries the `next` destination); this
 * second check means a page can never render patient data even if the
 * proxy matcher is ever changed by mistake.
 */
export async function requireStaff(): Promise<StaffIdentity> {
  const staff = await getCurrentStaff();
  if (!staff) redirect(LOGIN_PATH);
  return staff;
}
