import { cookies } from "next/headers";
import { CONFIG } from "@/lib/config";

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  client_id: number | null;
  roles: string[];
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export async function getMe(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${CONFIG.API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || data; // Handle case where user object might be wrapped
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
