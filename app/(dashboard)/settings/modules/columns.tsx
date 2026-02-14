"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Module, ModuleType } from "@/types/module"
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
import { DynamicIcon } from "@/components/dynamic-icon"
import { moduleAPI } from "@/lib/api/module"
import { Checkbox } from "@/components/ui/checkbox"

export const columns: ColumnDef<Module>[] = [
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
            return (
                <div className="w-10 text-center text-xs text-muted-foreground font-medium">
                    {row.index + 1}
                </div>
            )
        },
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            const module = row.original
            return (
                <div className="flex items-center gap-2">
                    {module.icon && (
                        <DynamicIcon name={module.icon as any} className="h-4 w-4" />
                    )}
                    <span className="font-medium">{module.title}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as ModuleType
            return (
                <Badge variant={type === ModuleType.Module ? "default" : "secondary"}>
                    {type === ModuleType.Module ? "Module" : "Link"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => {
            const url = row.getValue("url") as string | undefined
            return <span className="text-sm text-muted-foreground">{url || "—"}</span>
        },
    },
    {
        accessorKey: "parentId",
        header: "Parent",
        cell: ({ row }) => {
            const parent = row.original.parent
            return (
                <span className="text-sm text-muted-foreground">
                    {parent ? parent.title : "—"}
                </span>
            )
        },
    },
    {
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => {
            return <span className="font-medium">{row.getValue("order")}</span>
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            const module = row.original

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
                            <Link href={`/settings/modules/${module.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                                if (
                                    confirm(
                                        `Are you sure you want to delete "${module.title}"?`
                                    )
                                ) {
                                    try {
                                        await moduleAPI.deleteModule(module.id)
                                        window.location.reload()
                                    } catch (error) {
                                        console.error("Failed to delete module:", error)
                                        alert("Failed to delete module")
                                    }
                                }
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

