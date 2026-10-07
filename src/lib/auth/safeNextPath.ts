import { DASHBOARD_PATH } from "./constants";

/**
 * Only allows same-site dashboard paths as post-login destinations.
 * Anything else (absolute URLs, `//host`, backslashes, other sections)
 * falls back to the dashboard home, which closes the open-redirect hole.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return DASHBOARD_PATH;
  if (/[\u0000-\u001f]/.test(next)) return DASHBOARD_PATH;
  const isDashboard = next === DASHBOARD_PATH || next.startsWith(`${DASHBOARD_PATH}/`) || next.startsWith(`${DASHBOARD_PATH}?`);
  return isDashboard ? next : DASHBOARD_PATH;
}
