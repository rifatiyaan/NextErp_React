"use client"

import { useEffect, useState } from "react"
import { categoryAPI } from "@/lib/api/category"
import { Category, CategoryListResponse } from "@/types/category"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"

export default function CategoriesPage() {
    const [data, setData] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const fetchData = async (page: number, size: number) => {
        setLoading(true)
        try {
            const response = await categoryAPI.getCategories(page, size)

            // Handle different response structures gracefully
            if (response && response.data) {
                setData(response.data)
                setTotal(response.total)
            } else if (Array.isArray(response)) {
                // Fallback if API returns direct array
                setData(response)
                setTotal(response.length)
            } else {
                console.error("Unexpected API response structure:", response)
                setData([])
                setTotal(0)
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(pageIndex, pageSize)
    }, [pageIndex, pageSize])

    const pageCount = Math.ceil(total / pageSize) || 1
    const columns = createColumns({ pageIndex, pageSize })

    return (
        <div className="space-y-3">
            <TopBar
                title="Categories"
                actions={[
                    {
                        label: "Add New Category",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => window.location.href = "/inventory/categories/create",
                        variant: "default",
                        size: "sm",
                    },
                ]}
            />

            {loading ? (
                <Loader text="Loading categories..." />
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onPageChange={setPageIndex}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPageIndex(1) // Reset to first page on size change
                    }}
                />
            )}
        </div>
    )
}
