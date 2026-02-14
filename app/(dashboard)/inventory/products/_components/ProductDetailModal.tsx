"use client"

import { useState, useEffect } from "react"
import { Product } from "@/types/product"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Package, Edit, Calendar, Hash, Loader2, Box, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"
import { productAPI } from "@/lib/api/product"

interface ProductDetailModalProps {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
    const [fullProduct, setFullProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)

    // Fetch full product details when modal opens
    useEffect(() => {
        if (open && product?.id) {
            const fetchFullProduct = async () => {
                try {
                    setLoading(true)
                    const data = await productAPI.getProduct(product.id)
                    setFullProduct(data)
                } catch (error) {
                    console.error("Failed to fetch product details:", error)
                    setFullProduct(product) // Fallback to passed product
                } finally {
                    setLoading(false)
                }
            }
            fetchFullProduct()
        } else {
            setFullProduct(product)
        }
    }, [open, product])

    if (!product) return null

    const displayProduct = fullProduct || product

    const getProductStatus = (product: Product) => {
        if (!product.isActive) return { label: "Closed", variant: "outline" as const }
        if (product.stock === 0) return { label: "Out of Stock", variant: "secondary" as const }
        return { label: "Active", variant: "default" as const }
    }

    const status = getProductStatus(displayProduct)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-4 py-3 border-b border-border/50 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-lg font-semibold mb-1.5 truncate">
                                {displayProduct.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-foreground">Category:</span>
                                    <span>{displayProduct.category?.title || "N/A"}</span>
                                </div>
                                <Separator orientation="vertical" className="h-3" />
                                <div className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    <span>SKU: {displayProduct.code}</span>
                                </div>
                            </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="h-7 ml-3 flex-shrink-0 text-xs">
                            <Link href={`/inventory/products/${displayProduct.id}`}>
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center p-12 flex-1">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                    {/* Left Column - Images */}
                    <div className="space-y-2">
                        <div className="relative aspect-square w-full rounded-lg border border-border/50 overflow-hidden bg-muted/30">
                            {displayProduct.imageUrl ? (
                                <Image
                                    src={displayProduct.imageUrl}
                                    alt={displayProduct.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Package className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        {/* Additional images grid if available */}
                        {displayProduct.imageUrl && (
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="relative aspect-square rounded-md border border-border/50 overflow-hidden bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors"
                                    >
                                        {displayProduct.imageUrl ? (
                                            <Image
                                                src={displayProduct.imageUrl}
                                                alt={`${displayProduct.title} ${i}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Info Card */}
                        <Card className="p-4 border border-border/50 bg-muted/20">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Box className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Stock Status</span>
                                    </div>
                                    <Badge 
                                        variant={displayProduct.stock > 0 ? "default" : "secondary"}
                                        className="text-xs h-5"
                                    >
                                        {displayProduct.stock > 0 ? "In Stock" : "Out of Stock"}
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Price</span>
                                    </div>
                                    <span className="text-sm font-semibold">${displayProduct.price.toFixed(2)}</span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Status</span>
                                    </div>
                                    <Badge variant={status.variant} className="text-xs h-5">
                                        {status.label}
                                    </Badge>
                                </div>

                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-3">
                        {/* Price and Stats */}
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-2xl font-bold">${displayProduct.price.toFixed(2)}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">No. of Orders</p>
                                    <p className="text-sm font-semibold">-</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Available Stocks</p>
                                    <p className="text-sm font-semibold">{displayProduct.stock.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Total Revenue</p>
                                    <p className="text-sm font-semibold">-</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold mb-1.5">Description:</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {displayProduct.metadata?.description || "No description available."}
                            </p>
                        </div>

                        <Separator className="my-4" />

                        {/* Variation Options */}
                        {displayProduct.hasVariations && displayProduct.variationOptions && displayProduct.variationOptions.length > 0 && (
                            <>
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">Variation Options</h3>
                                    <div className="space-y-2.5">
                                        {displayProduct.variationOptions.map((option, optIndex) => (
                                            <div key={optIndex} className="space-y-1.5">
                                                <p className="text-xs font-medium text-foreground">{option.name}:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {option.values && option.values.length > 0 ? (
                                                        option.values.map((value, valIndex) => (
                                                            <Badge
                                                                key={valIndex}
                                                                variant="outline"
                                                                className="text-xs h-5 px-2"
                                                            >
                                                                {value.value}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No values</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="my-4" />
                            </>
                        )}

                        {/* Key Features */}
                        {displayProduct.metadata && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Key Features:</h3>
                                <ul className="space-y-1.5">
                                    {displayProduct.metadata.color && (
                                        <li className="flex items-center gap-2 text-xs">
                                            <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0"></span>
                                            <span>Color: {displayProduct.metadata.color}</span>
                                        </li>
                                    )}
                                    {displayProduct.metadata.warranty && (
                                        <li className="flex items-center gap-2 text-xs">
                                            <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0"></span>
                                            <span>Warranty: {displayProduct.metadata.warranty}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <Separator className="my-4" />

                        {/* Product Information Table */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Product Information</h3>
                            <div className="space-y-1.5">
                                {displayProduct.metadata?.color && (
                                    <div className="flex justify-between py-1.5 border-b border-border/50">
                                        <span className="text-xs text-muted-foreground">Color</span>
                                        <span className="text-xs font-medium">{displayProduct.metadata.color}</span>
                                    </div>
                                )}
                                {displayProduct.metadata?.warranty && (
                                    <div className="flex justify-between py-1.5 border-b border-border/50">
                                        <span className="text-xs text-muted-foreground">Warranty</span>
                                        <span className="text-xs font-medium">{displayProduct.metadata.warranty}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1.5">
                                    <span className="text-xs text-muted-foreground">Stock</span>
                                    <span className="text-xs font-medium">{displayProduct.stock}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    </div>

                    {/* Product Variants - Full Width */}
                    {displayProduct.hasVariations && displayProduct.productVariants && displayProduct.productVariants.length > 0 && (
                        <div className="px-5 pb-5">
                            <Separator className="mb-4" />
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Available Variants</h3>
                                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    {displayProduct.productVariants.map((variant) => {
                                        // Build variant title from variation values
                                        const variantTitle = variant.variationValues
                                            ?.map((vv) => vv.value)
                                            .filter(Boolean)
                                            .join(" / ") || variant.title || "Variant"
                                        
                                        return (
                                            <div
                                                key={variant.id}
                                                className="flex items-center justify-between p-2 rounded-md border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{variantTitle}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">SKU: {variant.sku}</p>
                                                </div>
                                                <div className="text-right ml-3 flex-shrink-0">
                                                    <p className="text-xs font-semibold">${variant.price.toFixed(2)}</p>
                                                    <p className="text-xs text-muted-foreground">Stock: {variant.stock}</p>
                                                    <Badge 
                                                        variant={variant.isActive ? "default" : "secondary"} 
                                                        className="text-xs h-4 px-1.5 mt-0.5"
                                                    >
                                                        {variant.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

