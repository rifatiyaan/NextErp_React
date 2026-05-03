"use client"

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { purchaseAPI } from "@/lib/api/purchase"
import {
    purchaseQueries,
    type PurchaseListFiltersExt,
    type PurchasesReportFilters,
} from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { CreatePurchaseRequest } from "@/types/purchase"


// ----- Reads -----

export function usePurchases(filters: PurchaseListFiltersExt) {
    return useQuery({
        ...purchaseQueries.list(filters),
        placeholderData: keepPreviousData,
    })
}

export function usePurchase(id: string | undefined) {
    return useQuery(purchaseQueries.detail(id))
}

export function usePurchasesReport(filters: PurchasesReportFilters) {
    return useQuery(purchaseQueries.report(filters))
}

// ----- Mutations -----

export function useCreatePurchase() {
    return useMutation({
        mutationFn: (input: CreatePurchaseRequest) => purchaseAPI.createPurchase(input),
        meta: {
            successMessage: "Purchase created",
            invalidates: [queryKeys.purchases.all, queryKeys.stock.all, queryKeys.products.all],
        },
    })
}
