import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSwapPostDetailData } from "@/lib/serverData";
import { ProposeSwapCard } from "./ProposeSwapCard";
import styles from "./page.module.css";

function formatLong(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(d);
}

function toIsoDateUTC(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function SwapPostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const [{ post, proposals }, session] = await Promise.all([
    getSwapPostDetailData(postId),
    auth(),
  ]);

  const employeeProfileId = session?.user?.employeeProfileId ?? null;

  // Fetch current user's upcoming assignments so they can offer a shift
  let myAssignments: { id: string; date: string; providerName: string | null }[] = [];
  if (employeeProfileId && post && post.ownerEmployeeId !== employeeProfileId) {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const cutoff = new Date(today);
      cutoff.setUTCDate(cutoff.getUTCDate() + 35);

      const rows = await prisma.assignment.findMany({
        where: {
          employeeId: employeeProfileId,
          date: { gte: today, lt: cutoff },
        },
        include: { provider: { select: { name: true } } },
        orderBy: { date: "asc" },
      });

      myAssignments = rows.map((a) => ({
        id: a.id,
        date: toIsoDateUTC(a.date),
        providerName: a.provider?.name ?? null,
      }));
    } catch {
      // leave myAssignments empty; ProposeSwapCard will show an appropriate message
    }
  }

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
          <span
            className={`${styles.pill} ${
              post.status === "posted" ? styles.pillPosted :
              post.status === "completed" ? styles.pillCompleted : ""
            }`}
          >
            {post.status === "posted" && <span className={styles.liveDot} aria-hidden="true" />}
            {post.status === "posted" ? "Open" :
             post.status === "completed" ? "Completed" :
             post.status === "cancelled" ? "Cancelled" : post.status}
          </span>
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
              <span
                className={`${styles.pill} ${
                  p.status === "pending" ? styles.pillPending :
                  p.status === "accepted" ? styles.pillAccepted :
                  p.status === "declined" ? styles.pillDeclined : ""
                }`}
              >
                {p.status === "pending" && <span className={styles.liveDot} aria-hidden="true" />}
                {p.status}
              </span>
            </div>
          ))
        )}
      </section>

      {post.status === "posted" && employeeProfileId && (
        <ProposeSwapCard
          postId={post.id}
          postOwnerId={post.ownerEmployeeId}
          currentEmployeeId={employeeProfileId}
          myAssignments={myAssignments}
        />
      )}
    </div>
  );
}
