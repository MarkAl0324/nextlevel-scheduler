import styles from "./page.module.css";

export default function MonthLoading() {
  return (
    <div aria-label="Loading month schedule">
      <div className={styles.header}>
        <div>
          <div className="nls-skeleton" style={{ width: 140, height: 24, marginBottom: 8 }} />
          <div className="nls-skeleton" style={{ width: 320, height: 14 }} />
        </div>
        <div className="nls-skeleton" style={{ width: 220, height: 36, borderRadius: 999 }} />
      </div>

      <div className={styles.grid}>
        <div className={styles.weekdays}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={styles.weekday}>
              <div className="nls-skeleton" style={{ width: 42, height: 12 }} />
            </div>
          ))}
        </div>
        <div className={styles.cells}>
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className={styles.cell} style={{ cursor: "default" }}>
              <div className={styles.cellTopRow}>
                <div className="nls-skeleton" style={{ width: 18, height: 12 }} />
                <div className="nls-skeleton" style={{ width: 72, height: 12 }} />
              </div>
              <div className="nls-skeleton" style={{ width: 78, height: 20, borderRadius: 999 }} />
              <div style={{ marginTop: "auto" }}>
                <div className="nls-skeleton" style={{ width: 96, height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

