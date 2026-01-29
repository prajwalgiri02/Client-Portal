<Card className="overflow-hidden">
            {/* Cover */}
            <div className="relative h-40 bg-muted">
              {product.media?.[0]?.previewUrl ? (
                <img src={product.media[0].previewUrl} alt={product.title || "Product"} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No cover image</div>
              )}

              {/* Top overlay */}
              <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
                <Badge variant={product.active ? "default" : "secondary"}>{product.active ? "Active" : "Inactive"}</Badge>

                <Button
                  size="sm"
                  className="shadow"
                  onClick={openOrderModal}
                  disabled={!product.fieldSetActive || product.orderFields.filter((f) => f.active).length === 0}
                >
                  Order
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold leading-snug line-clamp-2">{product.title || "Product Title"}</h3>

                {product.sku ? (
                  <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">SKU: —</p>
                )}
              </div>

              {product.baseDescription ? (
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{product.baseDescription}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description</p>
              )}

              {/* Specs as chips */}
              {product.specs?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">Specs</p>
                  <div className="flex flex-wrap gap-2">
                    {product.specs.map((spec) => {
                      const value =
                        spec.valueType === "text" ? spec.valueText || "" : `${spec.valueNumber ?? ""}${spec.valueUnit ? " " + spec.valueUnit : ""}`;

                      return (
                        <div
                          key={spec.id}
                          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                          title={`${spec.label || "—"}: ${value || "—"}`}
                        >
                          <span className="text-muted-foreground">{spec.label || "—"}:</span>
                          <span className="font-medium">{value || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Media row */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">{product.media?.length ? `${product.media.length} file(s)` : "No media"}</p>

                {product.media?.length > 0 && (
                  <div className="flex -space-x-2">
                    {product.media.slice(0, 3).map((file) => (
                      <div key={file.id} className="h-8 w-8 rounded-md border border-border bg-muted overflow-hidden" title={file.name}>
                        {file.previewUrl ? (
                          <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">{file.type}</div>
                        )}
                      </div>
                    ))}
                    {product.media.length > 3 && (
                      <div className="h-8 w-8 rounded-md border border-border bg-background flex items-center justify-center text-[10px] text-muted-foreground">
                        +{product.media.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Order Form Preview</h3>
            <div className="space-y-3 text-sm">
              {product.fieldSetActive ? (
                product.orderFields.filter((f) => f.active).length > 0 ? (
                  <div className="space-y-2">
                    {product.orderFields
                      .filter((f) => f.active)
                      .map((field) => (
                        <div key={field.id} className="space-y-1">
                          <div className="text-xs font-medium flex items-center gap-1">
                            {field.label || "Untitled Field"}
                            {field.required && <span className="text-destructive">*</span>}
                          </div>
                          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
                          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                            <div className="opacity-80 pointer-events-none">{renderOrderInput(field)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No fields added yet</p>
                )
              ) : (
                <p className="text-xs text-muted-foreground italic">Order form is inactive</p>
              )}
            </div>
          </Card>