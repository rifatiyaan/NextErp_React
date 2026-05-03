"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    categoryQueries,
    unitOfMeasureQueries,
    variationQueries,
} from "@/lib/query/options"
import type { Category } from "@/types/category"
import type { UnitOfMeasure } from "@/lib/types/unit-of-measure"
import type { BulkVariationOption } from "@/lib/api/variation"

export interface ProductFormLookups {
    parentCategories: Category[]
    childCategories: Category[]
    unitsOfMeasure: UnitOfMeasure[]
    bulkVariationOptions: BulkVariationOption[]

    loading: boolean
    ready: boolean
    error: Error | null
}

export function useProductFormLookups(): ProductFormLookups {
    const categoriesQuery = useQuery(categoryQueries.all())
    const unitsQuery = useQuery(unitOfMeasureQueries.all())
    const variationsQuery = useQuery(variationQueries.bulkOptions())

    return useMemo<ProductFormLookups>(() => {
        const allCategories = categoriesQuery.data ?? []
        const parentCategories = allCategories.filter(
            (cat) => !cat.parentId && cat.isActive,
        )
        const childCategories = allCategories.filter(
            (cat) => cat.parentId != null && cat.isActive,
        )

        return {
            parentCategories,
            childCategories,
            unitsOfMeasure: unitsQuery.data ?? [],
            bulkVariationOptions: variationsQuery.data ?? [],
            loading:
                categoriesQuery.isPending ||
                unitsQuery.isPending ||
                variationsQuery.isPending,
            ready:
                categoriesQuery.isSuccess &&
                unitsQuery.isSuccess &&
                variationsQuery.isSuccess,
            error:
                (categoriesQuery.error as Error | null) ??
                (unitsQuery.error as Error | null) ??
                (variationsQuery.error as Error | null) ??
                null,
        }
    }, [
        categoriesQuery.data,
        categoriesQuery.isPending,
        categoriesQuery.isSuccess,
        categoriesQuery.error,
        unitsQuery.data,
        unitsQuery.isPending,
        unitsQuery.isSuccess,
        unitsQuery.error,
        variationsQuery.data,
        variationsQuery.isPending,
        variationsQuery.isSuccess,
        variationsQuery.error,
    ])
}
