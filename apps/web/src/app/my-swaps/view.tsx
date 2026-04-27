"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./page.module.css";
import { canAcceptProposalDemo, getDemoMySwaps } from "@/lib/demoData";
import { MySwapsTabs } from "./tabs";

function formatLong(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d);
}

export function MySwapsClient() {
  const { current, myPosts, incomingProposals, myProposals } = getDemoMySwaps();
  const [incoming, setIncoming] = useState(incomingProposals);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; title: string; text: string } | null>(null);

  const incomingByTab = useMemo(() => incoming, [incoming]);

  const decline = (proposalId: string) => {
    setIncoming((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: "declined" as const } : p)),
    );
    setToast({ kind: "ok", title: "Declined", text: "Request response declined." });
  };

  const accept = (postId: string, proposalId: string) => {
    const res = canAcceptProposalDemo({ postId, proposalId });
    if (!res.ok) {
      setToast({ kind: "err", title: "Blocked", text: res.reason });
      return;
    }
    setIncoming((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) return { ...p, status: "accepted" as const };
        if (p.postId === postId && p.status === "pending") return { ...p, status: "declined" as const };
        return p;
      }),
    );
    setToast({ kind: "ok", title: "Accepted", text: "Request response accepted. Pending schedule update." });
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Requests</h1>
          <div className={styles.subtitle}>
            Signed in as <strong>{current.name}</strong>. Track your schedule requests and responses.
          </div>
        </div>
        <MySwapsTabs />
      </div>

      <MySwapsTabs.Content
        render={({ tab }) => {
          if (tab === "posts") {
            return (
              <div className={styles.list} aria-label="My schedule requests">
                {myPosts.length === 0 ? (
                  <div className={styles.subtitle}>You have not requested schedule coverage yet.</div>
                ) : (
                  myPosts.map((p) => (
                    <div key={p.id} className={styles.card}>
                      <div className={styles.cardLeft}>
                        <div className={styles.primaryLine}>My request: {formatLong(p.targetDate)}</div>
                        <div className={styles.secondaryLine}>Status: {p.status}</div>
                      </div>
                      <div className={styles.actions}>
                        <Link className={styles.link} href={`/requests/${p.id}`}>
                          Open request
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          }

          if (tab === "incoming") {
            return (
              <div className={styles.list} aria-label="Incoming request responses">
                {toast ? (
                  <div className={`${styles.toast} ${toast.kind === "ok" ? styles.toastOk : styles.toastErr}`}>
                    <div className={styles.toastTitle}>{toast.title}</div>
                    <div>{toast.text}</div>
                  </div>
                ) : null}

                {incomingByTab.length === 0 ? (
                  <div className={styles.subtitle}>No incoming responses need review.</div>
                ) : (
                  incomingByTab.map((p) => (
                    <div key={p.id} className={styles.card}>
                      <div className={styles.cardLeft}>
                        <div className={styles.primaryLine}>
                          {p.proposer.name} offers {formatLong(p.offeredDate)}
                        </div>
                        <div className={styles.secondaryLine}>
                          For your request: {formatLong(p.post.targetDate)} -{" "}
                          <span
                            className={`${styles.pill} ${
                              p.status === "pending"
                                ? styles.pillPending
                                : p.status === "declined"
                                  ? styles.pillDeclined
                                  : ""
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonPrimary}`}
                          disabled={p.status !== "pending"}
                          onClick={() => accept(p.postId, p.id)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonDanger}`}
                          disabled={p.status !== "pending"}
                          onClick={() => decline(p.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          }

          return (
            <div className={styles.list} aria-label="My coverage offers">
              {myProposals.length === 0 ? (
                <div className={styles.subtitle}>You have not offered coverage on any requests yet.</div>
              ) : (
                myProposals.map((p) => (
                  <div key={p.id} className={styles.card}>
                    <div className={styles.cardLeft}>
                      <div className={styles.primaryLine}>
                        I offered {formatLong(p.offeredDate)} to {p.post.owner.name}
                      </div>
                      <div className={styles.secondaryLine}>
                        On their request: {formatLong(p.post.targetDate)} -{" "}
                        <span
                          className={`${styles.pill} ${
                            p.status === "pending"
                              ? styles.pillPending
                              : p.status === "declined"
                                ? styles.pillDeclined
                                : ""
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <Link className={styles.link} href={`/requests/${p.post.id}`}>
                        Open request
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
