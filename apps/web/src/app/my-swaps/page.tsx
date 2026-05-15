import { auth } from "@/auth";
import { getMySwapsData } from "@/lib/serverData";
import { MySwapsClient } from "./view";

export default async function MySwapsPage() {
  const session = await auth();
  const employeeProfileId = session?.user?.employeeProfileId ?? null;

  if (!employeeProfileId) {
    return (
      <div style={{ padding: "16px 0" }}>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          My Requests is for employees. Managers can view all swap requests in{" "}
          <a href="/admin/requests" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Admin → Swap Requests
          </a>
          .
        </p>
      </div>
    );
  }

  const data = await getMySwapsData(employeeProfileId);
  return <MySwapsClient data={data} />;
}
