import styles from "./page.module.css";
import { getProviderRulesData } from "@/lib/serverData";

export default async function AdminRulesPage() {
  const { rules } = await getProviderRulesData();

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Provider Pairing Rules</h1>
          <div className={styles.subtitle}>
            These rules define the required medical assistant pairing for a provider on specific days.
          </div>
        </div>
      </div>

      <div className={styles.callout} aria-label="Blocked pairing behavior">
        <div className={styles.calloutTitle}>Blocked Pairing Behavior</div>
        <div className={styles.subtitle} style={{ marginTop: 0 }}>
          If a request or assignment would make a provider-day violate the required pairing, it is blocked with a clear
          reason. Example reason:
          <br />
          <strong>
            Provider pairing conflict: Dr. Chen on Tue requires Noah Kim. This change would assign Ava Martinez.
          </strong>
        </div>
      </div>

      <div className={styles.tableWrap} aria-label="Provider pairing rules table">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Provider</th>
              <th className={styles.th}>Day</th>
              <th className={styles.th}>Required medical assistant</th>
              <th className={styles.th}>Enforcement</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td className={styles.td}>{r.provider.name}</td>
                <td className={styles.td}>{r.weekday}</td>
                <td className={styles.td}>{r.requiredEmployee.name}</td>
                <td className={styles.td}>
                  <span className={`${styles.pill} ${styles.pillBlock}`}>Blocked</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.subtitle} style={{ marginTop: 10 }}>
        These rules surface as pairing conflicts anywhere a request would change coverage.
      </div>
    </div>
  );
}
