import Link from "next/link";
import styles from "./page.module.css";
import { startOfWeekMonday, toIsoDate, type IsoDate } from "@/lib/demoData";
import { getRosterData } from "@/lib/serverData";

function formatLong(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(d);
}

function isIsoDate(v: unknown): v is IsoDate {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export default async function DailyRosterPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Next.js provides `searchParams` as a plain object in runtime; keep this flexible for type-checking.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sp: any = searchParams as any;
  const dateParam = sp?.date;
  const date = isIsoDate(dateParam) ? dateParam : toIsoDate(new Date());

  const roster = await getRosterData(date);

  const weekStart = startOfWeekMonday(new Date(`${date}T00:00:00`));
  const weekDates = Array.from({ length: 7 }, (_, i) => toIsoDate(new Date(weekStart.getTime() + i * 86400000)));

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daily roster</h1>
          <div className={styles.subtitle}>
            {formatLong(roster.date)} •{" "}
            <Link href="/schedule" className={styles.muted}>
              Back to week
            </Link>
          </div>
        </div>

        <div className={styles.controls} aria-label="Date selection">
          {weekDates.map((d) => (
            <Link key={d} className={styles.pill} href={`/schedule/roster?date=${d}`}>
              {d.slice(5)}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Medical assistant</th>
              <th className={styles.th}>Provider</th>
            </tr>
          </thead>
          <tbody>
            {roster.assignments.length === 0 ? (
              <tr>
                <td className={styles.td} colSpan={2}>
                  <span className={styles.muted}>No assignments for this date.</span>
                </td>
              </tr>
            ) : (
              roster.assignments.map((row) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

