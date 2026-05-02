"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { branchAPI } from "@/lib/api/branch"
import { branchQueries } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { BranchCreateRequest, BranchUpdateRequest } from "@/lib/types/branch"

/**
 * Branches — read + write hooks. Replaces the old useState/useEffect implementation.
 */

// ----- Reads -----

export function useBranches() {
    return useQuery(branchQueries.all())
}

export function useBranch(id: string | undefined) {
    return useQuery(branchQueries.detail(id ?? ""))
}

// ----- Mutations -----

export function useCreateBranch() {
    return useMutation({
        mutationFn: (input: BranchCreateRequest) => branchAPI.createBranch(input),
        meta: {
            successMessage: "Branch created",
            invalidates: [queryKeys.branches.all],
        },
    })
}

export function useUpdateBranch() {
    return useMutation({
        mutationFn: (input: { id: string; data: BranchUpdateRequest }) =>
            branchAPI.updateBranch(input.id, input.data),
        meta: {
            successMessage: "Branch updated",
            invalidates: [queryKeys.branches.all],
        },
    })
}

export function useDeleteBranch() {
    return useMutation({
        mutationFn: (id: string) => branchAPI.deleteBranch(id),
        meta: {
            successMessage: "Branch deleted",
            invalidates: [queryKeys.branches.all],
        },
    })
}
