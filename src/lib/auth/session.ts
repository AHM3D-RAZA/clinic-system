import { base64UrlToBytes, bytesToBase64Url } from "./base64url";

/**
 * Stateless signed session: `base64url(payload).base64url(HMAC-SHA256)`.
 * The payload only names the account (`sub`) and when it expires (`exp`,
 * seconds since epoch). Uses Web Crypto so the same code runs in the
 * proxy and in server components/actions.
 */
export interface SessionPayload {
  sub: string;
  exp: number;
}

const encoder = new TextEncoder();

async function hmacKey(secret: string, usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

export async function createSessionToken(
  sub: string,
  secret: string,
  ttlSeconds: number,
  nowMs: number = Date.now(),
): Promise<string> {
  const payload: SessionPayload = { sub, exp: Math.floor(nowMs / 1000) + ttlSeconds };
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret, "sign"), encoder.encode(body));
  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

/** Returns the payload only if the signature is valid and the token has not expired. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  nowMs: number = Date.now(),
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  const signatureBytes = base64UrlToBytes(signature);
  if (!signatureBytes) return null;
  const valid = await crypto.subtle.verify("HMAC", await hmacKey(secret, "verify"), signatureBytes, encoder.encode(body));
  if (!valid) return null;

  const bodyBytes = base64UrlToBytes(body);
  if (!bodyBytes) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(bodyBytes)) as Partial<SessionPayload>;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(nowMs / 1000)) return null;
    return { sub: payload.sub, exp: payload.exp };
  } catch {
    return null;
  }
}
