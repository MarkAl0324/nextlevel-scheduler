import { getProviderRulesData } from "@/lib/serverData";
import { prisma } from "@/lib/db";
import { RulesClient } from "./RulesClient";
import styles from "./page.module.css";

export default async function AdminRulesPage() {
  const [{ rules }, employees, providers] = await Promise.all([
    getProviderRulesData(),
    prisma.employeeProfile.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.provider.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Provider Pairing Rules</h1>
          <div className={styles.subtitle}>
            Define required MA pairing for providers on specific days. Violated pairings block swaps with a clear reason.
          </div>
        </div>
      </div>

      <RulesClient rules={rules} employees={employees} providers={providers} />
    </div>
  );
}
