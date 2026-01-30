"use client";

import { OrderCard } from "@/components/order-card";

const MOCK_ORDERS = [
  {
    id: "1",
    orderNumber: "ACC-2024-001",
    date: "Jan 10, 2024",
    status: "shipped" as const,
    total: 249.99,
    itemCount: 3,
  },
  {
    id: "2",
    orderNumber: "ACC-2024-002",
    date: "Jan 8, 2024",
    status: "in-production" as const,
    total: 129.99,
    itemCount: 1,
  },
  {
    id: "3",
    orderNumber: "ACC-2024-003",
    date: "Jan 5, 2024",
    status: "placed" as const,
    total: 449.99,
    itemCount: 5,
  },
];

export default function OrdersPage() {
  return (
    <div className="max-w-6xl w-full mx-auto">
      <h1 className="text-3xl font-bold text-secondary mb-8">Orders</h1>

      {MOCK_ORDERS.length === 0 ? (
        <div className="bg-white border border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <a href="/catalog" className="text-primary hover:underline font-semibold">
            Start ordering →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_ORDERS.map((order) => (
            <OrderCard key={order.id} {...order} />
          ))}
        </div>
      )}
    </div>
  );
}
