import styles from "./page.module.css";

export default function RequestsLoading() {
  return (
    <div aria-label="Loading requests">
      <div className={styles.list}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.card}>
            {/* Header skeleton: avatar + name + posted time */}
            <div className={styles.cardHeader}>
              <div
                className="nls-skeleton"
                style={{ width: 32, height: 32, borderRadius: "50%" }}
              />
              <div className={styles.cardHeaderText}>
                <div
                  className="nls-skeleton"
                  style={{ width: 130, height: 13, marginBottom: 5 }}
                />
                <div className="nls-skeleton" style={{ width: 78, height: 11 }} />
              </div>
            </div>

            {/* Shift block skeleton */}
            <div className={styles.shiftBlock}>
              <div className="nls-skeleton" style={{ width: 130, height: 10 }} />
              <div className="nls-skeleton" style={{ width: 180, height: 18 }} />
              <div className="nls-skeleton" style={{ width: 140, height: 12 }} />
            </div>

            {/* Reason skeleton */}
            <div className="nls-skeleton" style={{ width: "70%", height: 12 }} />

            {/* Footer skeleton: chip + button */}
            <div className={styles.cardFooter}>
              <div
                className="nls-skeleton"
                style={{ width: 64, height: 22, borderRadius: 999 }}
              />
              <div
                className="nls-skeleton"
                style={{ width: 90, height: 28, borderRadius: 8 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
