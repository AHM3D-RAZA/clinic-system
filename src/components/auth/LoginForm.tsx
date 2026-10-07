"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/login/actions";
import type { LoginState } from "@/app/login/loginState";
import styles from "./LoginForm.module.css";

const INITIAL_STATE: LoginState = {};

/** Email + password form. `next` rides along as a hidden field and is re-validated server-side. */
export function LoginForm({ next }: { next: string }) {
  // Controlled so a failed attempt doesn't wipe the email (React resets uncontrolled fields after an action).
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={next} />

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          autoFocus
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input className={styles.input} type="password" name="password" autoComplete="current-password" required />
      </label>

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
