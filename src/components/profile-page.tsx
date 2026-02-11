"use client";

import * as React from "react";
import { User, Mail, Lock, Eye, EyeOff, Shield, Calendar, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { CONFIG } from "@/lib/config";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [user, setUser] = React.useState<ProfileUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const showToast = React.useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch user profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get("token");
        const response = await fetch(`${CONFIG.API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        const userData = data.user || data;
        setUser(userData);
        profileForm.reset({
          name: userData.name || "",
          email: userData.email || "",
        });
      } catch (err) {
        showToast("error", "Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast, profileForm.reset]);

  // Save profile info
  const onProfileSubmit = async (values: ProfileValues) => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${CONFIG.API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update profile. Please try again.");
      }

      const data = await response.json();
      const updatedUser = data.user || data.data || data;
      if (updatedUser.name) {
        setUser((prev) => (prev ? { ...prev, name: updatedUser.name, email: updatedUser.email } : prev));
        profileForm.reset(values);
      }
      showToast("success", "Profile updated successfully!");
    } catch (err: any) {
      showToast("error", err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const onPasswordSubmit = async (values: PasswordValues) => {
    setChangingPassword(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${CONFIG.API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to change password. Please try again.");
      }

      showToast("success", "Password changed successfully!");
      passwordForm.reset();
    } catch (err: any) {
      showToast("error", err.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Could not load profile</h2>
        <p className="text-gray-500">Please try refreshing the page or logging in again.</p>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const primaryRole = user.roles?.[0] || "user";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-top-4 fade-in duration-300 ${
            toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account details and security settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Profile Header Banner */}
        <div className="h-28 bg-gradient-to-r from-primary via-orange-500 to-amber-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAxIDQgNC0yIDQtNCA0LTQtMi00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>

        {/* Avatar & Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl ring-4 ring-white">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center">
                <CheckCircle2 size={14} className="text-white" />
              </div>
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-gray-500 text-sm">{user.email}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    primaryRole === "admin"
                      ? "bg-red-50 text-red-700"
                      : primaryRole === "manager"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <Shield size={10} />
                  {primaryRole}
                </span>
              </div>
            </div>
          </div>

          {/* Account Meta */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 flex-wrap text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>
                Joined <strong className="text-gray-700">{formatDate(user.created_at)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
              <span>
                {user.is_active ? <strong className="text-emerald-700">Active</strong> : <strong className="text-gray-400">Inactive</strong>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-6">
              <User size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          {...field}
                          className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                          placeholder="Your full name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                          placeholder="your@email.com"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={saving || !profileForm.formState.isDirty}
                className="flex items-center gap-2 px-6 py-6 border-none bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Password Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={18} className="text-primary" />
          <h3 className="text-lg font-bold text-gray-900">Security & Password</h3>
        </div>

        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
            {/* Current Password */}
            <FormField
              control={passwordForm.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        className="w-full pl-10 pr-12 py-3 h-auto rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          className="w-full pl-10 pr-12 py-3 h-auto rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                          placeholder="Min. 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full pl-10 pr-12 py-3 h-auto rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                          placeholder="Re-enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password strength hint */}
            {passwordForm.watch("password") && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordForm.watch("password").length >= 12
                        ? "w-full bg-emerald-500"
                        : passwordForm.watch("password").length >= 8
                          ? "w-2/3 bg-amber-500"
                          : "w-1/3 bg-red-500"
                    }`}
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {passwordForm.watch("password").length >= 12 ? "Strong" : passwordForm.watch("password").length >= 8 ? "Moderate" : "Weak"}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={changingPassword || !passwordForm.formState.isValid}
                className="flex items-center gap-2 px-6 py-6 border-none bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
