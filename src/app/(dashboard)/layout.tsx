import UserSidebar from "@/components/user-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { getMe } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();

  if (!user || (!user.roles.includes("client") && !user.roles.includes("user"))) {
    if (user?.roles.includes("admin")) {
      redirect("/admin/dashboard");
    }
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <UserSidebar />
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent">
            Welcome back, {user.name.split(" ")[0]}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">{user.roles[0]} Account</p>
            </div>
            <div className="w-10 h-10 ring-2 ring-indigo-50 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 md:p-12 pb-24 lg:pb-12">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
