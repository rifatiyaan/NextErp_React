"use client"

import { useEffect, useState } from "react"
import { productAPI } from "@/lib/api/product"
import { Product } from "@/types/product"
import { DataTable } from "./data-table"
import { columns } from "./columns"
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
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")

    const fetchData = async (page: number, size: number) => {
        setLoading(true)
        try {
            const response = await productAPI.getProducts(page, size)
            if (response && response.data) {
                setData(response.data)
                setTotal(response.total)
            } else {
                setData([])
                setTotal(0)
            }
        } catch (error) {
            console.error("Failed to fetch products:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(pageIndex, pageSize)
    }, [pageIndex, pageSize])

    const pageCount = Math.ceil(total / pageSize) || 1

    // Filter data based on search and filters
    const filteredData = data.filter((product) => {
        const matchesSearch =
            searchQuery === "" ||
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && product.isActive && product.stock > 0) ||
            (statusFilter === "out of stock" && product.stock === 0) ||
            (statusFilter === "closed" && !product.isActive)

        const matchesCategory =
            categoryFilter === "all" ||
            product.category?.title.toLowerCase() === categoryFilter.toLowerCase()

        return matchesSearch && matchesStatus && matchesCategory
    })

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                <div className="flex items-center gap-2">
                    <div className="relative w-[280px]">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Product Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <Button asChild size="sm">
                        <Link href="/inventory/products/create">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="out of stock">Out of Stock</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            {loading ? (
                <Loader text="Loading products..." />
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onPageChange={setPageIndex}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPageIndex(1)
                    }}
                />
            )}
        </div>
    )
}
