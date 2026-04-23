"use client"

import { useEffect, useRef, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { formatQuantity } from "@/lib/formatters/number"
import { stockAPI } from "@/lib/api/stock"
import type { StockTableRow } from "@/hooks/use-stock-page"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface StockTableProps {
    rows: StockTableRow[]
    highlightLow: (productVariantId: number) => boolean
    onReorderLevelChange?: (productVariantId: number, value: number | null) => void
}

export function StockTable({ rows, highlightLow, onReorderLevelChange }: StockTableProps) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState<string>("")
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (editingId != null) inputRef.current?.focus()
    }, [editingId])

    const startEdit = (row: StockTableRow) => {
        setEditingId(row.productVariantId)
        setEditValue(row.reorderLevel != null ? String(row.reorderLevel) : "")
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditValue("")
    }

    const commitEdit = async (row: StockTableRow) => {
        if (saving) return
        const trimmed = editValue.trim()
        let parsed: number | null = null
        if (trimmed !== "") {
            const n = Number(trimmed)
            if (!Number.isFinite(n) || n < 0) {
                toast.error("Reorder level must be a non-negative number")
                return
            }
            parsed = n
        }
        const current = row.reorderLevel ?? null
        if (parsed === current) {
            cancelEdit()
            return
        }
        setSaving(true)
        try {
            await stockAPI.setReorderLevel(row.productVariantId, parsed)
            onReorderLevelChange?.(row.productVariantId, parsed)
            toast.success("Reorder level updated")
            cancelEdit()
        } catch (error) {
            const message =
                (error as { message?: string })?.message ?? "Failed to update reorder level"
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Reorder At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No stock rows
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => {
                            const warn = highlightLow(row.productVariantId)
                            const isEditing = editingId === row.productVariantId
                            return (
                                <TableRow
                                    key={row.productVariantId}
                                    className={cn(
                                        warn &&
                                            "bg-muted/60 border-l-2 border-l-primary"
                                    )}
                                >
                                    <TableCell className="font-medium">
                                        {row.productTitle}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {row.variantTitle || "—"}
                                    </TableCell>
                                    <TableCell className="font-mono text-[11px]">
                                        {row.variantSku || "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {row.unitOfMeasureAbbreviation || "—"}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-medium">
                                        {formatQuantity(row.quantity)}
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "text-right tabular-nums text-sm",
                                            !isEditing && "cursor-pointer hover:bg-muted/40"
                                        )}
                                        onClick={() => {
                                            if (!isEditing) startEdit(row)
                                        }}
                                    >
                                        {isEditing ? (
                                            <Input
                                                ref={inputRef}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={editValue}
                                                disabled={saving}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onBlur={() => commitEdit(row)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault()
                                                        commitEdit(row)
                                                    } else if (e.key === "Escape") {
                                                        e.preventDefault()
                                                        cancelEdit()
                                                    }
                                                }}
                                                placeholder="default (10)"
                                                className="h-7 w-24 ml-auto text-right text-sm"
                                            />
                                        ) : row.reorderLevel != null ? (
                                            <span className="text-muted-foreground">
                                                {formatQuantity(row.reorderLevel)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/70 italic">
                                                default (10)
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
