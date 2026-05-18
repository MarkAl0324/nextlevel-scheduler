import styles from "./page.module.css";

export default function RequestsLoading() {
  return (
    <div aria-label="Loading requests">
      <div className={styles.list}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardLeft}>
              <div className="nls-skeleton" style={{ width: 320, height: 14, marginBottom: 6 }} />
              <div className="nls-skeleton" style={{ width: 260, height: 12 }} />
              <div className="nls-skeleton" style={{ width: 220, height: 12, marginTop: 6 }} />
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="nls-skeleton" style={{ width: 72, height: 20, borderRadius: 999 }} />
              <div className="nls-skeleton" style={{ width: 56, height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
