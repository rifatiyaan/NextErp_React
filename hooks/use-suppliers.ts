"use client"

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import {
    supplierAPI,
    type SupplierCreateRequest,
    type SupplierUpdateRequest,
} from "@/lib/api/supplier"
import { supplierQueries, type SupplierListFilters } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"


// ----- Reads -----

export function useSuppliers(filters: SupplierListFilters) {
    return useQuery({
        ...supplierQueries.list(filters),
        placeholderData: keepPreviousData,
    })
}

export function useSupplier(id: string | undefined) {
    return useQuery(supplierQueries.detail(id ?? ""))
}

// ----- Mutations -----

export function useCreateSupplier() {
    return useMutation({
        mutationFn: (input: SupplierCreateRequest) => supplierAPI.createSupplier(input),
        meta: {
            successMessage: "Supplier created successfully",
            invalidates: [queryKeys.suppliers.all],
        },
    })
}

export function useUpdateSupplier() {
    return useMutation({
        mutationFn: (input: { id: string; data: SupplierUpdateRequest }) =>
            supplierAPI.updateSupplier(input.id, input.data),
        meta: {
            successMessage: "Supplier updated successfully",
            invalidates: [queryKeys.suppliers.all],
        },
    })
}

export function useDeactivateSupplier() {
    return useMutation({
        mutationFn: (id: string) => supplierAPI.deactivateSupplier(id),
        meta: {
            successMessage: "Supplier deactivated",
            invalidates: [queryKeys.suppliers.all],
        },
    })
}
