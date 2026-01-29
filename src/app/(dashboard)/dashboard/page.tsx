import { getMe } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

export default async function UserDashboard() {
  const user = await getMe();

  return (
    <div className="max-w-6xl space-y-12">
      <div className="relative p-12 rounded-[2.5rem] bg-secondary overflow-hidden shadow-2xl shadow-secondary/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
            <span className="text-white text-4xl font-black italic">{CONFIG.BRAND_SHORT}</span>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white mb-3">Hello, {user?.name}!</h1>
            <p className="text-slate-300 text-lg max-w-md font-medium">
              Welcome to your Client Hub. Here you can track your orders, manage your tokens, and explore new packages.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 22V12"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Current Projects</h3>
          <p className="text-gray-500 mb-6">You have 3 active branding projects in progress.</p>
          <div className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer hover:underline">
            View Projects <span>→</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Order History</h3>
          <p className="text-gray-500 mb-6">Review your past invoices and downloaded assets.</p>
          <div className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer hover:underline">
            Go to History <span>→</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Account Status</h3>
          <p className="text-gray-500 mb-6">Your account is verified and active with Standard perks.</p>
          <div className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer hover:underline">
            Upgrade Plan <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
