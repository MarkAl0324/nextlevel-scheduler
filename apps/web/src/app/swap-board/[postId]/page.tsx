import Link from "next/link";
import styles from "./page.module.css";
import { getDemoCurrentEmployee, getDemoEmployeeShiftDates } from "@/lib/demoData";
import { getSwapPostDetailData } from "@/lib/serverData";
import { ProposeSwapCard } from "./ProposeSwapCard";

function formatLong(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(d);
}

export default async function SwapPostDetailPage({ params }: { params: { postId: string } }) {
  const { post, proposals } = await getSwapPostDetailData(params.postId);
  const current = getDemoCurrentEmployee();
  const myShiftDates = getDemoEmployeeShiftDates(current.id);

  if (!post) {
    return (
      <div>
        <h1>Request not found</h1>
        <p>
          <Link href="/requests" className={styles.link}>
            Back to requests
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Coverage Request</h1>
          <div className={styles.subtitle}>
            <Link href="/requests" className={styles.link}>
              Back to requests
            </Link>
          </div>
        </div>
      </div>

      <section className={styles.section} aria-label="Request details">
        <div className={styles.sectionTitle}>Details</div>
        <div className={styles.row}>
          <div className={styles.label}>Owner</div>
          <div>{post.owner.name}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Target shift</div>
          <div>{formatLong(post.targetDate)}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Status</div>
          <div>{post.status}</div>
        </div>
        {post.note ? (
          <div className={styles.row}>
            <div className={styles.label}>Note</div>
            <div>{post.note}</div>
          </div>
        ) : null}
      </section>

      <section className={styles.section} aria-label="Coverage offers">
        <div className={styles.sectionTitle}>Coverage Offers</div>
        {proposals.length === 0 ? (
          <div className={styles.subtitle}>No coverage offers yet.</div>
        ) : (
          proposals.map((p) => (
            <div key={p.id} className={styles.row}>
              <div>
                <div style={{ fontWeight: 650, fontSize: 13 }}>{p.proposer.name}</div>
                <div className={styles.subtitle}>Offers: {formatLong(p.offeredDate)}</div>
              </div>
              <div>
                <span
                  className={`${styles.pill} ${
                    p.status === "pending" ? styles.pillPending : p.status === "declined" ? styles.pillDeclined : ""
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))
        )}
      </section>

      <ProposeSwapCard postId={post.id} myShiftDates={myShiftDates} />

      <section className={styles.section} aria-label="Current user">
        <div className={styles.sectionTitle}>Current User</div>
        <div className={styles.subtitle}>
          Signed in as <strong>{current.name}</strong>.
        </div>
      </section>
    </div>
  );
}
