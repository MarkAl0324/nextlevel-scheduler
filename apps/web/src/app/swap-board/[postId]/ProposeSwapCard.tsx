"use client";

import { useState, useTransition } from "react";
import styles from "./ProposeSwapCard.module.css";
import { createSwapProposal } from "@/lib/actions/swaps";

function formatDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

type MyAssignment = { id: string; date: string; providerName: string | null };

type Props = {
  postId: string;
  postOwnerId: string;
  currentEmployeeId: string;
  myAssignments: MyAssignment[];
};

export function ProposeSwapCard({ postId, postOwnerId, currentEmployeeId, myAssignments }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState<{ kind: "idle" | "error" | "ok"; text: string }>({
    kind: "idle",
    text: "",
  });
  const [isPending, startTransition] = useTransition();

  if (currentEmployeeId === postOwnerId) {
    return null;
  }

  if (myAssignments.length === 0) {
    return (
      <section className={styles.card} aria-label="Offer coverage">
        <div className={styles.title}>Offer Coverage</div>
        <div className={styles.hint}>
          You have no upcoming shifts to offer for the next 5 weeks.
        </div>
      </section>
    );
  }

  function submit() {
    if (!selectedId) {
      setMessage({ kind: "error", text: "Select one of your shift dates to offer." });
      return;
    }
    startTransition(async () => {
      const result = await createSwapProposal(postId, selectedId);
      if (result.ok) {
        setMessage({ kind: "ok", text: "Coverage offer sent." });
        setSelectedId("");
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <section className={styles.card} aria-label="Offer coverage">
      <div className={styles.title}>Offer Coverage</div>
      <div className={styles.row}>
        <label className={styles.hint} style={{ marginTop: 0 }}>
          Select one of your shifts to offer:
        </label>
        <select
          className={styles.select}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={isPending}
        >
          <option value="">Select date...</option>
          {myAssignments.map((a) => (
            <option key={a.id} value={a.id}>
              {formatDate(a.date)}
              {a.providerName ? ` — ${a.providerName}` : ""}
            </option>
          ))}
        </select>
        <button
          className={styles.button}
          type="button"
          onClick={submit}
          disabled={isPending}
        >
          {isPending ? "Sending…" : "Offer coverage"}
        </button>
      </div>

      <div className={styles.hint}>
        Approval checks schedule conflicts and provider pairing rules before the swap is applied.
      </div>

      {message.kind !== "idle" ? (
        <div
          className={`${styles.message} ${message.kind === "error" ? styles.error : styles.ok}`}
        >
          {message.text}
        </div>
      ) : null}
    </section>
  );
}
