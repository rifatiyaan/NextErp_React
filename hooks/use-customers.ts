"use client"

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import {
    customerAPI,
    type CustomerCreateRequest,
    type CustomerUpdateRequest,
} from "@/lib/api/customer"
import { customerQueries, type CustomerListFilters } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"

/**
 * Customers — read + write hooks.
 */

// ----- Reads -----

export function useCustomers(filters: CustomerListFilters) {
    return useQuery({
        ...customerQueries.list(filters),
        placeholderData: keepPreviousData,
    })
}

export function useCustomer(id: string | undefined) {
    return useQuery(customerQueries.detail(id ?? ""))
}

// ----- Mutations -----

export function useCreateCustomer() {
    return useMutation({
        mutationFn: (input: CustomerCreateRequest) => customerAPI.createCustomer(input),
        meta: {
            successMessage: "Customer created successfully",
            invalidates: [queryKeys.customers.all],
        },
    })
}

export function useUpdateCustomer() {
    return useMutation({
        mutationFn: (input: { id: string; data: CustomerUpdateRequest }) =>
            customerAPI.updateCustomer(input.id, input.data),
        meta: {
            successMessage: "Customer updated successfully",
            invalidates: [queryKeys.customers.all],
        },
    })
}

export function useDeactivateCustomer() {
    return useMutation({
        mutationFn: (id: string) => customerAPI.deactivateCustomer(id),
        meta: {
            successMessage: "Customer deactivated",
            invalidates: [queryKeys.customers.all],
        },
    })
}
