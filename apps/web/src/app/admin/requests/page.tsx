import { getAdminRequestsData } from "@/lib/adminData";
import { RequestsClient } from "./RequestsClient";
import styles from "./page.module.css";

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(
    new Date(`${isoDate}T00:00:00`),
  );
}

export default async function AdminRequestsPage() {
  const { posts } = await getAdminRequestsData();

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Swap Requests</h1>
          <div className={styles.subtitle}>
            All employee coverage requests. Peer-approved swaps apply automatically when accepted.
          </div>
        </div>
      </div>

      <RequestsClient posts={posts} />
    </div>
  );
}
