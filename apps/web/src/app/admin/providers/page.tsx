import { getAdminProvidersData } from "@/lib/adminData";
import { ProvidersClient } from "./ProvidersClient";
import styles from "./page.module.css";

export default async function AdminProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const data = await getAdminProvidersData(params.week ?? null);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Provider Schedules</h1>
          <div className={styles.subtitle}>
            Manage which providers are working each day of the week.
          </div>
        </div>
      </div>
      <ProvidersClient data={data} />
    </div>
  );
}
