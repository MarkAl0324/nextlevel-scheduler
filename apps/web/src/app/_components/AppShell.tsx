"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AppShell.module.css";
import { ThemeToggle } from "./ThemeToggle";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  role: "employee" | "manager" | "developer";
  employeeProfileId: string | null;
};

type NavItem = {
  href: string;
  label: string;
  managerOnly?: boolean;
  icon: (props: { className: string }) => React.ReactNode;
};

function IconCalendar(props: { className: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3v3m8-3v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 6h11A2.5 2.5 0 0 1 20 8.5v11A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-11A2.5 2.5 0 0 1 6.5 6Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconArrowsSwap(props: { className: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7h12m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H5m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInbox(props: { className: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13.2V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 13.2 6.2 19a2 2 0 0 0 1.87 1.3h7.86A2 2 0 0 0 17.8 19l2.2-5.8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.2 14h5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings(props: { className: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 14.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 13.3V10.7l-2-.7a7.6 7.6 0 0 0-.7-1.2l.9-1.9-1.8-1.8-1.9.9a7.6 7.6 0 0 0-1.2-.7l-.7-2H10.7l-.7 2a7.6 7.6 0 0 0-1.2.7l-1.9-.9L5.1 6.9l.9 1.9a7.6 7.6 0 0 0-.7 1.2l-2 .7v2.6l2 .7c.2.4.4.8.7 1.2l-.9 1.9 1.8 1.8 1.9-.9c.4.3.8.5 1.2.7l.7 2h2.6l.7-2c.4-.2.8-.4 1.2-.7l1.9.9 1.8-1.8-.9-1.9c.3-.4.5-.8.7-1.2l2-.7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: "/schedule", label: "Schedule", icon: (p) => <IconCalendar {...p} /> },
  { href: "/requests", label: "Swap Board", icon: (p) => <IconArrowsSwap {...p} /> },
  { href: "/my-swaps", label: "My Requests", icon: (p) => <IconInbox {...p} /> },
  { href: "/admin", label: "Admin", managerOnly: true, icon: (p) => <IconSettings {...p} /> },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function avatarInitial(user: SessionUser) {
  return (user.name ?? user.email ?? "?")[0].toUpperCase();
}

function SignOutForm() {
  const router = useRouter();
  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button type="button" className={styles.signOut} onClick={handleSignOut}>
      Sign out
    </button>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
}) {
  const pathname = usePathname() ?? "/";

  if (!user) {
    return <>{children}</>;
  }

  const visibleNav = NAV.filter((item) => !item.managerOnly || user.role === "manager" || user.role === "developer");

  const crumb = (() => {
    if (pathname.startsWith("/schedule")) return "Schedule";
    if (pathname.startsWith("/requests") || pathname.startsWith("/swap-board")) return "Swap Board";
    if (pathname.startsWith("/my-swaps")) return "My Requests";
    if (pathname === "/admin") return "Admin";
    if (pathname.startsWith("/admin/schedule")) return "Admin / Schedule Editor";
    if (pathname.startsWith("/admin/providers")) return "Admin / Providers";
    if (pathname.startsWith("/admin/rules")) return "Admin / Pairing Rules";
    if (pathname.startsWith("/admin/requests")) return "Admin / Swap Requests";
    if (pathname.startsWith("/admin/balance")) return "Admin / Balance";
    if (pathname.startsWith("/admin/audit")) return "Admin / Audit Log";
    if (pathname.startsWith("/admin/users")) return "Admin / User Management";
    if (pathname.startsWith("/admin")) return "Admin";
    return "Next Level";
  })();

  const roleLabel = user.role === "manager" ? "Manager" : user.role === "developer" ? "Developer" : "Employee";

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>

      <aside className={styles.sidebar} aria-label="Primary">
        <div className={styles.brand}>
          <div className={styles.brandTitle}>Next Level</div>
          <div className={styles.brandSubtitle}>Scheduling</div>
        </div>

        <nav className={styles.nav} aria-label="Navigation">
          {visibleNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              >
                {item.icon({ className: styles.navIcon })}
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div className={styles.avatar} aria-hidden="true">
              {avatarInitial(user)}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name ?? user.email}</span>
              <span className={styles.userRole}>{roleLabel}</span>
            </div>
          </div>
          <div className={styles.footerActions}>
            <ThemeToggle />
            <SignOutForm />
          </div>
        </div>
      </aside>

      <main id="main" className={styles.main}>
        <div className={styles.topBar} aria-label="Top bar">
          <div className={styles.topBarInner}>
            <div className={styles.crumbs}>
              <span>Next Level</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span className={styles.crumbStrong}>{crumb}</span>
            </div>
          </div>
        </div>
        <div key={pathname} className={`${styles.content} ${styles.pageTransition}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
