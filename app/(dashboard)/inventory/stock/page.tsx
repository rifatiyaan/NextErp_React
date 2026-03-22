"use client"

import { Package } from "lucide-react"

import { StockTable } from "./_components/stock-table"
import { EmptyState } from "@/components/feedback/empty-state"
import { TableSkeleton } from "@/components/feedback/table-skeleton"
import { Button } from "@/components/ui/button"
import { useStockPage } from "@/hooks/use-stock-page"

export default function DashboardStockPage() {
    const { rows, filter, setFilter, loading, error, current, low, rowIsLowStock } =
        useStockPage()

    const highlightLow = (productVariantId: number) =>
        filter === "all" && rowIsLowStock(productVariantId)

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Stock</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Current quantities by product variant
                    {current != null ? (
                        <>
                            {" "}
                            · {current.totalVariants} variants,{" "}
                            {current.totalQuantity.toFixed(0)} units total
                        </>
                    ) : null}
                    {low != null ? (
                        <>
                            {" "}
                            · {low.totalLowStockVariants} below reorder
                        </>
                    ) : null}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <Button
                    type="button"
                    size="sm"
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                >
                    All
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={filter === "low" ? "default" : "outline"}
                    onClick={() => setFilter("low")}
                >
                    Low stock
                </Button>
            </div>

            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error.message}
                </p>
            ) : null}

            {loading ? (
                <TableSkeleton columns={4} rows={12} />
            ) : rows.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No stock to show"
                    description={
                        filter === "low"
                            ? "No variants are currently flagged as low stock."
                            : "Stock records will appear here once variants exist."
                    }
                />
            ) : (
                <StockTable rows={rows} highlightLow={highlightLow} />
            )}
        </div>
    )
}
