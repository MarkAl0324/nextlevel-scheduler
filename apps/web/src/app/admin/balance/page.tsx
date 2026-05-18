import Link from "next/link";
import styles from "./page.module.css";
import { getWeekBalanceData } from "@/lib/serverData";

function formatLong(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d);
}

function balanceBadge(providers: number, mas: number) {
  const delta = mas - providers;
  if (providers === 0 && mas === 0) return { text: "No staffing", className: styles.badge };
  if (delta === 0) return { text: "Balanced", className: `${styles.badge} ${styles.badgeBalanced}` };
  if (delta < 0) return { text: `${Math.abs(delta)} short`, className: `${styles.badge} ${styles.badgeUnder}` };
  return { text: `${delta} extra`, className: `${styles.badge} ${styles.badgeOver}` };
}

export default async function AdminBalancePage() {
  const week = await getWeekBalanceData();

  return (
    <div>
      <div className={styles.tableWrap} aria-label="Staffing balance table">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Providers</th>
              <th className={styles.th}>Medical assistants</th>
              <th className={styles.th}>Delta</th>
              <th className={styles.th} />
            </tr>
          </thead>
          <tbody>
            {week.map((d) => {
              const badge = balanceBadge(d.providersScheduled, d.medicalAssistantsScheduled);
              return (
                <tr key={d.date}>
                  <td className={styles.td}>{formatLong(d.date)}</td>
                  <td className={styles.td}>{d.providersScheduled}</td>
                  <td className={styles.td}>{d.medicalAssistantsScheduled}</td>
                  <td className={styles.td}>
                    <span className={badge.className}>{badge.text}</span>
                  </td>
                  <td className={styles.td}>
                    <Link className={styles.link} href={`/schedule/roster?date=${d.date}`}>
                      Open roster
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.subtitle} style={{ marginTop: 10 }}>
        Use this view to confirm daily balance and drill into staffing exceptions.
      </div>
    </div>
  );
}
