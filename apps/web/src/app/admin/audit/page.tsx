import { getAuditData } from "@/lib/adminData";
import { AuditClient } from "./AuditClient";

export default async function AuditPage() {
  const { events } = await getAuditData();
  return <AuditClient events={events} />;
}
