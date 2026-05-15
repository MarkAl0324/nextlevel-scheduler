import Link from "next/link";
import { auth } from "@/auth";
import styles from "./page.module.css";

function IconCalendar() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3v3m8-3v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 6h11A2.5 2.5 0 0 1 20 8.5v11A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-11A2.5 2.5 0 0 1 6.5 6Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconUserClock() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="17" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M18 15.2v1.8l1.2 1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowsSwap() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7h12m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H5m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const sections = [
  {
    href: "/admin/schedule",
    label: "Schedule Editor",
    description: "Assign employees to shifts and link them to providers. Navigate by week.",
    icon: <IconCalendar />,
  },
  {
    href: "/admin/providers",
    label: "Provider Schedules",
    description: "Manage which providers are working each day of the week.",
    icon: <IconUserClock />,
  },
  {
    href: "/admin/rules",
    label: "Pairing Rules",
    description: "Define required MA pairing for providers on specific days. Violated pairings block swaps.",
    icon: <IconLink />,
  },
  {
    href: "/admin/requests",
    label: "Swap Requests",
    description: "Review all employee coverage requests and cancel if needed.",
    icon: <IconArrowsSwap />,
  },
  {
    href: "/admin/balance",
    label: "Staffing Balance",
    description: "Day-by-day provider vs MA balance with roster drilldown.",
    icon: <IconBarChart />,
  },
  {
    href: "/admin/audit",
    label: "Audit Log",
    description: "Chronological record of all schedule changes, swap events, and manager actions.",
    icon: <IconClock />,
  },
] as const;

const developerSection = {
  href: "/admin/users",
  label: "User Management",
  description: "Create and manage employee, manager, and developer accounts.",
  icon: <IconUsers />,
};

export default async function AdminPage() {
  const session = await auth();
  const isDeveloper = session?.user?.role === "developer";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin</h1>
        <p className={styles.subtitle}>
          {isDeveloper
            ? "Developer tools for managing accounts and reviewing system activity."
            : "Manager tools for building and maintaining the schedule."}
        </p>
      </div>

      <div className={styles.grid}>
        {isDeveloper && (
          <Link href={developerSection.href} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>{developerSection.icon}</div>
              <div className={styles.cardLabel}>{developerSection.label}</div>
            </div>
            <div className={styles.cardDesc}>{developerSection.description}</div>
            <div className={styles.cardArrow}>→</div>
          </Link>
        )}
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>{s.icon}</div>
              <div className={styles.cardLabel}>{s.label}</div>
            </div>
            <div className={styles.cardDesc}>{s.description}</div>
            <div className={styles.cardArrow}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
