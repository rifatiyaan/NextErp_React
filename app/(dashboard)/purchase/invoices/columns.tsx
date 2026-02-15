"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Purchase } from "@/types/purchase"
import { MoreHorizontal, Eye } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"

interface ColumnsProps {
    onViewDetails?: (purchase: Purchase) => void
    pageIndex?: number
    pageSize?: number
}

export const createColumns = (props?: ColumnsProps): ColumnDef<Purchase>[] => [
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
            const rowIndex = table.getRowModel().rows.findIndex((r) => r.id === row.id)
            return (pageIndex - 1) * pageSize + rowIndex + 1
        },
    },
    {
        accessorKey: "purchaseNumber",
        header: "Purchase #",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("purchaseNumber")}</div>
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate">{row.getValue("title")}</div>
        ),
    },
    {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ row }) => (
            <div className="max-w-[150px] truncate">{row.getValue("supplierName")}</div>
        ),
    },
    {
        accessorKey: "purchaseDate",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("purchaseDate"))
            return <div>{format(date, "MMM dd, yyyy")}</div>
        },
    },
    {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => {
            const items = row.getValue("items") as Purchase["items"]
            return <div>{items?.length || 0} item(s)</div>
        },
    },
    {
        accessorKey: "totalAmount",
        header: "Total Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
            return <div className="font-medium">${amount.toFixed(2)}</div>
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive")
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const purchase = row.original

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
                        <DropdownMenuItem
                            onClick={() => props?.onViewDetails?.(purchase)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

