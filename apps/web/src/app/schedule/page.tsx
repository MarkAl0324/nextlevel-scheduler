import Link from "next/link";
import styles from "./page.module.css";
import { getWeekOperationsBoardData, type WeekOperationsActionItem, type WeekOperationsDay } from "@/lib/serverData";
import { ScheduleViewTabs } from "./_components/ScheduleViewTabs";

function formatDayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
}

function formatMonthDay(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

function formatWeekRange(startIso: string, endIso: string) {
  return `${formatMonthDay(startIso)} - ${formatMonthDay(endIso)}`;
}

function dayStatusLabel(day: WeekOperationsDay) {
  if (day.status === "no-staffing") return "No staffing";
  if (day.status === "balanced") return "Balanced";
  if (day.status === "understaffed") return "Understaffed";
  return "Overstaffed";
}

function dayStatusClass(day: WeekOperationsDay) {
  if (day.status === "balanced") return `${styles.status} ${styles.statusBalanced}`;
  if (day.status === "understaffed") return `${styles.status} ${styles.statusUnder}`;
  if (day.status === "overstaffed") return `${styles.status} ${styles.statusOver}`;
  return styles.status;
}

function actionClass(item: WeekOperationsActionItem) {
  if (item.type === "blocked") return `${styles.actionLabel} ${styles.actionBlocked}`;
  if (item.type === "coverage-gap") return `${styles.actionLabel} ${styles.actionCoverage}`;
  return `${styles.actionLabel} ${styles.actionPending}`;
}

function cellClass(status: string) {
  if (status === "pairing-conflict") return `${styles.boardCell} ${styles.cellBlocked}`;
  if (status === "unassigned") return `${styles.boardCell} ${styles.cellNeedsCoverage}`;
  if (status === "assigned") return `${styles.boardCell} ${styles.cellAssigned}`;
  return `${styles.boardCell} ${styles.cellOff}`;
}

export default async function ScheduleWeekPage() {
  const board = await getWeekOperationsBoardData();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Week</h1>
          <p className={styles.subtitle}>{formatWeekRange(board.weekStartIso, board.weekEndIso)}</p>
        </div>
        <ScheduleViewTabs />
      </header>

      <section className={styles.summary} aria-label="Week staffing summary">
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{board.summary.understaffedDays}</span>
          <span className={styles.summaryLabel}>Understaffed days</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{board.summary.overstaffedDays}</span>
          <span className={styles.summaryLabel}>Overstaffed days</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{board.summary.pendingRequests}</span>
          <span className={styles.summaryLabel}>Pending requests</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{board.summary.blockedItems}</span>
          <span className={styles.summaryLabel}>Blocked items</span>
        </div>
      </section>

      <div className={styles.layout}>
        <section className={styles.boardPanel} aria-label="Weekly operations board">
          <div className={styles.boardScroller}>
            <table className={styles.boardTable}>
              <thead>
                <tr>
                  <th className={`${styles.th} ${styles.workerHeader}`}>Worker</th>
                  {board.days.map((day) => (
                    <th key={day.date} className={styles.th}>
                      <div className={styles.dayHeader}>
                        <div>
                          <div className={styles.dayName}>{formatDayLabel(day.date)}</div>
                          <Link className={styles.dayLink} href={`/schedule/roster?date=${day.date}`}>
                            {formatMonthDay(day.date)}
                          </Link>
                        </div>
                        <span className={dayStatusClass(day)}>{dayStatusLabel(day)}</span>
                      </div>
                      <div className={styles.dayCounts}>
                        <span>{day.providersScheduled} providers</span>
                        <span>{day.workersScheduled} workers</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {board.workers.map((worker) => (
                  <tr key={worker.id}>
                    <th className={`${styles.td} ${styles.workerCell}`} scope="row">
                      {worker.name}
                    </th>
                    {worker.cells.map((cell) => (
                      <td key={`${worker.id}-${cell.date}`} className={styles.td}>
                        <div className={cellClass(cell.status)}>
                          <span className={styles.cellLabel}>{cell.label}</span>
                          {cell.providerName && cell.providerName !== cell.label ? (
                            <span className={styles.cellDetail}>{cell.providerName}</span>
                          ) : null}
                          {cell.detail ? <span className={styles.cellDetail}>{cell.detail}</span> : null}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className={styles.queuePanel} aria-label="Action queue">
          <div className={styles.queueHeader}>
            <h2 className={styles.queueTitle}>Action queue</h2>
            <span className={styles.queueCount}>{board.actionItems.length}</span>
          </div>
          {board.actionItems.length === 0 ? (
            <div className={styles.emptyQueue}>No pending coverage or blocked items for this week.</div>
          ) : (
            <div className={styles.actionList}>
              {board.actionItems.map((item) => {
                const content = (
                  <>
                    <span className={actionClass(item)}>{item.label}</span>
                    <span className={styles.actionTitle}>{item.title}</span>
                    <span className={styles.actionDetail}>{item.detail}</span>
                  </>
                );
                return item.href ? (
                  <Link key={item.id} className={styles.actionItem} href={item.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id} className={styles.actionItem}>
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
