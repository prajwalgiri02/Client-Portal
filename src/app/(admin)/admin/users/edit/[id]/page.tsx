"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { UserForm } from "../../components/UserForm";
import { CONFIG } from "@/lib/config";
import Cookies from "js-cookie";
import { PageLoader, useToast } from "@/components/admin-ui";

export default function EditUserPage() {
  const { id } = useParams();
  const { error } = useToast();
  const [initialData, setInitialData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("token");
        const response = await fetch(`${CONFIG.API_URL}/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!response.ok) throw new Error("User not found");
        const data = await response.json();
        setInitialData(data.data || data);
      } catch (err) {
        error("Could not load user details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, error]);

  if (loading) return <PageLoader />;
  if (!initialData) return <div className="p-8 text-center text-muted-foreground">User not found.</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit User</h1>
        <p className="text-muted-foreground text-sm">Update profile details and update system permissions.</p>
      </div>

      <UserForm initialData={initialData} isEdit />
    </div>
  );
}
