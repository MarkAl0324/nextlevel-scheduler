"use client";

import { CSSProperties, ReactNode } from "react";
import styles from "./StatusChip.module.css";

/* ─────────────────────────────────────────────────────────────
 * Tones & sizes
 * ──────────────────────────────────────────────────────────── */
export type Tone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  /* role tones — declared but unused until EmployeeProfile.specialty lands */
  | "rn"
  | "ma"
  | "scribe"
  | "front";

export type Size = "sm" | "md" | "lg";

/* ─────────────────────────────────────────────────────────────
 * Badge — generic pill primitive
 * ──────────────────────────────────────────────────────────── */
export function Badge({
  children,
  tone = "neutral",
  size = "md",
  dot = false,
  solid = false,
  className,
  style,
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  dot?: boolean;
  solid?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  const toneClass = styles[`tone_${tone}`] ?? styles.tone_neutral;
  const sizeClass = styles[`size_${size}`] ?? styles.size_md;
  const modeClass = solid ? styles.solid : "";
  return (
    <span
      className={[styles.badge, toneClass, sizeClass, modeClass, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      title={title}
    >
      {dot && <span aria-hidden="true" className={styles.dot} />}
      <span className={styles.label}>{children}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * StatusChip — Badge with semantic status mapping
 * ──────────────────────────────────────────────────────────── */
export type StatusKey =
  | "open"
  | "posted"
  | "has-proposals"
  | "pending"
  | "approved"
  | "accepted"
  | "declined"
  | "rejected"
  | "expiring"
  | "expired"
  | "cancelled"
  | "completed"
  | "draft"
  | "ok"
  | "warn"
  | "alert";

const STATUS_MAP: Record<StatusKey, { tone: Tone; label: string; dot: boolean }> = {
  open:            { tone: "success", label: "Open",          dot: true  },
  posted:          { tone: "success", label: "Open",          dot: true  }, // posted == open visually
  "has-proposals": { tone: "accent",  label: "Has proposals", dot: true  },
  pending:         { tone: "warning", label: "Pending",       dot: true  },
  approved:        { tone: "success", label: "Approved",      dot: true  },
  accepted:        { tone: "success", label: "Accepted",      dot: true  },
  declined:        { tone: "neutral", label: "Declined",      dot: false },
  rejected:        { tone: "danger",  label: "Rejected",      dot: false },
  expiring:        { tone: "danger",  label: "Expiring soon", dot: true  },
  expired:         { tone: "neutral", label: "Closed",        dot: false },
  cancelled:       { tone: "neutral", label: "Cancelled",     dot: false },
  completed:       { tone: "success", label: "Completed",     dot: true  },
  draft:           { tone: "neutral", label: "Draft",         dot: false },
  ok:              { tone: "success", label: "Fully staffed", dot: true  },
  warn:            { tone: "warning", label: "Gaps",          dot: true  },
  alert:           { tone: "danger",  label: "Critical",      dot: true  },
};

export function StatusChip({
  status,
  label,
  size = "md",
  solid = false,
  className,
  style,
}: {
  status: string;
  label?: string;
  size?: Size;
  solid?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const known = STATUS_MAP[status as StatusKey];
  const tone: Tone = known?.tone ?? "neutral";
  const text = label ?? known?.label ?? status;
  const showDot = known?.dot ?? false;
  return (
    <Badge tone={tone} size={size} dot={showDot} solid={solid} className={className} style={style}>
      {text}
    </Badge>
  );
}
