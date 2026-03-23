"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Supplier } from "@/types/supplier"
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
import { Checkbox } from "@/components/ui/checkbox"

interface ColumnsProps {
    pageIndex?: number
    pageSize?: number
}

export const createColumns = (props?: ColumnsProps): ColumnDef<Supplier>[] => [
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
        cell: ({ row }) => {
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
        accessorKey: "title",
        header: "Supplier Name",
        enableHiding: false,
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {supplier.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium leading-tight">{supplier.title}</span>
                        {supplier.contactPerson && (
                            <span className="truncate text-[11px] text-muted-foreground">
                                {supplier.contactPerson}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const email = row.original.email
            return email ? (
                <span className="truncate">{email}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
            const phone = row.original.phone
            return phone ? (
                <span>{phone}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => {
            const address = row.original.address
            return address ? (
                <span className="line-clamp-2">{address}</span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "metadata.vatNumber",
        header: "VAT Number",
        cell: ({ row }) => {
            const vatNumber = row.original.metadata?.vatNumber
            return vatNumber ? (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                    {vatNumber}
                </Badge>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive
            return (
                <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="h-5 px-1.5 text-[10px] font-medium"
                >
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const supplier = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/inventory/suppliers/${supplier.id}`}
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
                                console.log("Delete supplier", supplier.id)
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

