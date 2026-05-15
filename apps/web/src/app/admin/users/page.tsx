import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUsersData } from "@/lib/adminData";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== "developer") redirect("/admin");

  const users = await getUsersData();

  return <UsersClient users={users} />;
}
