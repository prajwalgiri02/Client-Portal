"use client";

import * as React from "react";
import { ProductForm } from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function CreateProductPage() {
  const formRef = React.useRef<any>(null);
  const [isPending, setIsPending] = React.useState(false);

  const handlePublish = () => {
    formRef.current?.submit(true);
  };

  const handleSaveDraft = () => {
    formRef.current?.submit(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Product</h1>
            <p className="text-muted-foreground text-sm">Add a new product to your catalog with custom fields and media.</p>
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

      <ProductForm ref={formRef} onLoading={setIsPending} />
    </div>
  );
}
