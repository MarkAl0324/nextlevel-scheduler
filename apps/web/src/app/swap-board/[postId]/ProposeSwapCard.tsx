"use client";

import { useMemo, useState } from "react";
import styles from "./ProposeSwapCard.module.css";
import { canProposeSwapDemo, type IsoDate } from "@/lib/demoData";

function formatShort(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

export function ProposeSwapCard(props: { postId: string; myShiftDates: IsoDate[] }) {
  const [offeredDate, setOfferedDate] = useState<IsoDate | "">("");
  const [message, setMessage] = useState<{ kind: "idle" | "error" | "ok"; text: string }>({
    kind: "idle",
    text: "",
  });

  const options = useMemo(() => props.myShiftDates, [props.myShiftDates]);

  function submit() {
    if (!offeredDate) {
      setMessage({ kind: "error", text: "Pick one of your shift dates to offer." });
      return;
    }
    const res = canProposeSwapDemo({ postId: props.postId, offeredDate });
    if (!res.ok) {
      setMessage({ kind: "error", text: res.reason });
      return;
    }
    setMessage({ kind: "ok", text: `Coverage offer sent for ${formatShort(offeredDate)}.` });
  }

  return (
    <section className={styles.card} aria-label="Offer coverage">
      <div className={styles.title}>Offer Coverage</div>
      <div className={styles.row}>
        <label className={styles.hint} style={{ marginTop: 0 }}>
          Select one of your scheduled dates to offer:
        </label>
        <select
          className={styles.select}
          value={offeredDate}
          onChange={(e) => setOfferedDate(e.target.value as IsoDate)}
        >
          <option value="">Select date...</option>
          {options.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button className={styles.button} type="button" onClick={submit}>
          Offer coverage
        </button>
      </div>

      <div className={styles.hint}>
        Approval checks the affected shift, role match, schedule conflicts, and provider pairing rules.
      </div>

      {message.kind !== "idle" ? (
        <div className={`${styles.message} ${message.kind === "error" ? styles.error : styles.ok}`}>{message.text}</div>
      ) : null}
    </section>
  );
}
