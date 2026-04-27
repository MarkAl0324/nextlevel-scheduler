import styles from "./page.module.css";
import { getBalanceRangeData } from "@/lib/serverData";
import type { IsoDate } from "@/lib/demoData";
import { MonthClient } from "./view";

type Cell = {
  isoDate: IsoDate;
  inMonth: boolean;
  providers: number;
  mas: number;
};

function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonthUTCExclusive(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

function toIsoUTC(d: Date): IsoDate {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}` as IsoDate;
}

function monthLabel(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)),
  );
}

function getBalanceBadge(providers: number, mas: number) {
  const delta = mas - providers;
  if (providers === 0 && mas === 0) return { text: "—", className: styles.badge };
  if (delta === 0) return { text: "Balanced", className: `${styles.badge} ${styles.badgeBalanced}` };
  if (delta < 0) return { text: `${Math.abs(delta)} short`, className: `${styles.badge} ${styles.badgeUnder}` };
  return { text: `${delta} extra`, className: `${styles.badge} ${styles.badgeOver}` };
}

export default async function ScheduleMonthPage() {
  const now = new Date();
  const monthStart = startOfMonthUTC(now);
  endOfMonthUTCExclusive(now);

  // Build a 6-week grid (42 days) starting from Monday before the 1st.
  const firstDay = new Date(monthStart);
  const weekday = firstDay.getUTCDay(); // 0=Sun..6=Sat
  const diff = (weekday + 6) % 7; // Mon=0..Sun=6
  firstDay.setUTCDate(firstDay.getUTCDate() - diff);

  const gridDays = 42;
  const rangeStartIso = toIsoUTC(firstDay);
  const rangeEnd = new Date(firstDay);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + gridDays);
  const rangeEndIso = toIsoUTC(rangeEnd);

  const range = await getBalanceRangeData({ startIso: rangeStartIso, endIsoExclusive: rangeEndIso });
  const byDate = new Map(range.map((d) => [d.date, d]));

  const cells: Cell[] = Array.from({ length: gridDays }, (_, i) => {
    const d = new Date(firstDay);
    d.setUTCDate(d.getUTCDate() + i);
    const isoDate = toIsoUTC(d);
    const inMonth = d.getUTCMonth() === monthStart.getUTCMonth();
    const rec = byDate.get(isoDate);
    return {
      isoDate,
      inMonth,
      providers: rec?.providersScheduled ?? 0,
      mas: rec?.medicalAssistantsScheduled ?? 0,
    };
  });

  return (
    <MonthClient
      title="Schedule"
      subtitle={`${monthLabel(now)} • Click a day to view the roster.`}
      cells={cells.map((c) => ({
        isoDate: c.isoDate,
        inMonth: c.inMonth,
        providers: c.providers,
        mas: c.mas,
        badge: getBalanceBadge(c.providers, c.mas),
      }))}
    />
  );
}

