"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "../../components/ProductForm";
import { productsApi } from "@/lib/api/products";
import { PageLoader } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const formRef = React.useRef<any>(null);
  const [isPending, setIsPending] = React.useState(false);

  // Fetch product data
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProduct(id),
    select: (res: any) => res.data || res,
  });

  const handlePublish = () => {
    formRef.current?.submit(true);
  };

  const handleSaveDraft = () => {
    formRef.current?.submit(false);
  };

  if (isLoading) return <PageLoader />;
  if (!data) return <div className="p-8 text-center">Product not found.</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Product</h1>
            <p className="text-muted-foreground text-sm">Update product details, media assets, and order form configuration.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 px-4 rounded-lg" onClick={handleSaveDraft} disabled={isPending}>
              Save draft
            </Button>
            <Button className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90" onClick={handlePublish} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </div>
        </div>
      </div>

      <ProductForm ref={formRef} initialData={data} isEdit onLoading={setIsPending} />
    </div>
  );
}
