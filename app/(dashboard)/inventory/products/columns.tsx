"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/types/product"
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Rating } from "./_components/Rating"
import Link from "next/link"
import Image from "next/image"

// Mock rating and status for products (in real app, these would come from API)
const getProductRating = (productId: number) => {
    const ratings: Record<number, number> = {
        1: 4.9,
        2: 4.65,
        3: 4.65,
        4: 4.65,
        5: 4.65,
    }
    return ratings[productId] || 4.5
}

const getProductStatus = (product: Product) => {
    if (!product.isActive) return "closed for sale"
    if (product.stock === 0) return "out of stock"
    return "active"
}

interface ColumnsProps {
    onViewDetails?: (product: Product) => void
}

export const createColumns = (props?: ColumnsProps): ColumnDef<Product>[] => [
    {
        accessorKey: "productName",
        header: "Product Name",
        enableHiding: false,
        cell: ({ row }) => {
            const product = row.original
            const imageUrl = product.imageUrl || "/placeholder-product.png"
            return (
                <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted flex-shrink-0">
                        {product.imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full bg-muted">
                                <span className="text-xs text-muted-foreground">No Image</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">{product.title}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(price)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.category
            return (
                <span className="text-sm text-muted-foreground">
                    {category?.title || "-"}
                </span>
            )
        },
    },
    {
        accessorKey: "code",
        header: "SKU",
        cell: ({ row }) => {
            return <span className="text-sm text-muted-foreground">{row.getValue("code")}</span>
        },
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => {
            const rating = getProductRating(row.original.id)
            return <Rating value={rating} />
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = getProductStatus(row.original)
            const statusConfig: Record<
                string,
                { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
            > = {
                active: { label: "active", variant: "default" },
                "out of stock": { label: "out of stock", variant: "secondary" },
                "closed for sale": { label: "closed for sale", variant: "outline" },
            }
            const config = statusConfig[status] || statusConfig.active
            return <Badge variant={config.variant}>{config.label}</Badge>
        },
    },
    {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => {
            const product = row.original
            const onViewDetails = props?.onViewDetails

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {onViewDetails && (
                            <DropdownMenuItem onClick={() => onViewDetails(product)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                            <Link href={`/inventory/products/${product.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
