"use client";

import * as React from "react";
import { Save, User as UserIcon, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, useToast } from "@/components/admin-ui";
import { CONFIG } from "@/lib/config";
import Cookies from "js-cookie";

const userSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
});

type UserFormValues = z.infer<typeof userSchema>;

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
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      role: "client",
    },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const url = isEdit ? `${CONFIG.API_URL}/api/users/${initialData?.id}` : `${CONFIG.API_URL}/api/users`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save user");
      }

      success(`User "${data.name}" ${isEdit ? "updated" : "created"} successfully.`);
      router.push("/admin/users");
      router.refresh();
    } catch (err: any) {
      toastError(err.message || "An error occurred while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              {...register("name")}
              error={errors.name?.message}
              placeholder="e.g. John Doe"
              leftIcon={<UserIcon className="h-4 w-4" />}
            />
            <Input
              label="Email Address"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="e.g. john@example.com"
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
              value={roleValue}
              onChange={(e: any) => setValue("role", e.target.value)}
              error={errors.role?.message}
              options={[
                { label: "Admin", value: "admin" },
                { label: "Manager", value: "manager" },
                { label: "Client", value: "client" },
              ]}
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
