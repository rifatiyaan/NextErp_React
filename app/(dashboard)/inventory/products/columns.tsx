"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/types/product"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => {
            const imageUrl = row.getValue("imageUrl") as string
            return (
                <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={row.getValue("title")}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <Image
                            src="https://placehold.co/600x400/png" // Placeholder
                            alt="No Image"
                            fill
                            className="object-cover opacity-50"
                        />
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "code",
        header: "Code",
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
        accessorKey: "stock",
        header: "Stock",
    },
    {
        accessorKey: "category.title",
        header: "Category",
        cell: ({ row }) => {
            return row.original.category?.title || "N/A"
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

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
