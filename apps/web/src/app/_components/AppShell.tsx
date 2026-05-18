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

/* ── Icons ──────────────────────────────────────────────── */
function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3v3m8-3v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="4" y="6" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconArrowsSwap() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7h12m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H5m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13.2V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 13.2 6.2 19a2 2 0 0 0 1.87 1.3h7.86A2 2 0 0 0 17.8 19l2.2-5.8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.2 14h5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 4 7v5c0 4.41 3.47 8.53 8 9.5C16.53 20.53 20 16.41 20 12V7l-8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLogOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Nav config ─────────────────────────────────────────── */
type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  managerOnly?: boolean;
  section?: "employee" | "manager";
};

const EMPLOYEE_NAV: NavItem[] = [
  { href: "/schedule", label: "Schedule", icon: <IconCalendar />, section: "employee" },
  { href: "/requests", label: "Swap Board", icon: <IconArrowsSwap />, section: "employee" },
  { href: "/my-swaps", label: "My Requests", icon: <IconInbox />, section: "employee" },
];

const MANAGER_NAV: NavItem[] = [
  { href: "/admin", label: "Admin Hub", icon: <IconShield />, section: "manager" },
];

const DEVELOPER_NAV: NavItem[] = [
  { href: "/admin/users", label: "Users", icon: <IconUsers />, section: "manager" },
];

/* ── Helpers ────────────────────────────────────────────── */
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/schedule") return pathname === "/schedule" || pathname.startsWith("/schedule/");
  if (href === "/requests") return pathname === "/requests" || pathname.startsWith("/requests/") || pathname === "/swap-board" || pathname.startsWith("/swap-board/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function avatarInitials(user: SessionUser) {
  const src = user.name ?? user.email ?? "?";
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return src[0].toUpperCase();
}

function pageCrumb(pathname: string) {
  if (pathname === "/schedule" || pathname.startsWith("/schedule/")) return "Schedule";
  if (pathname === "/requests" || pathname.startsWith("/requests/") || pathname === "/swap-board" || pathname.startsWith("/swap-board/")) return "Swap Board";
  if (pathname === "/my-swaps") return "My Requests";
  if (pathname === "/admin") return "Admin";
  if (pathname.startsWith("/admin/schedule")) return "Schedule Editor";
  if (pathname.startsWith("/admin/providers")) return "Provider Schedules";
  if (pathname.startsWith("/admin/rules")) return "Pairing Rules";
  if (pathname.startsWith("/admin/requests")) return "Swap Requests";
  if (pathname.startsWith("/admin/balance")) return "Staffing Balance";
  if (pathname.startsWith("/admin/audit")) return "Audit Log";
  if (pathname.startsWith("/admin/users")) return "User Management";
  if (pathname.startsWith("/admin/")) return "Admin";
  return "Next Level";
}

function isAdminSection(pathname: string) {
  return pathname.startsWith("/admin");
}

/* ── Sign-out ───────────────────────────────────────────── */
function SignOutButton() {
  const router = useRouter();
  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button type="button" className={styles.signOutBtn} onClick={handleSignOut} title="Sign out">
      <IconLogOut />
    </button>
  );
}

/* ── NavLink ────────────────────────────────────────────── */
function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
    >
      <span className={styles.navIcon}>{item.icon}</span>
      <span className={styles.navLabel}>{item.label}</span>
    </Link>
  );
}

