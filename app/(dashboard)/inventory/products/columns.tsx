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
import Link from "next/link"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

const getProductStatus = (product: Product) => {
    if (!product.isActive) return "closed for sale"
    if (product.stock === 0) return "out of stock"
    return "active"
}

interface ColumnsProps {
    onViewDetails?: (product: Product) => void
    pageIndex?: number
    pageSize?: number
}

export const createColumns = (props?: ColumnsProps): ColumnDef<Product>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "rowNumber",
        header: "#",
        enableHiding: false,
        cell: ({ row, table }) => {
            const pageIndex = props?.pageIndex || 1
            const pageSize = props?.pageSize || 10
            const rowNumber = (pageIndex - 1) * pageSize + row.index + 1
            return (
                <div className="w-10 text-center text-xs text-muted-foreground font-medium">
                    {rowNumber}
                </div>
            )
        },
    },
    {
        accessorKey: "productName",
        header: "Product Name",
        enableHiding: false,
        cell: ({ row }) => {
            const product = row.original
            const imageUrl = product.imageUrl || "/placeholder-product.png"
            return (
                <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded border bg-muted flex-shrink-0">
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
                                <span className="text-[10px] text-muted-foreground">No Img</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">{product.title}</span>
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
            return <div className="font-medium text-sm">{formatted}</div>
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.category
            return (
                <span className="text-xs text-muted-foreground">
                    {category?.title || "-"}
                </span>
            )
        },
    },
    {
        accessorKey: "code",
        header: "SKU",
        cell: ({ row }) => {
            return <span className="text-xs text-muted-foreground font-mono">{row.getValue("code")}</span>
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
            return <Badge variant={config.variant} className="text-xs h-5">{config.label}</Badge>
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
                        <Button variant="ghost" className="h-7 w-7 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-3.5 w-3.5" />
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
