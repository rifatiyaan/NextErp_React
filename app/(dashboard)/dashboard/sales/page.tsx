"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"

import { buildSalesListColumns } from "./_components/sales-list-columns"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/feedback/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSalesList } from "@/hooks/use-sales"
import type { SaleListRow } from "@/lib/types/sale"

const PAGE_SIZE = 10

export default function DashboardSalesListPage() {
    const router = useRouter()
    const [pageIndex, setPageIndex] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [appliedSearch, setAppliedSearch] = useState<string | undefined>(undefined)

    const { rows, total, loading, error } = useSalesList({
        pageIndex,
        pageSize: PAGE_SIZE,
        searchText: appliedSearch,
    })

    const columns = useMemo(() => buildSalesListColumns(), [])

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const handleApplySearch = () => {
        setPageIndex(1)
        setAppliedSearch(searchInput.trim() || undefined)
    }

    const handleRowClick = (row: SaleListRow) => {
        router.push(`/dashboard/sales/${row.id}`)
    }

    const showTable = !error && (loading || rows.length > 0)
    const showEmpty = !error && !loading && rows.length === 0

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Sales</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Invoices, amounts, and payment status
                    </p>
                </div>
                <Button size="sm" className="h-8" asChild>
                    <Link href="/sales/create">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        New sale
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1 sm:max-w-sm">
                    <label htmlFor="sales-search" className="text-xs font-medium">
                        Search
                    </label>
                    <Input
                        id="sales-search"
                        className="h-8 text-sm"
                        placeholder="Customer, invoice #…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleApplySearch()
                        }}
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleApplySearch}>
                        Apply
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                            setSearchInput("")
                            setAppliedSearch(undefined)
                            setPageIndex(1)
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error.message}
                </p>
            ) : null}

            {showEmpty ? (
                <EmptyState
                    icon={FileText}
                    title="No sales yet"
                    description="Create a sale from POS or the new sales screen to see it listed here."
                />
            ) : null}

            {showTable ? (
                <DataTable
                    columns={columns}
                    data={rows}
                    isLoading={loading}
                    onRowClick={handleRowClick}
                />
            ) : null}

            {!loading && rows.length > 0 ? (
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        Page {pageIndex} of {totalPages}
                        <span className="mx-1">·</span>
                        {total} total
                    </p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={pageIndex <= 1}
                            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={pageIndex >= totalPages}
                            onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
