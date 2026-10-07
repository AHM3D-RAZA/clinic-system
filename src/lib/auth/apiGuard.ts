import type { NextResponse } from "next/server";
import { getCurrentStaff } from "./currentStaff";
import { unauthorizedResponse } from "./unauthorized";

/**
 * For route handlers that return or change protected data. Returns a 401
 * response when nobody is signed in, otherwise null:
 *
 *   const denied = await requireStaffApi();
 *   if (denied) return denied;
 */
export async function requireStaffApi(): Promise<NextResponse | null> {
  return (await getCurrentStaff()) ? null : unauthorizedResponse();
}
