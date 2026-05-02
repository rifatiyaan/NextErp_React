"use client"

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { categoryAPI } from "@/lib/api/category"
import { categoryQueries, type CategoryListFilters } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { CreateCategoryRequest } from "@/types/category"

/**
 * Categories — read + write hooks.
 *
 * Each mutation declares its toast + invalidations via `meta` so the
 * component layer stays free of try/catch and manual cache-invalidation logic.
 * Form-level field errors (HTTP 422) are still the form's responsibility:
 * use `applyValidationErrors(error, setError)` from `lib/query/rhf` inside
 * `mutate(input, { onError: ... })` when wiring a form.
 */

// ----- Reads -----

export function useCategories() {
    return useQuery(categoryQueries.all())
}

export function useCategoriesList(filters: CategoryListFilters) {
    return useQuery({
        ...categoryQueries.list(filters),
        placeholderData: keepPreviousData,
    })
}

export function useCategory(id: number | string | undefined) {
    return useQuery(categoryQueries.detail(id ?? ""))
}

// ----- Mutations -----

export function useCreateCategory() {
    return useMutation({
        mutationFn: (input: CreateCategoryRequest) => categoryAPI.createCategory(input),
        meta: {
            successMessage: "Category created",
            invalidates: [queryKeys.categories.all],
        },
    })
}

export function useUpdateCategory() {
    return useMutation({
        mutationFn: (input: { id: number | string; data: CreateCategoryRequest }) =>
            categoryAPI.updateCategory(input.id, input.data),
        meta: {
            successMessage: "Category updated",
            invalidates: [queryKeys.categories.all],
        },
    })
}

export function useDeactivateCategory() {
    return useMutation({
        mutationFn: (id: number | string) => categoryAPI.deactivateCategory(id),
        meta: {
            successMessage: "Category deactivated",
            invalidates: [queryKeys.categories.all],
        },
    })
}
