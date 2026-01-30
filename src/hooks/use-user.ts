import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/api/http";
import { User } from "@/lib/auth";
import Cookies from "js-cookie";

export function useUser() {
  return useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const token = Cookies.get("token");
      if (!token) return null;

      try {
        const response = await http.get<{ user: User } | User>("/api/auth/me");
        return "user" in response ? response.user : response;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
