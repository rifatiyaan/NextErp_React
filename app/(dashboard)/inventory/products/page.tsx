"use client"

import { useEffect, useState } from "react"
import { Product } from "@/types/product"
import { productAPI } from "@/lib/api/product"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([])
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true)
            try {
                const response = await productAPI.getProducts(pageIndex, pageSize)
                if (response && response.data) {
                    setData(response.data)
                    setTotal(response.total)
                } else {
                    // Fallback if structure doesn't match expected { data: [], total: 0 }
                    // Maybe the API returns the array directly?
                    if (Array.isArray(response)) {
                        setData(response)
                        setTotal(response.length)
                    } else {
                        console.error("Unexpected API response format:", response)
                        setData([])
                        setTotal(0)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch products:", error)
                // Optional: set a local error state to show a message in the UI instead of crashing
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [pageIndex, pageSize])

    const pageCount = Math.ceil(total / pageSize)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">
                        Manage your product inventory
                    </p>
                </div>
                <Button asChild>
                    <Link href="/inventory/products/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onPageChange={setPageIndex}
                />
            )}
        </div>
    )
}
