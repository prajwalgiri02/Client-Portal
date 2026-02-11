import { http } from "./http";

export interface Product {
  id: number;
  title: string;
  sku: string;
  price?: number;
  stock?: number;
  is_active: boolean;
  base_description?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
  media?: Array<{
    id: number | string;
    url: string;
    type: string;
  }>;
  specifications?: any[];
  order_fields?: any[];
}

export function normalizeList<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

export const productsApi = {
  getProducts: async (params?: { search?: string; page?: number; perPage?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.perPage) query.append("perPage", params.perPage.toString());

    const queryString = query.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;
    return http.get<Product[] | { data: Product[] }>(endpoint);
  },

  getProduct: (id: string | number) => http.get<Product | { data: Product }>(`/api/products/${id}`),

  createProduct: (data: any) => http.post<Product>(`/api/products`, data),

  updateProduct: (id: string | number, data: any) => http.post<Product>(`/api/products/${id}`, data),

  deleteProduct: (id: number) => http.delete(`/api/products/${id}`),
};