/* ── Sidebar ────────────────────────────────────────────── */
function Sidebar({ user, pathname }: { user: SessionUser; pathname: string }) {
  const isManager = user.role === "manager" || user.role === "developer";
  const isDeveloper = user.role === "developer";
  const roleLabel = isDeveloper ? "Developer" : isManager ? "Manager" : "Employee";

  const roleDotClass = isDeveloper
    ? styles.dotDev
    : isManager
    ? styles.dotManager
    : styles.dotEmployee;

  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <span>NL</span>
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Next Level</span>
          <span className={styles.brandSub}>Scheduling</span>
        </div>
      </div>

      <div className={styles.navContainer}>
        {/* Employee nav */}
        <nav aria-label="Employee navigation">
          <div className={styles.navSection}>
            <span className={styles.navSectionLabel}>My workspace</span>
            {EMPLOYEE_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>

          {/* Manager / Developer nav */}
          {isManager && (
            <div className={styles.navSection}>
              <span className={styles.navSectionLabel}>Management</span>
              {MANAGER_NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
              {isDeveloper && DEVELOPER_NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar} aria-hidden="true">
            {avatarInitials(user)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name ?? user.email}</span>
            <span className={styles.userRoleRow}>
              <span className={`${styles.roleDot} ${roleDotClass}`} aria-hidden="true" />
              <span className={styles.userRole}>{roleLabel}</span>
            </span>
          </div>
          <div className={styles.userActions}>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile header ──────────────────────────────────────── */
function MobileHeader({ user, pathname }: { user: SessionUser; pathname: string }) {
  const crumb = pageCrumb(pathname);
  return (
    <header className={styles.mobileHeader}>
      <div className={styles.mobileBrandMark}>NL</div>
      <h1 className={styles.mobileTitle}>{crumb}</h1>
      <div className={styles.mobileHeaderRight}>
        <ThemeToggle />
        <div className={styles.mobileAvatar}>{avatarInitials(user)}</div>
      </div>
    </header>
  );
}

/* ── Mobile bottom nav ──────────────────────────────────── */
function MobileBottomNav({ user, pathname }: { user: SessionUser; pathname: string }) {
  const isManager = user.role === "manager" || user.role === "developer";

  const tabs = [
    { href: "/schedule", label: "Schedule", icon: <IconCalendar /> },
    { href: "/requests", label: "Board", icon: <IconArrowsSwap /> },
    { href: "/my-swaps", label: "My Swaps", icon: <IconInbox /> },
    ...(isManager ? [{ href: "/admin", label: "Admin", icon: <IconShield /> }] : []),
  ];

  return (
    <nav className={styles.bottomNav} aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.bottomTab} ${active ? styles.bottomTabActive : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.bottomTabIcon}>{tab.icon}</span>
            <span className={styles.bottomTabLabel}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Topbar ─────────────────────────────────────────────── */
function Topbar({ user, pathname }: { user: SessionUser; pathname: string }) {
  const crumb = pageCrumb(pathname);
  const inAdmin = isAdminSection(pathname);

  return (
    <div className={styles.topBar} aria-label="Top bar">
      <div className={styles.topBarLeft}>
        <div className={styles.breadcrumbs}>
          <span className={styles.breadcrumbRoot}>Next Level</span>
          <IconChevronRight />
          {inAdmin && pathname !== "/admin" && (
            <>
              <Link href="/admin" className={styles.breadcrumbLink}>Admin</Link>
              <IconChevronRight />
            </>
          )}
          <span className={styles.breadcrumbCurrent}>{crumb}</span>
        </div>
      </div>
      <div className={styles.topBarRight}>
        <div className={styles.userChip}>
          <span className={styles.userChipAvatar}>{avatarInitials(user)}</span>
          <span className={styles.userChipName}>{user.name?.split(" ")[0] ?? user.email}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Shell ──────────────────────────────────────────────── */
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

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">Skip to content</a>

      {/* Desktop sidebar */}
      <Sidebar user={user} pathname={pathname} />

      {/* Main content column */}
      <div className={styles.mainColumn}>
        {/* Desktop topbar */}
        <Topbar user={user} pathname={pathname} />

        {/* Mobile header */}
        <MobileHeader user={user} pathname={pathname} />

        <main id="main" className={styles.main}>
          <div key={pathname} className={`${styles.content} ${styles.pageEnter}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav user={user} pathname={pathname} />
    </div>
  );
}
