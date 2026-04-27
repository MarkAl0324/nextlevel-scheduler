import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Next Level Scheduler</h1>
          <p>Internal scheduling operations for weekly coverage, requests, and staffing balance.</p>
        </div>
        <div className={styles.ctas}>
          <Link className={styles.primary} href="/schedule">
            Open week board
          </Link>
        </div>
      </main>
    </div>
  );
}
