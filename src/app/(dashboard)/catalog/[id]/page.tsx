"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Tag, Box, CheckCircle2, XCircle, FileText, Info, Layers } from "lucide-react";

interface Specification {
  id?: number;
  key: string;
  value: string;
}

interface OrderField {
  id?: number;
  label: string;
  type: string;
  required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: string[];
}

interface MediaItem {
  id?: number;
  url?: string;
  name?: string;
  type?: string;
}

interface ProductDetail {
  id: number;
  title: string;
  sku: string;
  price?: number;
  stock?: number;
  is_active: boolean;
  base_description?: string;
  specifications?: Specification[];
  order_fields?: OrderField[];
  media?: MediaItem[];
  created_at?: string;
  updated_at?: string;
}

function normalizeProduct(response: any): ProductDetail {
  if (response?.data) return response.data;
  return response;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProduct(id),
    select: (res) => normalizeProduct(res),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl w-full mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="space-y-2 mt-8">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-5xl w-full mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-primary font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Catalog
        </button>
        <div className="bg-white border border-red-100 rounded-2xl p-12 text-center">
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">{(error as any)?.message || "The product you're looking for doesn't exist or has been removed."}</p>
          <button
            onClick={() => router.push("/catalog")}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  const specifications = product.specifications || [];
  const orderFields = product.order_fields || [];
  const media = product.media || [];

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-primary font-semibold transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Catalog
      </button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column — Media */}
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative">
            {media.length > 0 && media[0].url ? (
              <Image src={media[0].url} alt={product.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <ShoppingBag size={80} strokeWidth={0.8} />
                <span className="text-sm mt-3 font-medium">No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {media.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {media.slice(0, 4).map((item, index) => (
                <div key={item.id || index} className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                  {item.url ? (
                    <Image src={item.url} alt={`${product.title} - ${index + 1}`} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FileText size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column — Product Info */}
        <div className="space-y-6">
          {/* SKU & Status */}
          <div className="flex items-center gap-3 flex-wrap">
            {product.sku && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                <Tag size={12} />
                {product.sku}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
              }`}
            >
              {product.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {product.is_active ? "Available" : "Unavailable"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{product.title}</h1>

          {/* Price */}
          {product.price != null && (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
              <span className="text-sm text-gray-400 font-medium">per unit</span>
            </div>
          )}

          {/* Stock */}
          {product.stock != null && (
            <div className="flex items-center gap-2 text-sm">
              <Box size={16} className="text-gray-400" />
              <span className="text-gray-600">
                <strong className="text-gray-900">{product.stock}</strong> in stock
              </span>
            </div>
          )}

          {/* Description */}
          {product.base_description && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
              <div
                className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: product.base_description,
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/catalog")}
              className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {specifications.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Layers size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {specifications.map((spec, index) => (
              <div key={spec.id || index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-500">{spec.key}</span>
                <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Fields Section */}
      {orderFields.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Info size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Ordering Information</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">The following details will be required when placing an order for this product:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orderFields.map((field, index) => (
              <div key={field.id || index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  {field.help_text && <p className="text-xs text-gray-500 mt-0.5">{field.help_text}</p>}
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-bold">{field.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
