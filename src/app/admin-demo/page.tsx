import { CRUDDemo } from "@/components/admin-ui/demo/CRUDDemo";
import { ToastProvider } from "@/components/admin-ui/feedback/Toast";

export const metadata = {
  title: "Admin Component Library Demo",
  description: "A demonstration of the reusable admin UI components.",
};

export default function AdminDemoPage() {
  return (
    <ToastProvider>
      <main className="min-h-screen bg-background">
        <CRUDDemo />
      </main>
    </ToastProvider>
  );
}
