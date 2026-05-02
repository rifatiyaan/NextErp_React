"use client"

import { useEffect, useState } from "react"
import { Table } from "@tanstack/react-table"
import { Customer } from "@/types/customer"
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
import { useCustomers } from "@/hooks/use-customers"
export default function CustomersPage() {
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [table, setTable] = useState<Table<Customer> | null>(null)

    // Debounce search input — reset page on change
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

    const customersQuery = useCustomers({
        pageIndex,
        pageSize,
        searchText: debouncedSearch || undefined,
    })

    // Status filtering is client-side because the API does not currently support it.
    const allRows = customersQuery.data?.data ?? []
    const data =
        statusFilter === "active"
            ? allRows.filter((c) => c.isActive)
            : statusFilter === "inactive"
              ? allRows.filter((c) => !c.isActive)
              : allRows
    const total = customersQuery.data?.total ?? 0
    const loading = customersQuery.isPending

    const pageCount = Math.ceil(total / pageSize)
    const columns = createColumns({ pageIndex, pageSize })

    return (
        <div className="space-y-3">
            <TopBar
                title="Customers"
                search={{
                    placeholder: "Search by customer name...",
                    value: searchQuery,
                    onChange: setSearchQuery,
                }}
                actions={[
                    {
                        label: "Add New Customer",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => window.location.href = "/inventory/customers/create",
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
                <Loader text="Loading customers..." />
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

