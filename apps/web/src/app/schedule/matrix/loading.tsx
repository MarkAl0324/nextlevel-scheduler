import styles from "./page.module.css";

export default function MatrixLoading() {
  return (
    <div aria-label="Loading matrix schedule">
      <div className={styles.header}>
        <div>
          <div className="nls-skeleton" style={{ width: 140, height: 24, marginBottom: 8 }} />
          <div className="nls-skeleton" style={{ width: 320, height: 14 }} />
        </div>
        <div className="nls-skeleton" style={{ width: 220, height: 36, borderRadius: 999 }} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.thFirst}`}>Medical assistant</th>
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className={styles.th}>
                  <div className="nls-skeleton" style={{ width: 54, height: 12 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, r) => (
              <tr key={r}>
                <td className={`${styles.td} ${styles.tdFirst}`}>
                  <div className="nls-skeleton" style={{ width: 140, height: 14 }} />
                </td>
                {Array.from({ length: 7 }).map((_, c) => (
                  <td key={c} className={styles.td}>
                    <div className={styles.cell}>
                      <div className="nls-skeleton" style={{ width: 120, height: 14 }} />
                      <div className="nls-skeleton" style={{ width: 90, height: 12 }} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

