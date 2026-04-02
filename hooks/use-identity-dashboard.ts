"use client"

import { useCallback, useEffect, useState } from "react"
import { identityAPI } from "@/lib/api/identity"
import type { IdentityCommandCenterDto, PatchUserRequest } from "@/lib/types/identity"

export function useIdentityDashboard() {
    const [data, setData] = useState<IdentityCommandCenterDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await identityAPI.getDashboard()
            setData(result)
        } catch (e) {
            setData(null)
            setError(e instanceof Error ? e : new Error("Failed to load identity data"))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void refetch()
    }, [refetch])

    const patchUser = useCallback(
        async (userId: string, patch: PatchUserRequest) => {
            // Optimistic update
            setData((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    users: prev.users.map((u) => {
                        if (u.id !== userId) return u
                        const branchName = patch.branchId
                            ? (prev.branches.find((b) => b.id === patch.branchId)?.name ?? u.branchName)
                            : u.branchName
                        return {
                            ...u,
                            branchId: patch.branchId ?? u.branchId,
                            branchName,
                            roleName: patch.roleName ?? u.roleName,
                        }
                    }),
                    // Re-count users per role after role change
                    roles: prev.roles.map((r) => {
                        if (!patch.roleName) return r
                        const wasThisRole = prev.users.find((u) => u.id === userId)?.roleName === r.name
                        const isThisRole = r.name === patch.roleName
                        if (wasThisRole && !isThisRole) return { ...r, userCount: Math.max(0, r.userCount - 1) }
                        if (!wasThisRole && isThisRole) return { ...r, userCount: r.userCount + 1 }
                        return r
                    }),
                }
            })

            await identityAPI.patchUser(userId, patch)
        },
        []
    )

    return {
        roles: data?.roles ?? [],
        users: data?.users ?? [],
        branches: data?.branches ?? [],
        loading,
        error,
        refetch,
        patchUser,
    }
}
