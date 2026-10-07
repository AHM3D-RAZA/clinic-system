import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashes look like `scrypt.<salt>.<hash>` (base64url parts).
 * The format deliberately avoids `$` because dotenv expands `$VARS`
 * inside .env values. Server-only: never import this into the proxy
 * or a client component.
 */
const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt.${salt.toString("base64url")}.${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltPart, hashPart] = stored.split(".");
  if (scheme !== "scrypt" || !saltPart || !hashPart) return false;
  const expected = Buffer.from(hashPart, "base64url");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = scryptSync(password, Buffer.from(saltPart, "base64url"), KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}
