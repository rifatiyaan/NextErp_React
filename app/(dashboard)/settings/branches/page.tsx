"use client"

import { useCallback, useEffect, useState } from "react"
import type { Table } from "@tanstack/react-table"
import { branchAPI } from "@/lib/api/branch"
import type { Branch } from "@/lib/types/branch"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { Plus } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import { TopBar } from "@/components/layout/TopBar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function BranchesPage() {
    const [data, setData] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [table, setTable] = useState<Table<Branch> | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const response = await branchAPI.getBranches()
            let filtered = response.data

            if (statusFilter === "active") filtered = filtered.filter((b) => b.isActive)
            else if (statusFilter === "inactive") filtered = filtered.filter((b) => !b.isActive)

            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                filtered = filtered.filter(
                    (b) =>
                        b.name.toLowerCase().includes(q) ||
                        b.address?.toLowerCase().includes(q) ||
                        b.metadata?.branchCode?.toLowerCase().includes(q)
                )
            }

            setTotal(filtered.length)
            // Client-side slice for pagination (API returns all branches)
            const start = (pageIndex - 1) * pageSize
            setData(filtered.slice(start, start + pageSize))
        } catch {
            setData([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, searchQuery, statusFilter])

    useEffect(() => {
        void fetchData()
    }, [fetchData])

    async function handleDeactivate(branch: Branch) {
        if (!confirm(`Deactivate "${branch.name}"?`)) return
        try {
            await branchAPI.deleteBranch(branch.id)
            void fetchData()
        } catch {
            alert("Failed to deactivate branch")
        }
    }

    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    const columns = createColumns({ pageIndex, pageSize, onDeactivate: handleDeactivate })

    return (
        <div className="space-y-3">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/settings/modules">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Branches</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <TopBar
                title="Branches"
                description="Manage your organisation's physical and logical branches"
                search={{
                    placeholder: "Search by name or code...",
                    value: searchQuery,
                    onChange: (v) => { setSearchQuery(v); setPageIndex(1) },
                }}
                actions={[
                    {
                        label: "Add Branch",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => (window.location.href = "/settings/branches/create"),
                        variant: "default",
                        size: "sm",
                    },
                ]}
                filters={
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPageIndex(1) }}>
                        <SelectTrigger className="w-[140px] h-8 text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />

            {loading ? (
                <Loader text="Loading branches..." />
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
