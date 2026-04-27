"use client";

import { useMemo } from "react";
import styles from "./RosterDrawer.module.css";
import type { IsoDate } from "@/lib/demoData";

export type RosterResponse = {
  date: IsoDate;
  assignments: Array<{ employee: { id: string; name: string }; provider?: { id: string; name: string } }>;
};

function formatLong(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(d);
}

function badgeFor(providers: number, mas: number) {
  const delta = mas - providers;
  if (providers === 0 && mas === 0) return { text: "No staffing", className: styles.badge };
  if (delta === 0) return { text: "Balanced", className: `${styles.badge} ${styles.badgeBalanced}` };
  if (delta < 0) return { text: `${Math.abs(delta)} short`, className: `${styles.badge} ${styles.badgeUnder}` };
  return { text: `${delta} extra`, className: `${styles.badge} ${styles.badgeOver}` };
}

export function RosterDrawer(props: {
  isoDate: IsoDate | null;
  onClose: () => void;
  data: RosterResponse | null;
  loading: boolean;
  error: string | null;
}) {
  const open = !!props.isoDate;
  const isoDate = props.isoDate;
  const { data, loading, error } = props;

  const providersCount = useMemo(() => {
    if (!data) return 0;
    const set = new Set<string>();
    for (const a of data.assignments) {
      if (a.provider?.id) set.add(a.provider.id);
    }
    return set.size;
  }, [data]);

  const masCount = data?.assignments.length ?? 0;
  const badge = badgeFor(providersCount, masCount);

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={props.onClose}
        aria-hidden={!open}
      />
      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} aria-label="Daily roster drawer">
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Daily roster</div>
            <div className={styles.subtitle}>{isoDate ? formatLong(isoDate) : ""}</div>
          </div>
          <button type="button" className={styles.close} onClick={props.onClose}>
            Close
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.metricRow} aria-label="Daily balance">
            <div style={{ fontSize: 13, fontWeight: 650 }}>Balance</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {providersCount}P / {masCount}MA
              </div>
              <span className={badge.className}>{badge.text}</span>
            </div>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.tableWrap} aria-label="Roster table">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Medical assistant</th>
                  <th className={styles.th}>Provider</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className={styles.td}>
                        <div className="nls-skeleton" style={{ width: 170, height: 14 }} />
                      </td>
                      <td className={styles.td}>
                        <div className="nls-skeleton" style={{ width: 120, height: 14 }} />
                      </td>
                    </tr>
                  ))
                ) : data && data.assignments.length === 0 ? (
                  <tr>
                    <td className={styles.td} colSpan={2}>
                      <span className={styles.muted}>No assignments for this date.</span>
                    </td>
                  </tr>
                ) : (
                  data?.assignments.map((row) => (
                    <tr key={row.employee.id}>
                      <td className={styles.td}>{row.employee.name}</td>
                      <td className={styles.td}>
                        {row.provider ? (
                          row.provider.name
                        ) : (
                          <span className={`${styles.pill} ${styles.pillUnassigned}`}>Unassigned</span>
                        )}
                      </td>
                    </tr>
                  )) ?? null
                )}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </>
  );
}

