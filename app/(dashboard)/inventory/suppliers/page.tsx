"use client"

import { useEffect, useState } from "react"
import { Table } from "@tanstack/react-table"
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
import { useSuppliers } from "@/hooks/use-suppliers"
export default function SuppliersPage() {
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [table, setTable] = useState<Table<Supplier> | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim())
            setPageIndex(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        setPageIndex(1)
    }, [statusFilter])

    const suppliersQuery = useSuppliers({
        pageIndex,
        pageSize,
        searchText: debouncedSearch || undefined,
    })

    // Status is filtered client-side because the API does not support it.
    const allRows = suppliersQuery.data?.data ?? []
    const data =
        statusFilter === "active"
            ? allRows.filter((s) => s.isActive)
            : statusFilter === "inactive"
              ? allRows.filter((s) => !s.isActive)
              : allRows
    const total = suppliersQuery.data?.total ?? 0
    const loading = suppliersQuery.isPending

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

