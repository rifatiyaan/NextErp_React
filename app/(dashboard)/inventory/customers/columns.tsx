"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Customer } from "@/types/customer"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
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

interface ColumnsProps {
    pageIndex?: number
    pageSize?: number
}

export const createColumns = (props?: ColumnsProps): ColumnDef<Customer>[] => [
    {
        id: "rowNumber",
        header: "#",
        enableHiding: false,
        cell: ({ row }) => {
            const pageIndex = props?.pageIndex || 1
            const pageSize = props?.pageSize || 10
            const rowNumber = (pageIndex - 1) * pageSize + row.index + 1
            return (
                <div className="w-12 text-center text-sm text-muted-foreground font-medium">
                    {rowNumber}
                </div>
            )
        },
    },
    {
        accessorKey: "title",
        header: "Customer Name",
        enableHiding: false,
        cell: ({ row }) => {
            const customer = row.original
            return (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {customer.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">{customer.title}</span>
                        {customer.email && (
                            <span className="text-sm text-muted-foreground">
                                {customer.email}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
            const phone = row.original.phone
            return phone ? (
                <span className="text-sm">{phone}</span>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => {
            const address = row.original.address
            return address ? (
                <span className="text-sm">{address}</span>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "metadata.loyaltyCode",
        header: "Loyalty Code",
        cell: ({ row }) => {
            const loyaltyCode = row.original.metadata?.loyaltyCode
            return loyaltyCode ? (
                <Badge variant="secondary">{loyaltyCode}</Badge>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive
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
            const customer = row.original

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
                            <Link
                                href={`/inventory/customers/${customer.id}`}
                                className="flex items-center"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                // TODO: Implement delete
                                console.log("Delete customer", customer.id)
                            }}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export const columns = createColumns()

