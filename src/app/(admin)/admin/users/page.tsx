"use client";

import * as React from "react";
import { Plus, Search, RefreshCw, User as UserIcon, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Input, Table, Badge, Card, CardHeader, CardTitle, CardContent, useToast, ConfirmModal } from "@/components/admin-ui";
import { CONFIG } from "@/lib/config";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${CONFIG.API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.data || data);
    } catch (err) {
      error("Could not load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${CONFIG.API_URL}/api/users/${deletingUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Delete failed");

      success(`User "${deletingUser.name}" deleted.`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setIsDeleting(false);
      setDeletingUser(null);
    } catch (err) {
      error("Failed to delete user.");
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm">Create and manage administrative and client users.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} leftIcon={<RefreshCw className={loading ? "animate-spin" : ""} />}>
            Refresh
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/admin/users/create")}>
            Add User
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">All Users</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9 h-9 border-muted-foreground/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table
            data={filteredUsers}
            isLoading={loading}
            columns={[
              {
                header: "User",
                accessorKey: "name",
                cell: (u: User) => (
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{u.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {u.email}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: "Role",
                accessorKey: "role",
                cell: (u: User) => {
                  const roleColors: Record<string, any> = {
                    admin: "destructive",
                    manager: "warning",
                    client: "secondary",
                  };
                  return (
                    <Badge variant={roleColors[u.role] || "default"} className="capitalize">
                      <Shield className="h-3 w-3 mr-1" />
                      {u.role}
                    </Badge>
                  );
                },
              },
            ]}
            onEdit={(u: User) => router.push(`/admin/users/edit/${u.id}`)}
            onDelete={(u: User) => setDeletingUser(u)}
          />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Remove User"
        description={`Are you sure you want to remove "${deletingUser?.name}"? They will lose access to the system.`}
        onConfirm={handleDelete}
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
