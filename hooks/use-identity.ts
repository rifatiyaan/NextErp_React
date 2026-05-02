"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { identityAPI } from "@/lib/api/identity"
import { identityQueries } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { IdentityCommandCenterDto, PatchUserRequest } from "@/lib/types/identity"

/**
 * Identity — dashboard read + user/role mutations.
 *
 * Replaces the legacy `useIdentityDashboard` hook. Optimistic update for `patchUser`
 * is preserved by writing to the cache via `setQueryData` in `onMutate`.
 */

// ----- Reads -----

export function useIdentityDashboard() {
    const query = useQuery(identityQueries.dashboard())
    return {
        ...query,
        roles: query.data?.roles ?? [],
        users: query.data?.users ?? [],
        branches: query.data?.branches ?? [],
        loading: query.isPending,
        error: (query.error as Error | null) ?? null,
    }
}

// ----- Mutations -----

export function usePatchUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: { userId: string; patch: PatchUserRequest }) =>
            identityAPI.patchUser(input.userId, input.patch),
        onMutate: async ({ userId, patch }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.identity.dashboard() })
            const previous = queryClient.getQueryData<IdentityCommandCenterDto>(
                queryKeys.identity.dashboard(),
            )
            if (previous) {
                queryClient.setQueryData<IdentityCommandCenterDto>(
                    queryKeys.identity.dashboard(),
                    {
                        ...previous,
                        users: previous.users.map((u) => {
                            if (u.id !== userId) return u
                            const branchName = patch.branchId
                                ? previous.branches.find((b) => b.id === patch.branchId)?.name ??
                                  u.branchName
                                : u.branchName
                            return {
                                ...u,
                                branchId: patch.branchId ?? u.branchId,
                                branchName,
                                roleName: patch.roleName ?? u.roleName,
                            }
                        }),
                        roles: previous.roles.map((r) => {
                            if (!patch.roleName) return r
                            const wasThisRole =
                                previous.users.find((u) => u.id === userId)?.roleName === r.name
                            const isThisRole = r.name === patch.roleName
                            if (wasThisRole && !isThisRole)
                                return { ...r, userCount: Math.max(0, r.userCount - 1) }
                            if (!wasThisRole && isThisRole)
                                return { ...r, userCount: r.userCount + 1 }
                            return r
                        }),
                    },
                )
            }
            return { previous }
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.identity.dashboard(), context.previous)
            }
        },
        meta: {
            // Toast on success only — error toast is handled globally.
            successMessage: "User updated",
            invalidates: [queryKeys.identity.all],
        },
    })
}

export function useSetRolePermissions() {
    return useMutation({
        mutationFn: (input: { roleId: string; permissionKeys: string[] }) =>
            identityAPI.setRolePermissions(input.roleId, input.permissionKeys),
        meta: {
            successMessage: "Role permissions updated",
            invalidates: [queryKeys.identity.all],
        },
    })
}
