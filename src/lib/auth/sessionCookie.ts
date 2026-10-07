import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "./constants";

/** `Secure` only over HTTPS, so plain-http localhost demos still work. */
export function isHttps(headers: Headers): boolean {
  return (headers.get("x-forwarded-proto") ?? "").split(",")[0].trim() === "https";
}

export function sessionCookieOptions(secure: boolean) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
