import { getMe } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutShell from "@/components/admin-layout-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();

  if (!user || !user.roles.includes("admin")) {
    redirect("/login");
  }

  // Pass necessary user data to the client component
  const userData = {
    name: user.name,
    email: user.email,
  };

  return <AdminLayoutShell user={userData}>{children}</AdminLayoutShell>;
}
