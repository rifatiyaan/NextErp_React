"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { unitOfMeasureAPI } from "@/lib/api/unit-of-measure"
import { unitOfMeasureQueries } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"

/**
 * Units of Measure — read + write hooks.
 */

// ----- Reads -----

export function useUnitsOfMeasure() {
    return useQuery(unitOfMeasureQueries.all())
}

export function useUnitOfMeasure(id: number | undefined) {
    return useQuery(unitOfMeasureQueries.detail(id ?? 0))
}

// ----- Mutations -----

export function useCreateUnitOfMeasure() {
    return useMutation({
        mutationFn: (input: { name: string; abbreviation: string; category?: string | null }) =>
            unitOfMeasureAPI.create(input),
        meta: {
            successMessage: "Unit of measure created",
            invalidates: [queryKeys.unitsOfMeasure.all],
        },
    })
}

export function useUpdateUnitOfMeasure() {
    return useMutation({
        mutationFn: (input: {
            id: number
            data: { name: string; abbreviation: string; category?: string | null; isActive: boolean }
        }) => unitOfMeasureAPI.update(input.id, input.data),
        meta: {
            successMessage: "Unit of measure updated",
            invalidates: [queryKeys.unitsOfMeasure.all],
        },
    })
}

export function useDeleteUnitOfMeasure() {
    return useMutation({
        mutationFn: (id: number) => unitOfMeasureAPI.delete(id),
        meta: {
            successMessage: "Unit of measure deleted",
            invalidates: [queryKeys.unitsOfMeasure.all],
        },
    })
}
