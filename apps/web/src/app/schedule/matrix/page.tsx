import Link from "next/link";
import styles from "./page.module.css";
import { ScheduleViewTabs } from "../_components/ScheduleViewTabs";
import { startOfWeekMonday, toIsoDate, type IsoDate } from "@/lib/demoData";
import { getWeeklyRosterMatrixData } from "@/lib/serverData";

function formatShort(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

export default async function ScheduleMatrixPage() {
  const weekStart = startOfWeekMonday(new Date());
  const weekStartIso = toIsoDate(weekStart) as IsoDate;
  const data = await getWeeklyRosterMatrixData({ weekStartIso });

  return (
    <div>
      <div className={styles.controls}>
        <ScheduleViewTabs />
      </div>

      <div className={styles.tableWrap} aria-label="Weekly roster matrix">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.thFirst}`}>Medical assistant</th>
              {data.days.map((d) => (
                <th key={d} className={styles.th}>
                  {formatShort(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.employees.map((e) => (
              <tr key={e.id}>
                <td className={`${styles.td} ${styles.tdFirst}`}>{e.name}</td>
                {data.days.map((d) => {
                  const cell = data.cells.get(`${e.id}:${d}`);
                  return (
                    <td key={d} className={styles.td}>
                      <div className={styles.cell}>
                        {cell?.providerName ? (
                          <div className={styles.provider}>{cell.providerName}</div>
                        ) : (
                          <span className={styles.unassigned}>Unassigned</span>
                        )}
                        <Link className={styles.link} href={`/schedule/roster?date=${d}`}>
                          View roster →
                        </Link>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

