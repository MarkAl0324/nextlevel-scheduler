"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ScheduleViewTabs.module.css";

type Tab = { href: string; label: string };

const TABS: Tab[] = [
  { href: "/schedule", label: "Week" },
  { href: "/schedule/month", label: "Month" },
  { href: "/schedule/matrix", label: "Matrix" },
];

function isActive(pathname: string, href: string) {
  if (href === "/schedule") return pathname === "/schedule";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ScheduleViewTabs() {
  const pathname = usePathname() ?? "/schedule";
  return (
    <div className={styles.tabs} role="tablist" aria-label="Schedule views">
      {TABS.map((t) => {
        const active = isActive(pathname, t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            role="tab"
            aria-selected={active}
            className={`${styles.tab} ${active ? styles.tabActive : ""}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

