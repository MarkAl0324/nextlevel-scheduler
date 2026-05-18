"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import styles from "./page.module.css";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>NL</div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>Next Level Scheduler</div>
            <div className={styles.brandSub}>Staff scheduling platform</div>
          </div>
        </div>

        <form action={formAction} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="you@demo.local"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={isPending} className={styles.submit}>
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className={styles.hint}>
          Demo password is <code>demo123</code> for all accounts.
        </p>
      </div>
    </div>
  );
}
