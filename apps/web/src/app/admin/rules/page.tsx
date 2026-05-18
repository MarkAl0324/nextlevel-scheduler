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
      <RulesClient rules={rules} employees={employees} providers={providers} />
    </div>
  );
}
