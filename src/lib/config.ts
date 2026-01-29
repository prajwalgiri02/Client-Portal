export const CONFIG = {
  BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME || "PromoRepeat",
  BRAND_SHORT: process.env.NEXT_PUBLIC_BRAND_SHORT || "PR",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
} as const;
