"use client"

import { useCallback, useEffect, useState } from "react"
import { branchAPI } from "@/lib/api/branch"
import type { Branch } from "@/lib/types/branch"

export function useBranches() {
    const [data, setData] = useState<Branch[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await branchAPI.getBranches()
            setData(result.data)
            setTotal(result.total)
        } catch (e) {
            setData([])
            setError(e instanceof Error ? e : new Error("Failed to load branches"))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void refetch()
    }, [refetch])

    return { data, total, loading, error, refetch }
}
