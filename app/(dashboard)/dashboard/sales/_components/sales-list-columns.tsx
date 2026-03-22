"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/formatters/currency"
import { formatDateTime } from "@/lib/formatters/date"
import { salePaymentStatus, type SalePaymentStatusLabel } from "@/lib/sale-payment-status"
import type { SaleListRow } from "@/lib/types/sale"

const STATUS_STYLE: Record<
    SalePaymentStatusLabel,
    { variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    Paid: { variant: "secondary" },
    Partial: { variant: "outline" },
    Due: { variant: "destructive" },
}

export function buildSalesListColumns(): ColumnDef<SaleListRow>[] {
    return [
        {
            accessorKey: "saleNumber",
            header: "Invoice #",
            cell: ({ row }) => (
                <span className="font-medium tabular-nums">{row.original.saleNumber}</span>
            ),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
            cell: ({ row }) => row.original.customerName || "—",
        },
        {
            accessorKey: "saleDate",
            header: "Date",
            cell: ({ row }) => formatDateTime(row.original.saleDate),
        },
        {
            accessorKey: "finalAmount",
            header: "Final",
            cell: ({ row }) => formatCurrency(row.original.finalAmount),
        },
        {
            accessorKey: "totalPaid",
            header: "Paid",
            cell: ({ row }) => formatCurrency(row.original.totalPaid),
        },
        {
            accessorKey: "balanceDue",
            header: "Due",
            cell: ({ row }) => (
                <span
                    className={
                        row.original.balanceDue > 0 ? "font-medium text-foreground" : ""
                    }
                >
                    {formatCurrency(row.original.balanceDue)}
                </span>
            ),
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => {
                const label = salePaymentStatus(row.original)
                const { variant } = STATUS_STYLE[label]
                return (
                    <Badge variant={variant} className="h-5 text-xs font-medium">
                        {label}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                    <Link
                        href={`/dashboard/sales/${row.original.id}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        View
                    </Link>
                </Button>
            ),
        },
    ]
}
