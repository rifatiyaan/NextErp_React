"use client"

import { useMemo } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { moduleAPI, type CreateModuleRequest } from "@/lib/api/module"
import { moduleQueries, type ModuleListFilters } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import {
    buildPermissionGroupsFromMenu,
    flattenMenuPermissionKeys,
    type MenuPermissionItem,
} from "@/lib/permissions/menu-permission-groups"


// ----- Reads -----

export function useUserMenu() {
    return useQuery(moduleQueries.userMenu())
}

export function useModules(filters: ModuleListFilters = {}) {
    return useQuery(moduleQueries.list(filters))
}

export function useModule(id: number | undefined) {
    return useQuery(moduleQueries.detail(id ?? 0))
}

export function useMenuPermissionGroups() {
    const query = useQuery(moduleQueries.userMenu())

    return useMemo(() => {
        const groups: Record<string, MenuPermissionItem[]> = query.data
            ? buildPermissionGroupsFromMenu(query.data)
            : {}
        const menuKeySet: Set<string> = query.data
            ? flattenMenuPermissionKeys(groups)
            : new Set<string>()
        const totalCount = Object.values(groups).reduce((n, items) => n + items.length, 0)

        return {
            groups,
            menuKeySet,
            loading: query.isPending,
            error: (query.error as Error | null) ?? null,
            refetch: query.refetch,
            totalCount,
        }
    }, [query.data, query.isPending, query.error, query.refetch])
}

// ----- Mutations -----

export function useCreateModule() {
    return useMutation({
        mutationFn: (input: CreateModuleRequest) => moduleAPI.createModule(input),
        meta: {
            successMessage: "Module created",
            invalidates: [queryKeys.modules.all],
        },
    })
}

export function useUpdateModule() {
    return useMutation({
        mutationFn: (input: { id: number; data: CreateModuleRequest }) =>
            moduleAPI.updateModule(input.id, input.data),
        meta: {
            successMessage: "Module updated",
            invalidates: [queryKeys.modules.all],
        },
    })
}

export function useDeleteModule() {
    return useMutation({
        mutationFn: (id: number) => moduleAPI.deleteModule(id),
        meta: {
            successMessage: "Module deleted",
            invalidates: [queryKeys.modules.all],
        },
    })
}
