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
      <ProvidersClient data={data} />
    </div>
  );
}
