import Link from "next/link";
import styles from "./page.module.css";
import { getSwapBoardData } from "@/lib/serverData";

function formatMonthDay(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

function requestStatusLabel(status: string) {
  if (status === "posted") return "Needs coverage";
  if (status === "expired") return "Closed";
  return status.replaceAll("-", " ");
}

export default async function SwapBoardPage() {
  const { posts } = await getSwapBoardData();

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Requests</h1>
          <div className={styles.subtitle}>Coverage and swap requests that may affect the schedule.</div>
        </div>
      </div>

      <div className={styles.list} aria-label="Schedule requests">
        {posts.length === 0 ? (
          <div className={styles.subtitle}>No active requests.</div>
        ) : (
          posts.map((p) => {
            const statusClass =
              p.status === "posted" ? `${styles.badge} ${styles.badgePosted}` : `${styles.badge} ${styles.badgeExpired}`;
            const statusLabel = requestStatusLabel(p.status);
            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <div className={styles.primaryLine}>
                    {p.owner.name} needs coverage for <strong>{formatMonthDay(p.targetDate)}</strong>
                  </div>
                  <div className={styles.secondaryLine}>Worker request - schedule-safe approval required</div>
                  {p.note ? <div className={styles.note}>{p.note}</div> : null}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className={statusClass}>{statusLabel}</span>
                  <Link className={styles.link} href={`/requests/${p.id}`}>
                    Open request
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
