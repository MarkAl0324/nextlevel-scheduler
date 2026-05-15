"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RosterDrawer, type RosterResponse } from "../month/RosterDrawer";
import type { ScheduleEmployee, ScheduleDay } from "@/lib/serverData";
import { createSwapPost } from "@/lib/actions/swaps";
import styles from "./TeamGrid.module.css";

type Props = {
  days: ScheduleDay[];
  employees: ScheduleEmployee[];
};

type PostingCell = { assignmentId: string; date: string };

function formatDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(d);
}

function PostShiftModal({
  cell,
  onClose,
  onPosted,
}: {
  cell: PostingCell;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createSwapPost(cell.assignmentId, note || undefined);
      if (result.ok) {
        onPosted();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="post-modal-title">
        <div className={styles.modalTitle} id="post-modal-title">
          Post shift for swap
        </div>
        <div className={styles.modalDate}>{formatDate(cell.date)}</div>
        <label className={styles.modalLabel} htmlFor="post-note">
          Note <span className={styles.modalOptional}>(optional)</span>
        </label>
        <textarea
          id="post-note"
          className={styles.modalTextarea}
          placeholder="e.g. Doctor appointment, need coverage"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          disabled={isPending}
        />
        {error && <div className={styles.modalError}>{error}</div>}
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancel} onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button type="button" className={styles.modalSubmit} onClick={submit} disabled={isPending}>
            {isPending ? "Posting…" : "Post for swap"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TeamGrid({ days, employees }: Props) {
  const [todayIso] = useState(() => new Date().toISOString().slice(0, 10));
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [drawerData, setDrawerData] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postingCell, setPostingCell] = useState<PostingCell | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const router = useRouter();

  const openDay = useCallback(async (date: string) => {
    setOpenDate(date);
    setDrawerData(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/roster?date=${date}`);
      if (!res.ok) throw new Error("Failed to load roster");
      setDrawerData(await res.json());
    } catch {
      setError("Could not load roster. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setOpenDate(null);
    setDrawerData(null);
  }, []);

  function handlePosted() {
    setPostingCell(null);
    setSuccessToast("Shift posted for swap. Check My Requests to track offers.");
    setTimeout(() => setSuccessToast(null), 5000);
    router.refresh();
  }

  return (
    <>
      {successToast && (
        <div className={styles.successToast}>{successToast}</div>
      )}

      <div className={styles.gridWrap}>
        <table className={styles.grid}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.nameCol}`}>Employee</th>
              {days.map((day) => (
                <th
                  key={day.date}
                  className={`${styles.th} ${day.date === todayIso ? styles.thToday : ""}`}
                >
                  <div className={styles.dayHead}>
                    <span className={styles.dayName}>{day.weekdayShort}</span>
                    <span className={styles.dayNum}>{day.monthDay}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className={emp.isCurrentUser ? styles.currentUserRow : undefined}>
                <th className={`${styles.td} ${styles.nameCol} ${styles.nameCell}`} scope="row">
                  {emp.isCurrentUser && <span className={styles.youBadge}>You</span>}
                  {emp.name}
                </th>
                {emp.cells.map((cell) => (
                  <td
                    key={cell.date}
                    className={`${styles.td} ${cell.date === todayIso ? styles.tdToday : ""}`}
                    onClick={() => openDay(cell.date)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openDay(cell.date)}
                    aria-label={`${emp.name} on ${cell.date}: ${cell.status === "assigned" ? cell.providerName ?? "assigned" : "off"}`}
                  >
                    {cell.status === "assigned" ? (
                      <div
                        className={`${styles.cell} ${styles.cellAssigned} ${emp.isCurrentUser ? styles.cellCurrentUser : ""}`}
                      >
                        <span className={styles.cellLabel}>{cell.providerName ?? "Assigned"}</span>
                        {emp.isCurrentUser && cell.assignmentId && (
                          <button
                            type="button"
                            className={styles.postChip}
                            title="Post this shift for swap"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostingCell({ assignmentId: cell.assignmentId!, date: cell.date });
                            }}
                            aria-label={`Post ${cell.date} shift for swap`}
                          >
                            Post
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className={`${styles.cell} ${styles.cellOff}`}>—</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RosterDrawer
        isoDate={openDate as any}
        onClose={close}
        data={drawerData}
        loading={loading}
        error={error}
      />

      {postingCell && (
        <PostShiftModal
          cell={postingCell}
          onClose={() => setPostingCell(null)}
          onPosted={handlePosted}
        />
      )}
    </>
  );
}
