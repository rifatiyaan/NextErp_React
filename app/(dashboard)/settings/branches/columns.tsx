"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Branch } from "@/lib/types/branch"
import { MoreHorizontal, Pencil, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface ColumnsProps {
    pageIndex?: number
    pageSize?: number
    onDeactivate: (branch: Branch) => void
}

export const createColumns = ({ pageIndex = 1, pageSize = 10, onDeactivate }: ColumnsProps): ColumnDef<Branch>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(v) => row.toggleSelected(!!v)}
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
        cell: ({ row }) => (
            <div className="w-10 text-center text-xs text-muted-foreground font-medium">
                {(pageIndex - 1) * pageSize + row.index + 1}
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Branch Name",
        enableHiding: false,
        cell: ({ row }) => {
            const branch = row.original
            return (
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {branch.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium leading-tight">{branch.name}</span>
                        {branch.metadata?.branchCode && (
                            <span className="truncate text-[11px] text-muted-foreground">
                                #{branch.metadata.branchCode}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <span className="line-clamp-1 text-sm">
                {row.original.address ?? <span className="text-muted-foreground">—</span>}
            </span>
        ),
    },
    {
        id: "manager",
        header: "Manager",
        cell: ({ row }) => {
            const mgr = row.original.metadata?.managerName
            return mgr ? (
                <span className="text-sm">{mgr}</span>
            ) : (
                <span className="text-muted-foreground">—</span>
            )
        },
    },
    {
        id: "phone",
        header: "Phone",
        cell: ({ row }) => {
            const phone = row.original.metadata?.phone
            return phone ? (
                <span className="text-sm">{phone}</span>
            ) : (
                <span className="text-muted-foreground">—</span>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={row.original.isActive ? "default" : "secondary"}
                className="h-5 px-1.5 text-[10px] font-medium"
            >
                {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const branch = row.original
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
                            <Link href={`/settings/branches/${branch.id}`} className="flex items-center">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {branch.isActive && (
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDeactivate(branch)}
                            >
                                <PowerOff className="mr-2 h-4 w-4" />
                                Deactivate
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
