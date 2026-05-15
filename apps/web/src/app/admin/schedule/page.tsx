import { getAdminScheduleData } from "@/lib/adminData";
import { ScheduleEditor } from "./_components/ScheduleEditor";
import styles from "./_components/ScheduleEditor.module.css";

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const data = await getAdminScheduleData(params.week ?? null);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Schedule Editor</h1>
          <p className={styles.pageSubtitle}>
            Assign employees to shifts and link them to providers.
          </p>
        </div>
      </div>
      <ScheduleEditor data={data} />
    </div>
  );
}
