"use client"

import { useEffect, useState } from "react"
import { categoryAPI } from "@/lib/api/category"
import { Category, CategoryListResponse } from "@/types/category"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function CategoriesPage() {
    const [data, setData] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchData = async (page: number) => {
        setLoading(true)
        try {
            const response = await categoryAPI.getCategories(page, 10)

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
        fetchData(pageIndex)
    }, [pageIndex])

    const pageCount = Math.ceil(total / 10) || 1

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                <Button asChild>
                    <Link href="/inventory/categories/create">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    onPageChange={setPageIndex}
                />
            )}
        </div>
    )
}
