"use client";

import { useRouter } from "next/navigation";

export default function ConfirmationPage() {
  const router = useRouter();
  const orderNumber = "ACC-2024-" + Math.floor(Math.random() * 100000);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-secondary mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">Your order has been successfully placed.</p>

        <div className="bg-white border border-muted rounded-lg p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-2">Order Number</p>
          <p className="text-2xl font-bold text-primary mb-4">{orderNumber}</p>
          <p className="text-sm text-muted-foreground">You'll receive an email confirmation shortly with order details and tracking information.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/orders")}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            View Orders
          </button>
          <button
            onClick={() => router.push("/catalog")}
            className="w-full border border-primary text-primary hover:bg-orange-50 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
