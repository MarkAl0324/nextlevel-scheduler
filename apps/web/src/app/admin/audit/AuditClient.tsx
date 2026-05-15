"use client";

import type { AuditRow } from "@/lib/adminData";
import styles from "./page.module.css";

const ACTION_LABELS: Record<string, { label: string; category: "swap" | "schedule" | "admin" }> = {
  SWAP_POSTED:                 { label: "Shift posted",             category: "swap" },
  SWAP_CANCELLED:              { label: "Shift post cancelled",     category: "swap" },
  SWAP_PROPOSED:               { label: "Swap proposed",            category: "swap" },
  SWAP_ACCEPTED:               { label: "Swap accepted",            category: "swap" },
  SWAP_DECLINED:               { label: "Proposal declined",        category: "swap" },
  ADMIN_CANCEL_SWAP:           { label: "Post cancelled by manager",category: "admin" },
  ASSIGNMENT_CREATED:          { label: "Assignment created",       category: "schedule" },
  ASSIGNMENT_DELETED:          { label: "Assignment removed",       category: "schedule" },
  ASSIGNMENT_PROVIDER_UPDATED: { label: "Provider updated",         category: "schedule" },
  PROVIDER_SCHEDULE_CREATED:   { label: "Provider day added",       category: "schedule" },
  PROVIDER_SCHEDULE_DELETED:   { label: "Provider day removed",     category: "schedule" },
  RULE_CREATED:                { label: "Pairing rule added",       category: "schedule" },
  RULE_DELETED:                { label: "Pairing rule removed",     category: "schedule" },
};

function buildSummary(action: string, detail: Record<string, unknown>): string {
  const str = (k: string) => (detail[k] as string | null | undefined) ?? "";
  switch (action) {
    case "SWAP_POSTED":
      return `${str("date")}`;
    case "SWAP_CANCELLED":
      return `Post for ${str("date")}`;
    case "SWAP_PROPOSED":
      return `Target ${str("targetDate")} ↔ Offered ${str("offeredDate")}`;
    case "SWAP_ACCEPTED":
      return `${str("ownerName")} ↔ ${str("proposerName")} · ${str("targetDate")} ↔ ${str("offeredDate")}`;
    case "SWAP_DECLINED":
      return `Proposal from ${str("proposerName")}`;
    case "ADMIN_CANCEL_SWAP":
      return `${str("ownerName")}'s post for ${str("date")}`;
    case "ASSIGNMENT_CREATED":
      return `${str("employeeName")} on ${str("date")}${str("providerName") ? ` with ${str("providerName")}` : ""}`;
    case "ASSIGNMENT_DELETED":
      return `${str("employeeName")} on ${str("date")}`;
    case "ASSIGNMENT_PROVIDER_UPDATED":
      return `${str("employeeName")} on ${str("date")} → ${str("providerName") || "unassigned"}`;
    case "PROVIDER_SCHEDULE_CREATED":
      return `${str("providerName")} on ${str("date")}`;
    case "PROVIDER_SCHEDULE_DELETED":
      return `${str("providerName")} on ${str("date")}`;
    case "RULE_CREATED":
      return `${str("providerName")} · ${str("weekday")} → ${str("employeeName")}`;
    case "RULE_DELETED":
      return `${str("providerName")} · ${str("weekday")} (${str("employeeName")})`;
    default:
      return "";
  }
}

function formatTimestamp(isoString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
}

function categoryClass(category: string, styles: Record<string, string>) {
  if (category === "swap") return `${styles.chip} ${styles.chipSwap}`;
  if (category === "admin") return `${styles.chip} ${styles.chipAdmin}`;
  return `${styles.chip} ${styles.chipSchedule}`;
}

export function AuditClient({ events }: { events: AuditRow[] }) {
  if (events.length === 0) {
    return <div className={styles.empty}>No audit events yet.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Audit Log</h1>
        <p className={styles.subtitle}>Last {events.length} events, newest first.</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>When</th>
              <th className={styles.th}>Actor</th>
              <th className={styles.th}>Event</th>
              <th className={styles.th}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const meta = ACTION_LABELS[e.action] ?? { label: e.action, category: "schedule" };
              return (
                <tr key={e.id}>
                  <td className={`${styles.td} ${styles.tsCell}`}>{formatTimestamp(e.createdAtIso)}</td>
                  <td className={styles.td}>{e.actorName}</td>
                  <td className={styles.td}>
                    <span className={categoryClass(meta.category, styles)}>{meta.label}</span>
                  </td>
                  <td className={`${styles.td} ${styles.detailCell}`}>
                    {buildSummary(e.action, e.detail)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
