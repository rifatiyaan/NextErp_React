"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { variationAPI } from "@/lib/api/variation"
import { variationQueries } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"

/**
 * Variation Options — read + write hooks.
 */

// ----- Reads -----

export function useVariationOptions() {
    return useQuery(variationQueries.options())
}

export function useBulkVariationOptions() {
    return useQuery(variationQueries.bulkOptions())
}

export function useProductVariationOptions(productId: number | undefined) {
    return useQuery(variationQueries.byProduct(productId ?? 0))
}

// ----- Mutations -----

export function useCreateVariationOption() {
    return useMutation({
        mutationFn: (input: { name: string; displayOrder?: number }) =>
            variationAPI.createOption(input),
        meta: {
            successMessage: "Variation option created",
            invalidates: [queryKeys.variationOptions.all],
        },
    })
}

export function useCreateVariationValue() {
    return useMutation({
        mutationFn: (input: { optionId: number; value: string; displayOrder?: number }) =>
            variationAPI.createValue(input.optionId, {
                value: input.value,
                displayOrder: input.displayOrder,
            }),
        meta: {
            successMessage: "Variation value added",
            invalidates: [queryKeys.variationOptions.all],
        },
    })
}

export function useAssignVariationOptionToProduct() {
    return useMutation({
        mutationFn: (input: {
            productId: number
            variationOptionId: number
            displayOrder?: number
        }) =>
            variationAPI.assignOptionToProduct(
                input.productId,
                input.variationOptionId,
                input.displayOrder,
            ),
        meta: {
            successMessage: "Variation option assigned",
            invalidates: [queryKeys.variationOptions.all, queryKeys.products.all],
        },
    })
}

export function useUnassignVariationOptionFromProduct() {
    return useMutation({
        mutationFn: (input: { productId: number; variationOptionId: number }) =>
            variationAPI.unassignOptionFromProduct(input.productId, input.variationOptionId),
        meta: {
            successMessage: "Variation option removed",
            invalidates: [queryKeys.variationOptions.all, queryKeys.products.all],
        },
    })
}
