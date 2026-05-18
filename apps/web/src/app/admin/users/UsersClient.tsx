"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UserRow } from "@/lib/adminData";
import { createUser, deleteUser } from "@/lib/actions/users";
import styles from "./page.module.css";

type Toast = { kind: "ok" | "err"; title: string; text: string };

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  manager: "Manager",
  developer: "Developer",
};

export function UsersClient({ users }: { users: UserRow[] }) {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"employee" | "manager" | "developer">("employee");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function showToast(t: Toast) {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }

  function resetForm() {
    setEmail("");
    setPassword("");
    setRole("employee");
    setName("");
    setFormError(null);
  }

  function openModal() {
    resetForm();
    setShowModal(true);
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createUser({ email, password, role, name: name || undefined });
      if (result.ok) {
        setShowModal(false);
        resetForm();
        showToast({ kind: "ok", title: "Created", text: "User account created successfully." });
        router.refresh();
      } else {
        setFormError(result.error);
      }
    });
  }

  function handleDelete(userId: string, userEmail: string) {
    if (!window.confirm(`Delete account for ${userEmail}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.ok) {
        showToast({ kind: "ok", title: "Deleted", text: `${userEmail} removed.` });
        router.refresh();
      } else {
        showToast({ kind: "err", title: "Error", text: result.error });
      }
    });
  }

  return (
    <div>
      {toast && (
        <div className={`${styles.toast} ${toast.kind === "ok" ? styles.toastOk : styles.toastErr}`}>
          <div className={styles.toastTitle}>{toast.title}</div>
          <div>{toast.text}</div>
        </div>
      )}

      <div className={styles.controls}>
        <span className={styles.countLabel}>{users.length} account{users.length !== 1 ? "s" : ""}</span>
        <button type="button" className={styles.newBtn} onClick={openModal} disabled={isPending}>
          + New User
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Created</th>
              <th className={styles.th} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className={styles.td}>{u.email}</td>
                <td className={`${styles.td} ${styles.mutedCell}`}>{u.name ?? "—"}</td>
                <td className={styles.td}>
                  <span className={`${styles.rolePill} ${styles[`role_${u.role}`] ?? ""}`}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.mutedCell}`}>{formatDate(u.createdAt)}</td>
                <td className={styles.td}>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    disabled={isPending}
                    onClick={() => handleDelete(u.id, u.email)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
          >
            <div className={styles.modalTitle} id="user-modal-title">New User</div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="u-role">Role</label>
              <select
                id="u-role"
                className={styles.select}
                value={role}
                onChange={(e) => setRole(e.target.value as "employee" | "manager" | "developer")}
                disabled={isPending}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            {role === "employee" && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="u-name">Full Name</label>
                <input
                  id="u-name"
                  type="text"
                  className={styles.input}
                  placeholder="Ava Martinez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="u-email">Email</label>
              <input
                id="u-email"
                type="email"
                className={styles.input}
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="u-password">
                Password <span className={styles.hint}>(min 6 characters)</span>
              </label>
              <input
                id="u-password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
            </div>

            {formError && <div className={styles.error}>{formError}</div>}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleCreate}
                disabled={isPending}
              >
                {isPending ? "Creating…" : "Create user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
