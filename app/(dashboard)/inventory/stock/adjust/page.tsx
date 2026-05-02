"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { useProducts } from "@/hooks/use-products"
import {
    useAdjustStock,
    useAdjustmentReasons,
    useStockAdjustments,
} from "@/hooks/use-stock"
import {
    STOCK_ADJUSTMENT_REASON_LABELS,
    type StockAdjustmentMode,
} from "@/lib/types/stock"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useRequirePermission } from "@/hooks/use-require-permission"

const schema = z.object({
    productVariantId: z.coerce.number().int().positive("Select a variant"),
    mode: z.enum(["Increase", "Decrease", "SetAbsolute"]),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    reasonCode: z.string().min(1, "Reason is required"),
    notes: z.string().max(500).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface VariantOption {
    productVariantId: number
    sku: string
    productTitle: string
    variantTitle: string
    availableQuantity: number
}

export default function StockAdjustPage() {
    useRequirePermission("Stock.Adjust")
    const router = useRouter()

    const productsQuery = useProducts({
        pageIndex: 1,
        pageSize: 100,
        includeStock: true,
    })
    const reasonsQuery = useAdjustmentReasons()
    const adjustStock = useAdjustStock()

    const variants = useMemo<VariantOption[]>(() => {
        const opts: VariantOption[] = []
        for (const product of productsQuery.data?.data ?? []) {
            for (const v of product.productVariants ?? []) {
                if (!v.isActive) continue
                opts.push({
                    productVariantId: v.id,
                    sku: v.sku,
                    productTitle: product.title,
                    variantTitle: v.title,
                    availableQuantity: Number(v.availableQuantity ?? 0),
                })
            }
        }
        return opts
    }, [productsQuery.data])
    const loadingVariants = productsQuery.isPending
    const reasons = reasonsQuery.data ?? []
    const submitting = adjustStock.isPending

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as never,
        defaultValues: {
            productVariantId: 0,
            mode: "Increase",
            quantity: 0,
            reasonCode: "",
            notes: "",
        },
    })

    const selectedVariantId = form.watch("productVariantId")
    const mode = form.watch("mode")
    const quantity = form.watch("quantity")
    const notes = form.watch("notes") ?? ""

    const selectedVariant = useMemo(
        () => variants.find((v) => v.productVariantId === Number(selectedVariantId)) ?? null,
        [variants, selectedVariantId],
    )

    const currentStock = selectedVariant?.availableQuantity ?? 0
    const previewAfter = useMemo(() => {
        const q = Number(quantity)
        if (!Number.isFinite(q) || q <= 0) return currentStock
        if (mode === "Increase") return currentStock + q
        if (mode === "Decrease") return currentStock - q
        return q
    }, [mode, quantity, currentStock])

    const previewIsNegative = previewAfter < 0

    const historyVariantId = Number(selectedVariantId) > 0 ? Number(selectedVariantId) : 0
    const historyQuery = useStockAdjustments({
        productVariantId: historyVariantId || undefined,
        pageIndex: 1,
        pageSize: 10,
    })
    const history = historyVariantId > 0 ? historyQuery.data?.items ?? [] : []
    const loadingHistory = historyVariantId > 0 && historyQuery.isPending

    const variantOptions = useMemo(
        () =>
            variants.map((v) => ({
                value: String(v.productVariantId),
                label: `${v.productTitle} — ${v.variantTitle} (${v.sku})`,
            })),
        [variants],
    )

    const onSubmit = (values: FormValues) => {
        if (previewIsNegative) {
            toast.error("Adjustment would result in negative stock")
            return
        }
        adjustStock.mutate(
            {
                productVariantId: values.productVariantId,
                mode: values.mode,
                quantity: values.quantity,
                reasonCode: values.reasonCode,
                notes: values.notes?.trim() ? values.notes.trim() : null,
            },
            {
                onSuccess: () => {
                    // Hook's invalidates already refresh products + stock + adjustments.
                    form.reset({
                        productVariantId: values.productVariantId,
                        mode: values.mode,
                        quantity: 0,
                        reasonCode: values.reasonCode,
                        notes: "",
                    })
                },
                onError: (error: unknown) => {
                    const message =
                        (error as { message?: string })?.message ?? "Failed to save adjustment"
                    toast.error(message)
                },
            }
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/inventory/stock">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Stock Adjustment</h1>
                    <p className="text-sm text-muted-foreground">
                        Record manual changes to on-hand quantity for audit traceability.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>New Adjustment</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit as never)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="productVariantId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Variant *</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                options={variantOptions}
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                placeholder={
                                                    loadingVariants
                                                        ? "Loading variants..."
                                                        : "Select a variant"
                                                }
                                                searchPlaceholder="Search by name or SKU..."
                                                disabled={loadingVariants}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedVariant ? (
                                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                                    <div className="font-medium">
                                        {selectedVariant.productTitle} — {selectedVariant.variantTitle}
                                    </div>
                                    <div className="text-muted-foreground">
                                        SKU: <span className="font-mono">{selectedVariant.sku}</span>
                                        {" · "}
                                        Current stock:{" "}
                                        <span className="font-medium text-foreground">
                                            {currentStock}
                                        </span>
                                    </div>
                                </div>
                            ) : null}

                            <FormField
                                control={form.control}
                                name="mode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adjustment Type *</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-wrap gap-2">
                                                {(
                                                    [
                                                        { value: "Increase", label: "Increase (+)" },
                                                        { value: "Decrease", label: "Decrease (−)" },
                                                        { value: "SetAbsolute", label: "Set absolute" },
                                                    ] as { value: StockAdjustmentMode; label: string }[]
                                                ).map((opt) => (
                                                    <Button
                                                        key={opt.value}
                                                        type="button"
                                                        size="sm"
                                                        variant={
                                                            field.value === opt.value ? "default" : "outline"
                                                        }
                                                        onClick={() => field.onChange(opt.value)}
                                                    >
                                                        {opt.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {mode === "SetAbsolute" ? "New Quantity *" : "Quantity *"}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedVariant ? (
                                <div
                                    className={`rounded-md border px-3 py-2 text-sm ${
                                        previewIsNegative
                                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                                            : "bg-muted/40"
                                    }`}
                                >
                                    After adjustment:{" "}
                                    <span className="font-semibold">{previewAfter}</span>
                                    {previewIsNegative ? " (would go negative — not allowed)" : null}
                                </div>
                            ) : null}

                            <FormField
                                control={form.control}
                                name="reasonCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason *</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || undefined}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {reasons.map((code) => (
                                                        <SelectItem key={code} value={code}>
                                                            {STOCK_ADJUSTMENT_REASON_LABELS[code] ?? code}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                maxLength={500}
                                                placeholder="Optional context for this adjustment"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <div className="text-xs text-muted-foreground text-right">
                                            {notes.length}/500
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/inventory/stock")}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting || previewIsNegative || !selectedVariant}
                                >
                                    {submitting ? "Saving..." : "Save Adjustment"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Adjustments for this Variant</CardTitle>
                </CardHeader>
                <CardContent>
                    {!selectedVariant ? (
                        <p className="text-sm text-muted-foreground">
                            Select a variant to view its adjustment history.
                        </p>
                    ) : loadingHistory ? (
                        <p className="text-sm text-muted-foreground">Loading history...</p>
                    ) : history.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No adjustments yet.</p>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Change</TableHead>
                                        <TableHead>Previous → New</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="text-sm whitespace-nowrap">
                                                {new Date(row.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    row.quantityChanged < 0
                                                        ? "text-destructive font-medium"
                                                        : "font-medium"
                                                }
                                            >
                                                {row.quantityChanged > 0 ? "+" : ""}
                                                {row.quantityChanged}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {row.previousQuantity} → {row.newQuantity}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {STOCK_ADJUSTMENT_REASON_LABELS[row.reasonCode] ??
                                                    row.reasonCode}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[280px] truncate">
                                                {row.notes ?? "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
