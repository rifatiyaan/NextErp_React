"use client"

import { useEffect, useState, useCallback } from "react"
import { purchaseAPI } from "@/lib/api/purchase"
import { Purchase } from "@/types/purchase"
import { DataTable } from "@/app/(dashboard)/inventory/products/data-table"
import { createColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"

export default function PurchaseListPage() {
    const [data, setData] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Debounce search query
    useEffect(() => {
        if (searchQuery !== debouncedSearchQuery) {
            setIsSearching(true)
        }

        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
            setIsSearching(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery, debouncedSearchQuery])

    const fetchData = useCallback(async (
        page: number,
        size: number,
        search?: string
    ) => {
        setLoading(true)
        try {
            const response = await purchaseAPI.getPurchases(
                page,
                size,
                search || undefined
            )
            if (response && response.data) {
                setData(response.data)
                setTotal(response.total)
            } else {
                setData([])
                setTotal(0)
            }
        } catch (error) {
            console.error("Failed to fetch purchases:", error)
            setData([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        setPageIndex(1)
    }, [debouncedSearchQuery])

    useEffect(() => {
        fetchData(
            pageIndex,
            pageSize,
            debouncedSearchQuery || undefined
        )
    }, [pageIndex, pageSize, debouncedSearchQuery, fetchData])

    const pageCount = Math.ceil(total / pageSize) || 1

    const handleViewDetails = (purchase: Purchase) => {
        setSelectedPurchase(purchase)
        setIsModalOpen(true)
    }

    const columns = createColumns({
        onViewDetails: handleViewDetails,
        pageIndex,
        pageSize
    })

    return (
        <div className="space-y-3">
            <TopBar
                title="Purchase Invoices"
                search={{
                    placeholder: "Search purchases...",
                    value: searchQuery,
                    onChange: setSearchQuery,
                }}
                actions={[
                    {
                        label: "New Purchase",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => window.location.href = "/purchase/create",
                        variant: "default",
                        size: "sm",
                    },
                ]}
            />

            {loading ? (
                <Loader text="Loading purchases..." />
            ) : (
                <div className="relative border rounded-lg bg-card">
                    {isSearching && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <DataTable
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
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Purchase Details</DialogTitle>
                        <DialogDescription>
                            View complete purchase information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPurchase && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Purchase Number</p>
                                    <p className="text-base font-semibold">{selectedPurchase.purchaseNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="text-base">
                                        {format(new Date(selectedPurchase.purchaseDate), "MMM dd, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                                    <p className="text-base">{selectedPurchase.supplierName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                    <p className="text-base font-semibold">
                                        ${selectedPurchase.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
                                <div className="border rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-2 text-sm font-medium">Product</th>
                                                <th className="text-left p-2 text-sm font-medium">Quantity</th>
                                                <th className="text-left p-2 text-sm font-medium">Unit Cost</th>
                                                <th className="text-left p-2 text-sm font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPurchase.items.map((item) => (
                                                <tr key={item.id} className="border-t">
                                                    <td className="p-2">{item.productTitle || item.title}</td>
                                                    <td className="p-2">{item.quantity}</td>
                                                    <td className="p-2">${item.unitCost.toFixed(2)}</td>
                                                    <td className="p-2 font-medium">
                                                        ${((item.quantity || 0) * (item.unitCost || 0)).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {selectedPurchase.metadata?.notes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-base">{selectedPurchase.metadata.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

