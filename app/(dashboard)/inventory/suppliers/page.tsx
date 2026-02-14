"use client"

import { useEffect, useState } from "react"
import { Table } from "@tanstack/react-table"
import { supplierAPI } from "@/lib/api/supplier"
import { Supplier } from "@/types/supplier"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TopBar } from "@/components/layout/TopBar"
import { ColumnVisibility } from "./_components/ColumnVisibility"

export default function SuppliersPage() {
    const [data, setData] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [table, setTable] = useState<Table<Supplier> | null>(null)

    const fetchData = async (page: number, size: number) => {
        setLoading(true)
        try {
            const response = await supplierAPI.getSuppliers(
                page,
                size,
                searchQuery || undefined
            )
            if (response && response.data) {
                // Filter by status if needed
                let filteredData = response.data
                if (statusFilter === "active") {
                    filteredData = filteredData.filter((s) => s.isActive)
                } else if (statusFilter === "inactive") {
                    filteredData = filteredData.filter((s) => !s.isActive)
                }
                setData(filteredData)
                setTotal(response.total)
            } else {
                setData([])
                setTotal(0)
            }
        } catch (error) {
            console.error("Failed to fetch suppliers:", error)
            setData([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(pageIndex, pageSize)
    }, [pageIndex, pageSize])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pageIndex === 1) {
                fetchData(1, pageSize)
            } else {
                setPageIndex(1)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Refetch when status filter changes
    useEffect(() => {
        fetchData(pageIndex, pageSize)
    }, [statusFilter])

    const pageCount = Math.ceil(total / pageSize)
    const columns = createColumns({ pageIndex, pageSize })

    return (
        <div className="space-y-3">
            <TopBar
                title="Suppliers"
                search={{
                    placeholder: "Search by supplier name...",
                    value: searchQuery,
                    onChange: setSearchQuery,
                }}
                actions={[
                    {
                        label: "Add New Supplier",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => window.location.href = "/inventory/suppliers/create",
                        variant: "default",
                        size: "sm",
                    },
                ]}
                filters={
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[160px] h-8 text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                }
                columnVisibility={table ? <ColumnVisibility table={table} /> : null}
            />

            {/* Data Table */}
            {loading ? (
                <Loader text="Loading suppliers..." />
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onPageChange={setPageIndex}
                    onPageSizeChange={setPageSize}
                    onTableReady={setTable}
                />
            )}
        </div>
    )
}

