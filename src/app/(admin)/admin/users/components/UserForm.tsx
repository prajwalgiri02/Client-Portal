"use client";

import * as React from "react";
import { Save, User as UserIcon, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, useToast } from "@/components/admin-ui";
import { CONFIG } from "@/lib/config";
import Cookies from "js-cookie";

interface UserData {
  id?: number;
  name: string;
  email: string;
  role: string;
}

interface UserFormProps {
  initialData?: UserData;
  isEdit?: boolean;
}

export function UserForm({ initialData, isEdit }: UserFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = React.useState(false);

  const [user, setUser] = React.useState<UserData>(
    initialData || {
      name: "",
      email: "",
      role: "client",
    },
  );

  const handleUpdate = (updates: Partial<UserData>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.name || !user.email) {
      error("Name and email are required.");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const url = isEdit ? `${CONFIG.API_URL}/api/users/${user.id}` : `${CONFIG.API_URL}/api/users`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) throw new Error("Failed to save user");

      success(`User "${user.name}" ${isEdit ? "updated" : "created"} successfully.`);
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      error("An error occurred while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Full Name"
              value={user.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              placeholder="e.g. John Doe"
              required
              leftIcon={<UserIcon className="h-4 w-4" />}
            />
            <Input
              label="Email Address"
              type="email"
              value={user.email}
              onChange={(e) => handleUpdate({ email: e.target.value })}
              placeholder="e.g. john@example.com"
              required
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Role & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select
              label="User Role"
              value={user.role}
              onChange={(e: any) => handleUpdate({ role: e.target.value })}
              options={[
                { label: "Admin", value: "admin" },
                { label: "Manager", value: "manager" },
                { label: "Client", value: "client" },
              ]}
              required
            />
            <div className="pt-4 flex flex-col gap-3">
              <Button type="submit" loading={loading} className="w-full" leftIcon={<Save className="h-4 w-4" />}>
                {isEdit ? "Update User" : "Create User"}
              </Button>
              <Button variant="outline" type="button" onClick={() => router.push("/admin/users")} className="w-full">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
