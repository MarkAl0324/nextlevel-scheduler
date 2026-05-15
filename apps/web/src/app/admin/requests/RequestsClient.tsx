"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminCancelSwapPost } from "@/lib/actions/schedule";
import type { AdminRequestRow } from "@/lib/adminData";
import styles from "./page.module.css";

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

function statusClass(status: string) {
  if (status === "posted") return `${styles.pill} ${styles.pillPosted}`;
  if (status === "completed") return `${styles.pill} ${styles.pillCompleted}`;
  return `${styles.pill} ${styles.pillOther}`;
}

function statusLabel(status: string) {
  if (status === "posted") return "Open";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  if (status === "expired") return "Expired";
  return status;
}

export function RequestsClient({ posts }: { posts: AdminRequestRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel(postId: string) {
    startTransition(async () => {
      const result = await adminCancelSwapPost(postId);
      if (!result.ok) alert(result.error);
      else router.refresh();
    });
  }

  if (posts.length === 0) {
    return <div className={styles.empty}>No swap requests yet.</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Employee</th>
            <th className={styles.th}>Target shift</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Offers</th>
            <th className={styles.th}>Note</th>
            <th className={styles.th} />
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td className={styles.td}>{p.ownerName}</td>
              <td className={styles.td}>{formatDate(p.targetDate)}</td>
              <td className={styles.td}>
                <span className={statusClass(p.status)}>{statusLabel(p.status)}</span>
              </td>
              <td className={styles.td}>{p.proposalCount}</td>
              <td className={`${styles.td} ${styles.noteCell}`}>{p.note ?? "—"}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <Link className={styles.viewLink} href={`/requests/${p.id}`}>
                    View
                  </Link>
                  {p.status === "posted" && (
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      disabled={isPending}
                      onClick={() => handleCancel(p.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
