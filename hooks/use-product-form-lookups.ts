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

/**
 * Composite hook for ProductForm lookup data — categories (parent + child split),
 * units of measure, and bulk variation options.
 *
 * Each underlying query is independent (separate cache entry, separate stale time)
 * but the hook surface is unified: one return shape, one combined `loading` flag.
 * Consumers do not see TanStack Query at all — they get derived data + loading state.
 *
 * Cleanup:
 * - Unmount automatically unsubscribes from each query.
 * - In-flight fetches are aborted via the queryFn's `signal` (forwarded to fetch).
 * - The cached payload survives unmount for `gcTime` (default 10 min) so re-mount
 *   shows data instantly without a refetch.
 */
export interface ProductFormLookups {
    /** Top-level (parent) categories only — ready for the category dropdown. */
    parentCategories: Category[]
    /** Child categories (those with a parentId) — ready for the subcategory dropdown. */
    childCategories: Category[]
    unitsOfMeasure: UnitOfMeasure[]
    bulkVariationOptions: BulkVariationOption[]

    /** True while any underlying query is fetching for the first time. */
    loading: boolean
    /** True when ALL underlying queries have at least one successful result. */
    ready: boolean
    /** First error encountered across the underlying queries, if any. */
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
