"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminProvidersData } from "@/lib/adminData";
import { createProviderSchedule, deleteProviderSchedule } from "@/lib/actions/schedule";
import styles from "./page.module.css";

function formatWeekRange(startIso: string, endIso: string) {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      new Date(`${iso}T00:00:00`),
    );
  const year = new Date(`${startIso}T00:00:00`).getFullYear();
  return `${fmt(startIso)} – ${fmt(endIso)}, ${year}`;
}

export function ProvidersClient({ data }: { data: AdminProvidersData }) {
  const { providers, days, weekStartIso, weekEndIso, prevWeekIso, nextWeekIso } = data;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navWeek(iso: string) {
    router.push(`/admin/providers?week=${iso}`);
  }

  function toggleDay(providerId: string, date: string, scheduleId: string | null) {
    startTransition(async () => {
      if (scheduleId) {
        const result = await deleteProviderSchedule(scheduleId);
        if (!result.ok) alert(result.error);
      } else {
        const result = await createProviderSchedule(providerId, date);
        if (!result.ok) alert(result.error);
      }
      router.refresh();
    });
  }

  return (
    <>
      {/* Week navigation */}
      <div className={styles.weekNav}>
        <button type="button" className={styles.navArrow} onClick={() => navWeek(prevWeekIso)} aria-label="Previous week">
          ‹
        </button>
        <span className={styles.navLabel}>{formatWeekRange(weekStartIso, weekEndIso)}</span>
        <button type="button" className={styles.navArrow} onClick={() => navWeek(nextWeekIso)} aria-label="Next week">
          ›
        </button>
      </div>

      {/* Grid */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Provider</th>
              {days.map((day) => (
                <th key={day.date} className={styles.th}>
                  <div className={styles.dayHead}>
                    <span className={styles.dayName}>{day.weekdayShort}</span>
                    <span className={styles.dayNum}>{day.monthDay}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => {
              const scheduledDates = new Map(provider.schedules.map((s) => [s.date, s.id]));
              return (
                <tr key={provider.id}>
                  <td className={`${styles.td} ${styles.nameCell}`}>{provider.name}</td>
                  {days.map((day) => {
                    const scheduleId = scheduledDates.get(day.date) ?? null;
                    const scheduled = scheduleId !== null;
                    return (
                      <td key={day.date} className={styles.td}>
                        <button
                          type="button"
                          className={`${styles.dayToggle} ${scheduled ? styles.dayToggleOn : styles.dayToggleOff}`}
                          disabled={isPending}
                          onClick={() => toggleDay(provider.id, day.date, scheduleId)}
                          aria-label={`${scheduled ? "Remove" : "Add"} ${provider.name} on ${day.date}`}
                          title={scheduled ? "Click to remove" : "Click to schedule"}
                        >
                          {scheduled ? "✓" : "+"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={styles.hint}>
        Click a cell to toggle whether a provider is scheduled on that day.
      </p>
    </>
  );
}
