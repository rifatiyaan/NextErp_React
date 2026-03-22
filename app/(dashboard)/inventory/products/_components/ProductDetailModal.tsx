"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Product } from "@/types/product"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { productAPI } from "@/lib/api/product"
import { ProductHeader } from "./product-detail/ProductHeader"
import { ProductStats } from "./product-detail/ProductStats"
import { ProductVariants } from "./product-detail/ProductVariants"
import { ProductInfo } from "./product-detail/ProductInfo"
import { ProductMedia } from "./product-detail/ProductMedia"
import {
    sortByDisplayOrder,
    selectionFromVariant,
    findVariantForSelection,
    defaultVariant,
} from "./product-detail/variant-utils"
import { cn } from "@/lib/utils"

interface ProductDetailModalProps {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

function formatMoney(amount: number): string {
    return `$${amount.toFixed(2)}`
}

function formatCreatedAt(iso?: string | null): string {
    if (!iso) return "—"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return "—"
    return format(d, "MMM d, yyyy")
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
    const [fullProduct, setFullProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [variantSelection, setVariantSelection] = useState<Record<number, number>>({})

    useEffect(() => {
        if (open && product?.id) {
            const fetchFullProduct = async () => {
                try {
                    setLoading(true)
                    const data = await productAPI.getProduct(product.id)
                    setFullProduct(data)
                } catch (error) {
                    console.error("Failed to fetch product details:", error)
                    setFullProduct(product)
                } finally {
                    setLoading(false)
                }
            }
            void fetchFullProduct()
        } else {
            setFullProduct(product)
        }
    }, [open, product])

    const displayProduct = fullProduct ?? product

    const sortedVariationOptions = useMemo(() => {
        if (!displayProduct) return []
        return sortByDisplayOrder(displayProduct.variationOptions ?? [])
    }, [displayProduct])

    useEffect(() => {
        if (!open || !displayProduct) return
        const variants = displayProduct.productVariants
        if (variants?.length && sortedVariationOptions.length) {
            const def = defaultVariant(variants)
            if (def) setVariantSelection(selectionFromVariant(def, sortedVariationOptions))
        } else {
            setVariantSelection({})
        }
    }, [open, displayProduct, sortedVariationOptions])

    const selectedVariant = useMemo(() => {
        if (!displayProduct) return null
        const variants = displayProduct.productVariants
        if (!variants?.length || !sortedVariationOptions.length) return null
        return (
            findVariantForSelection(variants, sortedVariationOptions, variantSelection) ??
            defaultVariant(variants)
        )
    }, [displayProduct, sortedVariationOptions, variantSelection])

    const displayPrice = useMemo(() => {
        if (!displayProduct) return 0
        if (selectedVariant) {
            const p = selectedVariant.price
            return p > 0 ? p : displayProduct.price
        }
        return displayProduct.price
    }, [selectedVariant, displayProduct])

    const displayStock =
        displayProduct && selectedVariant ? selectedVariant.stock : (displayProduct?.stock ?? 0)
    const inStock = displayStock > 0

    const displaySku = selectedVariant?.sku || displayProduct?.code || ""

    const galleryUrls = useMemo(() => {
        if (!displayProduct?.imageUrl) return []
        return [displayProduct.imageUrl]
    }, [displayProduct?.imageUrl])

    const descriptionText = displayProduct?.metadata?.description?.trim() ?? ""

    const featureItems = useMemo(() => {
        const m = displayProduct?.metadata
        if (!m) return []
        const items: string[] = []
        if (m.color?.trim()) items.push(`Color: ${m.color.trim()}`)
        if (m.warranty?.trim()) items.push(`Warranty: ${m.warranty.trim()}`)
        return items
    }, [displayProduct?.metadata])

    const handleSelectVariation = useCallback(
        (_optionId: number, _valueId: number, valueLabel: string) => {
            if (!displayProduct) return
            const variants = displayProduct.productVariants ?? []
            const options = sortedVariationOptions
            if (!variants.length || !options.length) return

            const matching = variants.filter((v) =>
                (v.variationValues ?? []).some((x) => x.value === valueLabel)
            )
            const pick = matching.find((v) => v.isActive) ?? matching[0]
            if (pick) setVariantSelection(selectionFromVariant(pick, options))
        },
        [displayProduct, sortedVariationOptions]
    )

    const showVariations =
        Boolean(displayProduct?.hasVariations) &&
        sortedVariationOptions.length > 0 &&
        (displayProduct?.productVariants?.length ?? 0) > 0

    let sectionNum = 1
    const descSection = descriptionText ? sectionNum++ : null
    const varSection = showVariations ? sectionNum++ : null
    const featSection = featureItems.length > 0 ? sectionNum++ : null
    const infoSection = sectionNum

    const infoRows =
        displayProduct != null
            ? [
                  { label: "Stock", value: String(displayStock) },
                  { label: "SKU", value: displaySku },
                  { label: "Created date", value: formatCreatedAt(displayProduct.createdAt) },
              ]
            : []

    if (!product || !displayProduct) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "flex max-h-[82vh] w-[min(92vw,56rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-xl border-border/50 p-0 shadow-lg",
                    "bg-card"
                )}
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>{displayProduct.title}</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-1 items-center justify-center p-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.05fr)]">
                            <div className="border-b border-border/30 p-4 sm:p-4 lg:border-b-0 lg:border-e lg:pe-5">
                                <ProductMedia
                                    key={displayProduct.id}
                                    title={displayProduct.title}
                                    imageUrls={galleryUrls}
                                />
                            </div>

                            <div
                                className="min-h-0 overflow-y-auto p-4 sm:p-4 lg:ps-5"
                                style={{ scrollbarGutter: "stable" }}
                            >
                                <div className="mx-auto flex max-w-xl flex-col gap-4 lg:max-w-none">
                                    <ProductHeader
                                        title={displayProduct.title}
                                        sku={displayProduct.code}
                                        categoryLabel={displayProduct.category?.title ?? "—"}
                                        priceFormatted={formatMoney(displayPrice)}
                                        inStock={inStock}
                                        editHref={`/inventory/products/${displayProduct.id}`}
                                    />

                                    <div className="h-px w-full bg-border/40" aria-hidden />

                                    <ProductStats
                                        ordersDisplay="—"
                                        stockDisplay={displayStock.toLocaleString()}
                                        revenueDisplay="—"
                                    />

                                    {descriptionText && descSection != null && (
                                        <section className="space-y-2">
                                            <h3 className="text-xs font-medium text-foreground">
                                                <span className="text-muted-foreground">{descSection}. </span>
                                                Description
                                            </h3>
                                            <div className="rounded-xl border border-border/40 bg-muted/15 p-3 sm:p-3.5">
                                                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                                    {descriptionText}
                                                </p>
                                            </div>
                                        </section>
                                    )}

                                    {showVariations && varSection != null && (
                                        <ProductVariants
                                            options={sortedVariationOptions}
                                            selection={variantSelection}
                                            onSelectValue={handleSelectVariation}
                                            sectionIndex={varSection}
                                        />
                                    )}

                                    {featureItems.length > 0 && featSection != null && (
                                        <section className="space-y-2">
                                            <h3 className="text-xs font-medium text-foreground">
                                                <span className="text-muted-foreground">{featSection}. </span>
                                                Key features
                                            </h3>
                                            <div className="rounded-xl border border-border/40 bg-muted/15 p-3 sm:p-3.5">
                                                <ul className="list-disc space-y-1.5 ps-3.5 text-xs text-foreground/90 sm:text-sm">
                                                    {featureItems.map((item) => (
                                                        <li key={item} className="leading-relaxed">
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </section>
                                    )}

                                    <ProductInfo rows={infoRows} sectionIndex={infoSection} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
