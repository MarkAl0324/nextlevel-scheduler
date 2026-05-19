import Link from "next/link";
import styles from "./page.module.css";
import { getSwapBoardData } from "@/lib/serverData";
import { StatusChip } from "@/app/_components/StatusChip";

function formatFullDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

function formatRelative(createdAt: Date | string | null | undefined) {
  if (!createdAt) return null;
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
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

function CalendarIconSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3v3m8-3v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="4" y="6" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
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
              <div className={styles.sectionDivider} aria-hidden="true">
                <span>Closed</span>
              </div>
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

function SwapCard({
  post,
}: {
  post: Awaited<ReturnType<typeof getSwapBoardData>>["posts"][0];
}) {
  const relativeTime = formatRelative(post.createdAtIso);
  const isOpen = post.status === "posted";

  return (
    <article className={styles.card}>
      {/* Header: avatar + name + posted time */}
      <header className={styles.cardHeader}>
        <div className={styles.avatar} aria-hidden="true">
          {avatarInitials(post.owner.name ?? "?")}
        </div>
        <div className={styles.cardHeaderText}>
          <span className={styles.authorName}>{post.owner.name}</span>
          {relativeTime && (
            <span className={styles.posted}>Posted {relativeTime}</span>
          )}
        </div>
      </header>

      {/* Shift block: date + provider in tinted panel */}
      <div className={styles.shiftBlock}>
        <div className={styles.shiftLabel}>
          <CalendarIconSmall />
          <span>Wants to swap out</span>
        </div>
        <div className={styles.shiftDate}>{formatFullDate(post.targetDate)}</div>
        {post.provider && (
          <div className={styles.shiftProviderRow}>
            <span className={styles.shiftProviderDot} aria-hidden="true" />
            <span className={styles.shiftProviderName}>{post.provider.name}</span>
          </div>
        )}
      </div>

      {/* Quoted reason */}
      {post.note && (
        <div className={styles.reason}>&ldquo;{post.note}&rdquo;</div>
      )}

      {/* Footer: status + action */}
      <footer className={styles.cardFooter}>
        <StatusChip status={post.status} size="md" />
        <Link className={styles.proposeBtn} href={`/requests/${post.id}`}>
          {isOpen ? "Propose →" : "View →"}
        </Link>
      </footer>
    </article>
  );
}
