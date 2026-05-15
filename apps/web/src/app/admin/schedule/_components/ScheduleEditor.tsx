"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminScheduleData, AdminScheduleCell } from "@/lib/adminData";
import { createAssignment, deleteAssignment, updateAssignmentProvider } from "@/lib/actions/schedule";
import styles from "./ScheduleEditor.module.css";

type Modal =
  | { mode: "assign"; employeeId: string; employeeName: string; date: string }
  | { mode: "edit"; cell: AdminScheduleCell; employeeName: string };

function formatWeekRange(startIso: string, endIso: string) {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      new Date(`${iso}T00:00:00`),
    );
  const year = new Date(`${startIso}T00:00:00`).getFullYear();
  return `${fmt(startIso)} – ${fmt(endIso)}, ${year}`;
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(
    new Date(`${isoDate}T00:00:00`),
  );
}

export function ScheduleEditor({ data }: { data: AdminScheduleData }) {
  const { days, employees, providers, cells, weekStartIso, weekEndIso, prevWeekIso, nextWeekIso } =
    data;
  const router = useRouter();
  const [modal, setModal] = useState<Modal | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cellMap = useMemo(() => {
    const m = new Map<string, AdminScheduleCell>();
    for (const c of cells) {
      m.set(`${c.employeeId}:${c.date}`, c);
    }
    return m;
  }, [cells]);

  function openAssign(employeeId: string, employeeName: string, date: string) {
    setSelectedProviderId("");
    setModalError(null);
    setModal({ mode: "assign", employeeId, employeeName, date });
  }

  function openEdit(cell: AdminScheduleCell, employeeName: string) {
    setSelectedProviderId(cell.providerId ?? "");
    setModalError(null);
    setModal({ mode: "edit", cell, employeeName });
  }

  function closeModal() {
    setModal(null);
    setModalError(null);
  }

  function handleSave() {
    if (!modal) return;
    startTransition(async () => {
      let result;
      if (modal.mode === "assign") {
        result = await createAssignment(
          modal.employeeId,
          modal.date,
          selectedProviderId || null,
        );
      } else {
        result = await updateAssignmentProvider(
          modal.cell.assignmentId!,
          selectedProviderId || null,
        );
      }
      if (result.ok) {
        closeModal();
        router.refresh();
      } else {
        setModalError(result.error);
      }
    });
  }

  function handleDelete(assignmentId: string) {
    startTransition(async () => {
      const result = await deleteAssignment(assignmentId);
      if (!result.ok) alert(result.error);
      else router.refresh();
    });
  }

  function navWeek(iso: string) {
    router.push(`/admin/schedule?week=${iso}`);
  }

  return (
    <>
      {/* Week navigation */}
      <div className={styles.weekNav}>
        <button type="button" className={styles.navArrow} onClick={() => navWeek(prevWeekIso)} aria-label="Previous week">
          ‹
        </button>
        <span className={styles.navLabel}>{formatWeekRange(weekStartIso, weekEndIso)}</span>
        <button type="button" className={styles.navArrow} onClick={() => navWeek(nextWeekIso)} aria-label="Next week">
          ›
        </button>
      </div>

      {/* Grid */}
      <div className={styles.gridWrap}>
        <table className={styles.grid}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.nameCol}`}>Employee</th>
              {days.map((day) => (
                <th key={day.date} className={styles.th}>
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
              <tr key={emp.id}>
                <th className={`${styles.td} ${styles.nameCell}`} scope="row">
                  {emp.name}
                </th>
                {days.map((day) => {
                  const cell = cellMap.get(`${emp.id}:${day.date}`);
                  return (
                    <td key={day.date} className={styles.td}>
                      {cell?.assignmentId ? (
                        <div className={`${styles.cell} ${cell.providerName ? styles.cellAssigned : styles.cellUnassigned}`}>
                          <span className={`${styles.cellLabel} ${!cell.providerName ? styles.cellLabelMuted : ""}`}>
                            {cell.providerName ?? "No provider"}
                          </span>
                          <button
                            type="button"
                            className={styles.cellBtn}
                            title="Change provider"
                            disabled={isPending}
                            onClick={() => openEdit(cell, emp.name)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.cellBtn} ${styles.cellBtnDanger}`}
                            title="Remove assignment"
                            disabled={isPending}
                            onClick={() => handleDelete(cell.assignmentId!)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.addBtn}
                          disabled={isPending}
                          onClick={() => openAssign(emp.id, emp.name, day.date)}
                        >
                          + Assign
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment modal */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalTitle}>
              {modal.mode === "assign" ? "Assign Shift" : "Edit Shift"}
            </div>
            <div className={styles.modalMeta}>
              {modal.mode === "assign"
                ? `${modal.employeeName} — ${formatDate(modal.date)}`
                : `${modal.employeeName} — ${formatDate(modal.mode === "edit" ? modal.cell.date : "")}`}
            </div>

            <label className={styles.modalLabel}>
              Provider
              <select
                className={styles.modalSelect}
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                disabled={isPending}
              >
                <option value="">No provider (unassigned)</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            {modalError && <div className={styles.modalError}>{modalError}</div>}

            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={closeModal} disabled={isPending}>
                Cancel
              </button>
              <button type="button" className={styles.modalSave} onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
