"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { purchaseAPI, type PurchaseListFilters } from "@/lib/api/purchase"
import { supplierAPI } from "@/lib/api/supplier"
import type { Supplier } from "@/lib/api/supplier"
import { Purchase } from "@/types/purchase"
import { DataTable } from "@/app/(dashboard)/inventory/products/data-table"
import { createColumns } from "./columns"
import { Loader } from "@/components/ui/loader"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import {
    FilterBar,
    type FilterBarFieldConfig,
    type FilterBarValues,
} from "@/components/shared/filter-bar"
import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
] as const

export default function PurchaseListPage() {
    const radiusClass = useRadiusClass()
    const [data, setData] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [appliedFilters, setAppliedFilters] = useState<FilterBarValues>({})

    const filtersConfig = useMemo<FilterBarFieldConfig[]>(() => {
        const supplierOptions = suppliers
            .filter((s) => s.isActive)
            .map((s) => ({ value: String(s.id), label: s.title }))
        return [
            {
                key: "status",
                label: "Status",
                options: [...STATUS_OPTIONS],
            },
            {
                key: "supplier",
                label: "Supplier",
                options: supplierOptions,
            },
        ]
    }, [suppliers])

    useEffect(() => {
        const load = async () => {
            try {
                const res = await supplierAPI.getSuppliers(1, 1000)
                setSuppliers(res.data ?? [])
            } catch {
                setSuppliers([])
            }
        }
        void load()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery.trim())
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const fetchData = useCallback(
        async (page: number, size: number, search?: string, filters?: PurchaseListFilters) => {
            setLoading(true)
            try {
                const response = await purchaseAPI.getPurchases(
                    page,
                    size,
                    search || undefined,
                    undefined,
                    filters
                )
                if (response?.data) {
                    setData(response.data)
                    setTotal(response.total)
                } else {
                    setData([])
                    setTotal(0)
                }
            } catch {
                setData([])
                setTotal(0)
            } finally {
                setLoading(false)
            }
        },
        []
    )

    useEffect(() => {
        setPageIndex(1)
    }, [debouncedSearchQuery])

    useEffect(() => {
        const apiFilters: PurchaseListFilters = {
            status: appliedFilters.status ?? [],
            supplier: appliedFilters.supplier ?? [],
        }
        void fetchData(pageIndex, pageSize, debouncedSearchQuery || undefined, apiFilters)
    }, [pageIndex, pageSize, debouncedSearchQuery, appliedFilters, fetchData])

    const pageCount = Math.ceil(total / pageSize) || 1

    const handleViewDetails = (purchase: Purchase) => {
        setSelectedPurchase(purchase)
        setIsModalOpen(true)
    }

    const handleApplyFilters = useCallback((next: FilterBarValues) => {
        setAppliedFilters(next)
        setPageIndex(1)
    }, [])

    const columns = createColumns({
        onViewDetails: handleViewDetails,
        pageIndex,
        pageSize,
    })

    return (
        <div className="space-y-3">
            <TopBar
                title="Purchase invoices"
                search={{
                    placeholder: "Search purchases…",
                    value: searchQuery,
                    onChange: setSearchQuery,
                }}
                filters={
                    <div className="min-w-0 flex-1 basis-full sm:basis-[min(100%,28rem)]">
                        <FilterBar
                            fields={filtersConfig}
                            applied={appliedFilters}
                            onApply={handleApplyFilters}
                        />
                    </div>
                }
                actions={[
                    {
                        label: "New purchase",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => {
                            window.location.href = "/purchase/create"
                        },
                        variant: "default",
                        size: "sm",
                    },
                ]}
            />

            {loading ? (
                <Loader text="Loading purchases…" />
            ) : (
                <div
                    className={cn(
                        "relative border border-border bg-card shadow-sm",
                        radiusClass
                    )}
                >
                    <div className={cn("overflow-x-auto", radiusClass)}>
                        <DataTable
                            pageSizeSelectClassName={radiusClass}
                            columns={columns}
                            data={data}
                            pageCount={pageCount}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            onPageChange={setPageIndex}
                            onPageSizeChange={(size) => {
                                setPageSize(size)
                                setPageIndex(1)
                            }}
                            onRowDoubleClick={handleViewDetails}
                        />
                    </div>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto border-border">
                    <DialogHeader>
                        <DialogTitle>Purchase details</DialogTitle>
                        <DialogDescription>
                            Complete purchase information for this invoice.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPurchase ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Purchase number
                                    </p>
                                    <p className="text-base font-semibold">
                                        {selectedPurchase.purchaseNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="text-base">
                                        {format(
                                            new Date(selectedPurchase.purchaseDate),
                                            "MMM dd, yyyy"
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Supplier
                                    </p>
                                    <p className="text-base">{selectedPurchase.supplierName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total amount
                                    </p>
                                    <p className="text-base font-semibold">
                                        ${selectedPurchase.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-muted-foreground">
                                    Items
                                </p>
                                <div className={cn("border border-border", radiusClass)}>
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-2 py-1 text-left text-[11px] font-medium">
                                                    Product
                                                </th>
                                                <th className="px-2 py-1 text-left text-[11px] font-medium">
                                                    Quantity
                                                </th>
                                                <th className="px-2 py-1 text-left text-[11px] font-medium">
                                                    Unit cost
                                                </th>
                                                <th className="px-2 py-1 text-left text-[11px] font-medium">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPurchase.items.map((item) => (
                                                <tr key={item.id} className="border-t border-border">
                                                    <td className="px-2 py-1 leading-snug">
                                                        {item.productTitle || item.title}
                                                    </td>
                                                    <td className="px-2 py-1 tabular-nums">{item.quantity}</td>
                                                    <td className="px-2 py-1 tabular-nums">
                                                        ${item.unitCost.toFixed(2)}
                                                    </td>
                                                    <td className="px-2 py-1 font-medium tabular-nums">
                                                        $
                                                        {(
                                                            (item.quantity || 0) * (item.unitCost || 0)
                                                        ).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {selectedPurchase.metadata?.notes ? (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Notes
                                    </p>
                                    <p className="text-base">{selectedPurchase.metadata.notes}</p>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
