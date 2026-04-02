"use client"

import { useCallback, useEffect, useState } from "react"
import { moduleAPI } from "@/lib/api/module"
import {
    buildPermissionGroupsFromMenu,
    flattenMenuPermissionKeys,
    type MenuPermissionItem,
} from "@/lib/permissions/menu-permission-groups"

export function useMenuPermissionGroups() {
    const [groups, setGroups] = useState<Record<string, MenuPermissionItem[]>>({})
    const [menuKeySet, setMenuKeySet] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const menu = await moduleAPI.getUserMenu()
            const g = buildPermissionGroupsFromMenu(menu)
            setGroups(g)
            setMenuKeySet(flattenMenuPermissionKeys(g))
        } catch (e) {
            setGroups({})
            setMenuKeySet(new Set())
            setError(e instanceof Error ? e : new Error(String(e)))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    const totalCount = Object.values(groups).reduce((n, items) => n + items.length, 0)

    return { groups, menuKeySet, loading, error, refetch: load, totalCount }
}
