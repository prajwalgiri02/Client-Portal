import { getMe } from "@/lib/auth";
import DashboardClient from "./client-page";

export default async function UserDashboard() {
  const user = await getMe();

  return <DashboardClient user={user} />;
}
