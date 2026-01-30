"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/primary-button";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const MOCK_CART: CartItem[] = [
  { id: "1", name: "Business Cards - Full Color", price: 49.99, quantity: 2 },
  { id: "3", name: "Brochures - Tri-fold", price: 129.99, quantity: 1 },
];

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(MOCK_CART);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity } : item)));
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto">
      <h1 className="text-3xl font-bold text-secondary mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <button onClick={() => router.push("/catalog")} className="text-primary hover:underline font-semibold">
            Continue shopping →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white border border-muted rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-secondary">{item.name}</h3>
                    <p className="text-lg font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => updateQuantity(item.id, 0)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border border-muted rounded hover:bg-muted">
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                    className="w-12 text-center border border-muted rounded py-1"
                  />
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border border-muted rounded hover:bg-muted">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-muted rounded-lg p-6 sticky top-8">
              <h2 className="font-bold text-secondary text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-secondary font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-secondary font-medium">Calculated at checkout</span>
                </div>
              </div>
              <div className="flex justify-between mb-6 text-lg">
                <span className="font-bold text-secondary">Total</span>
                <span className="font-bold text-primary">${total.toFixed(2)}</span>
              </div>
              <PrimaryButton onClick={() => router.push("/checkout")}>Proceed to Checkout</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
