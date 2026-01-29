import Cookies from "js-cookie";
import { CONFIG } from "@/lib/config";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = Cookies.get("token");
  const url = endpoint.startsWith("http") ? endpoint : `${CONFIG.API_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorData = data && typeof data === "object" ? data : { message: data };
    throw new ApiError(errorData.message || response.statusText || "Request failed", response.status, errorData);
  }

  return data as T;
}

export const http = {
  get: <T>(url: string, options?: RequestInit) => fetcher<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body?: any, options?: RequestInit) =>
    fetcher<T>(url, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(url: string, body?: any, options?: RequestInit) =>
    fetcher<T>(url, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: any, options?: RequestInit) =>
    fetcher<T>(url, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: RequestInit) => fetcher<T>(url, { ...options, method: "DELETE" }),
};
