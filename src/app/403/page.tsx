import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 bg-white rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-600 mb-8">
          You do not have permission to access this page. Please contact your administrator if you think this is an error.
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Go back home
        </Link>
      </div>
    </div>
  );
}
