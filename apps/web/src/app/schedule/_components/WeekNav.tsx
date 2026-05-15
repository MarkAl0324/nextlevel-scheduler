"use client";

import { useRouter } from "next/navigation";
import styles from "./WeekNav.module.css";

type Props = {
  label: string;
  prevWeekIso: string;
  nextWeekIso: string;
};

export function WeekNav({ label, prevWeekIso, nextWeekIso }: Props) {
  const router = useRouter();

  return (
    <div className={styles.nav}>
      <button
        className={styles.arrow}
        onClick={() => router.push(`/schedule?week=${prevWeekIso}`)}
        aria-label="Previous week"
      >
        ‹
      </button>
      <span className={styles.label}>{label}</span>
      <button
        className={styles.arrow}
        onClick={() => router.push(`/schedule?week=${nextWeekIso}`)}
        aria-label="Next week"
      >
        ›
      </button>
    </div>
  );
}
