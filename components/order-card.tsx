import Link from "next/link"

type OrderStatus = "placed" | "in-production" | "shipped"

interface OrderCardProps {
  id: string
  orderNumber: string
  date: string
  status: OrderStatus
  total: number
  itemCount: number
}

const statusColors: Record<OrderStatus, string> = {
  placed: "bg-blue-100 text-blue-800",
  "in-production": "bg-orange-100 text-orange-800",
  shipped: "bg-green-100 text-green-800",
}

const statusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  "in-production": "In Production",
  shipped: "Shipped",
}

export function OrderCard({ id, orderNumber, date, status, total, itemCount }: OrderCardProps) {
  return (
    <div className="bg-white border border-muted rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">Order #</p>
          <p className="font-semibold text-secondary">{orderNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground">Date</p>
          <p className="font-medium text-secondary">{date}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Items</p>
          <p className="font-medium text-secondary">{itemCount}</p>
        </div>
      </div>
      <div className="border-t border-muted pt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-primary">${total.toFixed(2)}</p>
        </div>
        <Link href={`/orders/${id}`}>
          <button className="text-primary hover:text-orange-600 font-semibold text-sm">View Details →</button>
        </Link>
      </div>
    </div>
  )
}
