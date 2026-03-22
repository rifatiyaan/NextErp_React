"use client"

import { useCallback, useEffect, useState } from "react"

import { saleAPI } from "@/lib/api/sale"
import type { PagedSaleListResponse, SaleDetail } from "@/lib/types/sale"

interface UseSalesListParams {
    pageIndex: number
    pageSize: number
    searchText?: string
    sortBy?: string
}

export function useSalesList({
    pageIndex,
    pageSize,
    searchText,
    sortBy,
}: UseSalesListParams) {
    const [result, setResult] = useState<PagedSaleListResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await saleAPI.getSales(pageIndex, pageSize, searchText, sortBy)
            setResult(data)
        } catch (e) {
            setResult(null)
            setError(e instanceof Error ? e : new Error("Failed to load sales"))
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, searchText, sortBy])

    useEffect(() => {
        void refetch()
    }, [refetch])

    return {
        rows: result?.data ?? [],
        total: result?.total ?? 0,
        totalDisplay: result?.totalDisplay ?? 0,
        page: result?.page,
        pageSize: result?.pageSize,
        loading,
        error,
        refetch,
    }
}

export function useSaleById(saleId: string | undefined) {
    const [sale, setSale] = useState<SaleDetail | null>(null)
    const [loading, setLoading] = useState(Boolean(saleId))
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        if (!saleId) {
            setSale(null)
            setLoading(false)
            return
        }
        setLoading(true)
        setError(null)
        try {
            const data = await saleAPI.getSaleById(saleId)
            setSale(data)
        } catch (e) {
            setSale(null)
            setError(e instanceof Error ? e : new Error("Failed to load sale"))
        } finally {
            setLoading(false)
        }
    }, [saleId])

    useEffect(() => {
        void refetch()
    }, [refetch])

    return { sale, loading, error, refetch }
}
