import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image?: string
}

export function ProductCard({ id, name, price, image }: ProductCardProps) {
  return (
    <div className="bg-white border border-muted rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-muted relative overflow-hidden">
        {image ? (
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl">▢</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-secondary mb-2 line-clamp-2">{name}</h3>
        <p className="text-lg font-bold text-primary mb-3">${price.toFixed(2)}</p>
        <Link href={`/product/${id}`} className="w-full inline-block">
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded transition-colors text-sm">
            View
          </button>
        </Link>
      </div>
    </div>
  )
}
