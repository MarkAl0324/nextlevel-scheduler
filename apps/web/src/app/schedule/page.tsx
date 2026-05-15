import { auth } from "@/auth";
import { getSchedulePageData } from "@/lib/serverData";
import { WeekNav } from "./_components/WeekNav";
import { TeamGrid } from "./_components/TeamGrid";
import styles from "./page.module.css";

function formatWeekRange(startIso: string, endIso: string) {
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
  };
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${fmt(startIso)} – ${fmt(endIso)}, ${start.getFullYear()}`
    : `${fmt(startIso)}, ${start.getFullYear()} – ${fmt(endIso)}, ${end.getFullYear()}`;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const weekParam = params.week ?? null;
  const employeeProfileId = session?.user?.employeeProfileId ?? null;

  const data = await getSchedulePageData(employeeProfileId, weekParam);

  const weekLabel = formatWeekRange(data.weekStartIso, data.weekEndIso);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Schedule</h1>
          {data.currentEmployee && (
            <p className={styles.subtitle}>
              Viewing as <strong>{data.currentEmployee.name}</strong>
            </p>
          )}
        </div>
        <WeekNav
          label={weekLabel}
          prevWeekIso={data.prevWeekIso}
          nextWeekIso={data.nextWeekIso}
        />
      </header>

      <TeamGrid days={data.days} employees={data.employees} />
    </div>
  );
}
