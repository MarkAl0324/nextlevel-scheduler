import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1>Admin</h1>
      <p style={{ color: "var(--muted)", marginTop: 6 }}>
        Staff tools for balance, pairing rules, and schedule controls.
      </p>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--panel)",
            padding: 12,
            boxShadow: "var(--shadow)",
          }}
        >
          <div style={{ fontWeight: 650, marginBottom: 6 }}>Staffing Balance</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>
            Day-by-day providers vs medical assistants, with drilldown to the roster.
          </div>
          <Link href="/admin/balance" style={{ fontSize: 12, fontWeight: 650, color: "var(--accent)" }}>
            Open balance
          </Link>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--panel)",
            padding: 12,
            boxShadow: "var(--shadow)",
          }}
        >
          <div style={{ fontWeight: 650, marginBottom: 6 }}>Provider Pairing Rules</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>
            Define required medical assistant pairing for providers on specific days.
          </div>
          <Link href="/admin/rules" style={{ fontSize: 12, fontWeight: 650, color: "var(--accent)" }}>
            Open rules
          </Link>
        </div>
      </div>
    </div>
  );
}
