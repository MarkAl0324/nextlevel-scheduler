import styles from "./page.module.css";

export default function ScheduleLoading() {
  return (
    <div className={styles.page} aria-label="Loading schedule">
      <header className={styles.header}>
        <div>
          <div className="nls-skeleton" style={{ width: 180, height: 24, marginBottom: 8 }} />
          <div className="nls-skeleton" style={{ width: 340, height: 14 }} />
        </div>
      </header>

      <section className={styles.grid} aria-label="Loading week">
        {Array.from({ length: 7 }).map((_, i) => (
          <article key={i} className={styles.dayCard}>
            <div className={styles.dayHeader}>
              <div>
                <div className="nls-skeleton" style={{ width: 64, height: 14, marginBottom: 6 }} />
                <div className="nls-skeleton" style={{ width: 78, height: 12 }} />
              </div>
              <div className="nls-skeleton" style={{ width: 90, height: 20, borderRadius: 999 }} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div className="nls-skeleton" style={{ width: "100%", height: 14 }} />
              <div className="nls-skeleton" style={{ width: "100%", height: 14 }} />
            </div>

            <div className={styles.footerLink}>
              <div className="nls-skeleton" style={{ width: 90, height: 14 }} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

