"use client"

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { saleAPI } from "@/lib/api/sale"
import { saleQueries, type SaleListFilters, type SalesReportFilters } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { CreateSaleRequest } from "@/lib/types/sale"

/**
 * Sales — read + write hooks. Replaces the old useState/useEffect implementation.
 */

// ----- Reads -----

export function useSales(filters: SaleListFilters) {
    return useQuery({
        ...saleQueries.list(filters),
        placeholderData: keepPreviousData,
    })
}

/**
 * Convenience wrapper that mirrors the old useSalesList shape (rows + totals).
 */
export function useSalesList(filters: SaleListFilters) {
    const q = useSales(filters)
    return {
        rows: q.data?.data ?? [],
        total: q.data?.total ?? 0,
        totalDisplay: q.data?.totalDisplay ?? 0,
        page: q.data?.page,
        pageSize: q.data?.pageSize,
        loading: q.isPending,
        error: (q.error as Error | null) ?? null,
        refetch: q.refetch,
    }
}

export function useSaleById(saleId: string | undefined) {
    const q = useQuery(saleQueries.detail(saleId))
    return {
        sale: q.data ?? null,
        loading: q.isPending && !!saleId,
        error: (q.error as Error | null) ?? null,
        refetch: q.refetch,
    }
}

export function useSalesReport(filters: SalesReportFilters) {
    return useQuery(saleQueries.report(filters))
}

// ----- Mutations -----

/**
 * Create-sale mutation. Marked `silent` so the consumer can render a
 * stock-aware error toast (longer duration for "insufficient stock") and
 * its own success toast — see `app/(dashboard)/sales/create/page.tsx`.
 * Cache invalidation still runs from `meta.invalidates` regardless of `silent`.
 */
export function useCreateSale() {
    return useMutation({
        mutationFn: (input: CreateSaleRequest) => saleAPI.createSale(input),
        meta: {
            silent: true,
            invalidates: [queryKeys.sales.all, queryKeys.stock.all, queryKeys.products.all],
        },
    })
}
