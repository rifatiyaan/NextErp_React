"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { stockAPI } from "@/lib/api/stock"
import type { CurrentStockReport, LowStockItem, LowStockReport, StockRow } from "@/lib/types/stock"

export type StockViewFilter = "all" | "low"

export interface StockTableRow {
    productVariantId: number
    productTitle: string
    variantTitle: string
    variantSku: string
    quantity: number
    reorderLevel?: number | null
    unitOfMeasureAbbreviation?: string | null
}

function fromCurrentRow(s: StockRow): StockTableRow {
    return {
        productVariantId: s.productVariantId,
        productTitle: s.productTitle,
        variantTitle: s.variantTitle,
        variantSku: s.variantSku,
        quantity: Number(s.availableQuantity),
        reorderLevel: s.reorderLevel,
        unitOfMeasureAbbreviation: s.unitOfMeasureAbbreviation,
    }
}

function fromLowItem(s: LowStockItem): StockTableRow {
    return {
        productVariantId: s.productVariantId,
        productTitle: s.productTitle,
        variantTitle: s.variantTitle,
        variantSku: s.variantSku,
        quantity: Number(s.availableQuantity),
        reorderLevel: s.reorderLevel,
        unitOfMeasureAbbreviation: s.unitOfMeasureAbbreviation,
    }
}

export function useStockPage() {
    const [current, setCurrent] = useState<CurrentStockReport | null>(null)
    const [low, setLow] = useState<LowStockReport | null>(null)
    const [filter, setFilter] = useState<StockViewFilter>("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [c, l] = await Promise.all([
                stockAPI.getCurrentStockReport(),
                stockAPI.getLowStockReport(),
            ])
            setCurrent(c)
            setLow(l)
        } catch (e) {
            setCurrent(null)
            setLow(null)
            setError(e instanceof Error ? e : new Error("Failed to load stock"))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    const lowVariantIds = useMemo(
        () => new Set(low?.items.map((i) => i.productVariantId) ?? []),
        [low]
    )

    const rows = useMemo((): StockTableRow[] => {
        if (filter === "low") {
            return (low?.items ?? []).map(fromLowItem)
        }
        return (current?.stocks ?? []).map(fromCurrentRow)
    }, [filter, current, low])

    const rowIsLowStock = useCallback(
        (productVariantId: number) => lowVariantIds.has(productVariantId),
        [lowVariantIds]
    )

    return {
        rows,
        filter,
        setFilter,
        loading,
        error,
        refetch: load,
        current,
        low,
        rowIsLowStock,
    }
}
