"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Something went wrong</h2>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, maxWidth: 380 }}>
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 8,
          padding: "8px 20px",
          fontSize: 14,
          fontWeight: 500,
          borderRadius: 6,
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
