"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import type { MySwapsData } from "@/lib/serverData";
import { MySwapsTabs } from "./tabs";
import { acceptSwapProposal, declineSwapProposal, cancelSwapPost } from "@/lib/actions/swaps";

function formatLong(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

type Toast = { kind: "ok" | "err"; title: string; text: string };

export function MySwapsClient({ data }: { data: MySwapsData }) {
  const { current, myPosts, incomingProposals, myProposals } = data;
  const [toast, setToast] = useState<Toast | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function showToast(t: Toast) {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }

  function handleAccept(postId: string, proposalId: string) {
    startTransition(async () => {
      const result = await acceptSwapProposal(postId, proposalId);
      if (result.ok) {
        showToast({ kind: "ok", title: "Accepted", text: "Swap applied. Schedule updated." });
        router.refresh();
      } else {
        showToast({ kind: "err", title: "Blocked", text: result.error });
      }
    });
  }

  function handleDecline(proposalId: string) {
    startTransition(async () => {
      const result = await declineSwapProposal(proposalId);
      if (result.ok) {
        showToast({ kind: "ok", title: "Declined", text: "Offer declined." });
        router.refresh();
      } else {
        showToast({ kind: "err", title: "Error", text: result.error });
      }
    });
  }

  function handleCancel(postId: string) {
    startTransition(async () => {
      const result = await cancelSwapPost(postId);
      if (result.ok) {
        showToast({ kind: "ok", title: "Cancelled", text: "Request cancelled." });
        router.refresh();
      } else {
        showToast({ kind: "err", title: "Error", text: result.error });
      }
    });
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Requests</h1>
          <div className={styles.subtitle}>
            Signed in as <strong>{current.name}</strong>. Track your schedule requests and offers.
          </div>
        </div>
        <MySwapsTabs />
      </div>

      {toast ? (
        <div className={`${styles.toast} ${toast.kind === "ok" ? styles.toastOk : styles.toastErr}`}>
          <div className={styles.toastTitle}>{toast.title}</div>
          <div>{toast.text}</div>
        </div>
      ) : null}

      <MySwapsTabs.Content
        render={({ tab }) => {
          if (tab === "posts") {
            return (
              <div className={styles.list} aria-label="My schedule requests">
                {myPosts.length === 0 ? (
                  <div className={styles.empty}>
                    No shift requests posted yet.
                  </div>
                ) : (
                  myPosts.map((p) => (
                    <div key={p.id} className={styles.card}>
                      <div className={styles.cardLeft}>
                        <div className={styles.primaryLine}>
                          My request: {formatLong(p.targetDate)}
                        </div>
                        <div className={styles.secondaryLine}>Status: {p.status}</div>
                      </div>
                      <div className={styles.actions}>
                        {p.status === "posted" && (
                          <button
                            type="button"
                            className={`${styles.button} ${styles.buttonDanger}`}
                            disabled={isPending}
                            onClick={() => handleCancel(p.id)}
                          >
                            Cancel
                          </button>
                        )}
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
              <div className={styles.list} aria-label="Incoming coverage offers">
                {incomingProposals.length === 0 ? (
                  <div className={styles.empty}>No incoming offers need review.</div>
                ) : (
                  incomingProposals.map((p) => (
                    <div key={p.id} className={styles.card}>
                      <div className={styles.cardLeft}>
                        <div className={styles.primaryLine}>
                          {p.proposer.name} offers {formatLong(p.offeredDate)}
                        </div>
                        <div className={styles.secondaryLine}>
                          For your request: {formatLong(p.post.targetDate)} —{" "}
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
                          disabled={isPending || p.status !== "pending"}
                          onClick={() => handleAccept(p.postId, p.id)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonDanger}`}
                          disabled={isPending || p.status !== "pending"}
                          onClick={() => handleDecline(p.id)}
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
                <div className={styles.empty}>
                  You have not offered coverage on any requests yet.
                </div>
              ) : (
                myProposals.map((p) => (
                  <div key={p.id} className={styles.card}>
                    <div className={styles.cardLeft}>
                      <div className={styles.primaryLine}>
                        I offered {formatLong(p.offeredDate)} to {p.post.owner.name}
                      </div>
                      <div className={styles.secondaryLine}>
                        On their request: {formatLong(p.post.targetDate)} —{" "}
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
