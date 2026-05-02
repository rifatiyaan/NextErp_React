"use client"

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { productAPI } from "@/lib/api/product"
import { productQueries, type ProductListFilters } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { CreateProductRequest } from "@/types/product"

/**
 * Products — read + write hooks.
 */

// ----- Reads -----

export function useProducts(filters: ProductListFilters, options?: { enabled?: boolean }) {
    return useQuery({
        ...productQueries.list(filters),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
    })
}

export function useProduct(id: number | string | undefined) {
    return useQuery(productQueries.detail(id ?? ""))
}

// ----- Mutations -----

export function useCreateProduct() {
    return useMutation({
        mutationFn: (input: CreateProductRequest) => productAPI.createProduct(input),
        meta: {
            successMessage: "Product created successfully",
            invalidates: [queryKeys.products.all, queryKeys.stock.all],
        },
    })
}

export function useUpdateProduct() {
    return useMutation({
        mutationFn: (input: { id: number | string; data: CreateProductRequest }) =>
            productAPI.updateProduct(input.id, input.data),
        meta: {
            successMessage: "Product updated successfully",
            invalidates: [queryKeys.products.all, queryKeys.stock.all],
        },
    })
}

export function useDeactivateProduct() {
    return useMutation({
        mutationFn: (id: number | string) => productAPI.deactivateProduct(id),
        meta: {
            successMessage: "Product removed",
            errorMessage: "Failed to remove product",
            invalidates: [queryKeys.products.all, queryKeys.stock.all],
        },
    })
}
