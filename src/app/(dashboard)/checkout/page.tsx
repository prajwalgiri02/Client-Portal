"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "@/components/form-input";
import { PrimaryButton } from "@/components/primary-button";

const checkoutSchema = z.object({
  poNumber: z.string().min(1, "PO Number is required"),
  neededByDate: z.string().min(1, "Needed by date is required"),
  notes: z.string().optional().default(""),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      poNumber: "",
      neededByDate: "",
      notes: "",
    },
  });

  const onSubmit = async (values: CheckoutValues) => {
    setIsLoading(true);
    // Mimic API call
    setTimeout(() => {
      router.push("/confirmation");
    }, 500);
  };

  const orderTotal = 209.97;

  return (
    <div className="max-w-4xl w-full mx-auto">
      <h1 className="text-3xl font-bold text-secondary mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white border border-muted rounded-lg p-6">
              <h2 className="font-bold text-secondary text-lg mb-6">Order Details</h2>

              <div className="mb-4">
                <FormInput label="PO Number" id="poNumber" {...register("poNumber")} placeholder="Enter your PO number" required />
                {errors.poNumber && <p className="text-xs text-red-500 mt-1">{errors.poNumber.message}</p>}
              </div>

              <div className="mb-4">
                <FormInput label="Needed by Date" id="neededByDate" type="date" {...register("neededByDate")} required />
                {errors.neededByDate && <p className="text-xs text-red-500 mt-1">{errors.neededByDate.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-secondary mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Any special instructions or notes for your order..."
                  rows={4}
                  className="w-full px-4 py-3 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <PrimaryButton type="submit" isLoading={isLoading}>
              Place Order
            </PrimaryButton>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-muted rounded-lg p-6 sticky top-8">
            <h2 className="font-bold text-secondary text-lg mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-muted">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Business Cards (2x)</span>
                <span className="text-secondary font-medium">$99.98</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Brochures (1x)</span>
                <span className="text-secondary font-medium">$129.99</span>
              </div>
            </div>

            <div className="space-y-2 mb-6 pb-6 border-b border-muted text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-secondary">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-secondary">$16.80</span>
              </div>
            </div>

            <div className="flex justify-between mb-6 text-lg">
              <span className="font-bold text-secondary">Total</span>
              <span className="font-bold text-primary">${(orderTotal + 16.8).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
