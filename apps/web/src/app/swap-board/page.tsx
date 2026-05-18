import Link from "next/link";
import styles from "./page.module.css";
import { getSwapBoardData } from "@/lib/serverData";

function formatMonthDay(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

function formatRelative(createdAt: Date | string | null | undefined) {
  if (!createdAt) return null;
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function avatarInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0]?.toUpperCase() ?? "?";
}

function requestStatusLabel(status: string) {
  if (status === "posted") return "Open";
  if (status === "expired") return "Closed";
  return status.replaceAll("-", " ");
}

export default async function SwapBoardPage() {
  const { posts } = await getSwapBoardData();
  const activePosts = posts.filter((p) => p.status === "posted");
  const closedPosts = posts.filter((p) => p.status !== "posted");

  return (
    <div>
      <div className={styles.list} aria-label="Schedule requests">
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <strong>No open requests</strong>
            No one has posted a shift for swap yet.
          </div>
        ) : (
          <>
            {activePosts.map((p) => (
              <SwapCard key={p.id} post={p} />
            ))}
            {closedPosts.length > 0 && activePosts.length > 0 && (
              <div style={{ height: 4 }} />
            )}
            {closedPosts.map((p) => (
              <SwapCard key={p.id} post={p} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SwapCard({ post }: { post: Awaited<ReturnType<typeof getSwapBoardData>>["posts"][0] }) {
  const statusClass =
    post.status === "posted"
      ? `${styles.badge} ${styles.badgePosted}`
      : `${styles.badge} ${styles.badgeExpired}`;
  const statusLabel = requestStatusLabel(post.status);
  const relativeTime = formatRelative((post as any).createdAt);

  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.avatarRow}>
          <div className={styles.avatar} aria-hidden="true">
            {avatarInitials(post.owner.name ?? "?")}
          </div>
          <span className={styles.primaryLine}>
            {post.owner.name} &mdash; <strong>{formatMonthDay(post.targetDate)}</strong>
          </span>
        </div>
        <div className={styles.metaLine}>
          {relativeTime && (
            <span className={styles.metaChip}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {relativeTime}
            </span>
          )}
          {post.note && (
            <span className={styles.note}>&ldquo;{post.note}&rdquo;</span>
          )}
        </div>
      </div>

      <div className={styles.cardRight}>
        <span className={statusClass}>
          {post.status === "posted" && <span className={styles.liveDot} aria-hidden="true" />}
          {statusLabel}
        </span>
        <Link className={styles.openBtn} href={`/requests/${post.id}`}>
          View →
        </Link>
      </div>
    </div>
  );
}
