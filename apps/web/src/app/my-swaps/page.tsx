import { Suspense } from "react";
import styles from "./page.module.css";
import { MySwapsClient } from "./view";

export default function MySwapsPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div>
            <div className={styles.header}>
              <div>
                <div className="nls-skeleton" style={{ width: 140, height: 24, marginBottom: 8 }} />
                <div className="nls-skeleton" style={{ width: 320, height: 14 }} />
              </div>
              <div className="nls-skeleton" style={{ width: 320, height: 36, borderRadius: 999 }} />
            </div>
            <div className={styles.list}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <div className="nls-skeleton" style={{ width: 320, height: 14, marginBottom: 6 }} />
                    <div className="nls-skeleton" style={{ width: 240, height: 12 }} />
                  </div>
                  <div className="nls-skeleton" style={{ width: 110, height: 30 }} />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <MySwapsClient />
      </Suspense>
    </div>
  );
}

