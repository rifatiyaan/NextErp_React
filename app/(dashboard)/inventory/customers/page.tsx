"use client"

import { useEffect, useState } from "react"
import { customerAPI } from "@/lib/api/customer"
import { Customer } from "@/types/customer"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function CustomersPage() {
    const [data, setData] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const fetchData = async (page: number, size: number) => {
        setLoading(true)
        try {
            const response = await customerAPI.getCustomers(
                page,
                size,
                searchQuery || undefined
            )
            if (response && response.data) {
                // Filter by status if needed
                let filteredData = response.data
                if (statusFilter === "active") {
                    filteredData = filteredData.filter((c) => c.isActive)
                } else if (statusFilter === "inactive") {
                    filteredData = filteredData.filter((c) => !c.isActive)
                }
                setData(filteredData)
                setTotal(response.total)
            } else {
                setData([])
                setTotal(0)
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error)
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

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                <div className="flex items-center gap-2">
                    <div className="relative w-[280px]">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Customer Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <Button asChild size="sm">
                        <Link href="/inventory/customers/create">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Customer
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                />
            )}
        </div>
    )
}

