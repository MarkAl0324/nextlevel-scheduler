"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRule, deleteRule } from "@/lib/actions/rules";
import styles from "./page.module.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type Rule = {
  id: string;
  weekday: string;
  provider: { id: string; name: string };
  requiredEmployee: { id: string; name: string };
};

type Props = {
  rules: Rule[];
  employees: { id: string; name: string }[];
  providers: { id: string; name: string }[];
};

export function RulesClient({ rules, employees, providers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [providerId, setProviderId] = useState("");
  const [weekday, setWeekday] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function handleCreate() {
    if (!providerId || !weekday || !employeeId) {
      setFormError("All fields are required.");
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const result = await createRule(providerId, weekday, employeeId);
      if (result.ok) {
        setProviderId("");
        setWeekday("");
        setEmployeeId("");
        router.refresh();
      } else {
        setFormError(result.error);
      }
    });
  }

  function handleDelete(ruleId: string) {
    startTransition(async () => {
      const result = await deleteRule(ruleId);
      if (!result.ok) alert(result.error);
      else router.refresh();
    });
  }

  return (
    <>
      {/* Add rule form */}
      <div className={styles.formCard}>
        <div className={styles.formTitle}>Add Pairing Rule</div>
        <div className={styles.formRow}>
          <select
            className={styles.formSelect}
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            disabled={isPending}
          >
            <option value="">Provider…</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className={styles.formSelect}
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            disabled={isPending}
          >
            <option value="">Day…</option>
            {WEEKDAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className={styles.formSelect}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={isPending}
          >
            <option value="">Required MA…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.formBtn}
            onClick={handleCreate}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Add rule"}
          </button>
        </div>
        {formError && <div className={styles.formError}>{formError}</div>}
      </div>

      {/* Rules table */}
      <div className={styles.tableWrap} aria-label="Provider pairing rules">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Provider</th>
              <th className={styles.th}>Day</th>
              <th className={styles.th}>Required MA</th>
              <th className={styles.th}>Enforcement</th>
              <th className={styles.th} />
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td className={styles.td} colSpan={5} style={{ color: "var(--muted)" }}>
                  No pairing rules defined yet.
                </td>
              </tr>
            ) : (
              rules.map((r) => (
                <tr key={r.id}>
                  <td className={styles.td}>{r.provider.name}</td>
                  <td className={styles.td}>{r.weekday}</td>
                  <td className={styles.td}>{r.requiredEmployee.name}</td>
                  <td className={styles.td}>
                    <span className={`${styles.pill} ${styles.pillBlock}`}>Blocked</span>
                  </td>
                  <td className={styles.td}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      disabled={isPending}
                      onClick={() => handleDelete(r.id)}
                      aria-label={`Delete rule for ${r.provider.name} on ${r.weekday}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
