import styles from "./page.module.css";

export default function RosterLoading() {
  return (
    <div aria-label="Loading roster">
      <div className={styles.header}>
        <div>
          <div className="nls-skeleton" style={{ width: 160, height: 24, marginBottom: 8 }} />
          <div className="nls-skeleton" style={{ width: 260, height: 14 }} />
        </div>
        <div className={styles.controls}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="nls-skeleton" style={{ width: 54, height: 22, borderRadius: 999 }} />
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Medical assistant</th>
              <th className={styles.th}>Provider</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, i) => (
              <tr key={i}>
                <td className={styles.td}>
                  <div className="nls-skeleton" style={{ width: 160, height: 14 }} />
                </td>
                <td className={styles.td}>
                  <div className="nls-skeleton" style={{ width: 120, height: 14 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

