"use client"

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { stockAPI } from "@/lib/api/stock"
import { stockQueries, type StockAdjustmentsFilters } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"

/**
 * Stock — read + write hooks.
 */

// ----- Reads -----

export function useCurrentStock() {
    return useQuery(stockQueries.current())
}

export function useLowStock() {
    return useQuery(stockQueries.low())
}

export function useStockAdjustments(filters: StockAdjustmentsFilters) {
    return useQuery({
        ...stockQueries.adjustments(filters),
        placeholderData: keepPreviousData,
    })
}

export function useAdjustmentReasons() {
    return useQuery(stockQueries.adjustmentReasons())
}

// ----- Mutations -----

export function useAdjustStock() {
    return useMutation({
        mutationFn: (payload: {
            productVariantId: number
            mode: "Increase" | "Decrease" | "SetAbsolute"
            quantity: number
            reasonCode: string
            notes?: string | null
        }) => stockAPI.adjustStock(payload),
        meta: {
            successMessage: "Stock adjusted",
            invalidates: [queryKeys.stock.all, queryKeys.products.all],
        },
    })
}

export function useSetReorderLevel() {
    return useMutation({
        mutationFn: (input: { productVariantId: number; reorderLevel: number | null }) =>
            stockAPI.setReorderLevel(input.productVariantId, input.reorderLevel),
        meta: {
            successMessage: "Reorder level updated",
            invalidates: [queryKeys.stock.all],
        },
    })
}
