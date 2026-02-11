import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  sku?: string;
}

export function ProductCard({ id, name, price, image, sku }: ProductCardProps) {
  return (
    <Link href={`/catalog/${id}`} className="group block">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          {image ? (
            <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <ShoppingBag size={48} strokeWidth={1} />
            </div>
          )}
        </div>
        <div className="p-4">
          {sku && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{sku}</p>}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">${price.toFixed(2)}</p>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
