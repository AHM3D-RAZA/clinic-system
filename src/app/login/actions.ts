"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_PATH, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { createSessionToken } from "@/lib/auth/session";
import { findStaffAccount, readAuthSecret, readStaffAccounts } from "@/lib/auth/staffAccounts";
import { hashPassword, verifyPassword } from "@/lib/auth/passwordHash";
import { clearFailures, isThrottled, recordFailure } from "@/lib/auth/loginThrottle";
import { isHttps, sessionCookieOptions } from "@/lib/auth/sessionCookie";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import type { LoginState } from "./loginState";

// Verified against when the email is unknown, so "no such user" and
// "wrong password" take the same time.
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("clinicsys-no-such-user"));

const BAD_CREDENTIALS = "That email and password don't match.";

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  const secret = readAuthSecret();
  if (!secret || readStaffAccounts().length === 0) {
    return { error: "Staff sign-in isn't set up on this server yet." };
  }

  const requestHeaders = await headers();
  const client = (requestHeaders.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const throttleKey = `${client}|${email}`;
  if (isThrottled(throttleKey)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const account = findStaffAccount(email);
  const passwordOk = verifyPassword(password, account?.passwordHash ?? getDummyHash());
  if (!account || !passwordOk) {
    recordFailure(throttleKey);
    return { error: BAD_CREDENTIALS };
  }

  clearFailures(throttleKey);
  const token = await createSessionToken(account.email, secret, SESSION_TTL_SECONDS);
  (await cookies()).set({ ...sessionCookieOptions(isHttps(requestHeaders)), value: token });
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect(LOGIN_PATH);
}
