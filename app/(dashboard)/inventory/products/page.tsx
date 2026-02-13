"use client"

import { useEffect, useState, useCallback } from "react"
import { productAPI } from "@/lib/api/product"
import { Product } from "@/types/product"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { ProductDetailModal } from "./_components/ProductDetailModal"
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
import { Search, Loader2 } from "lucide-react"
import { Category } from "@/types/category"
import { categoryAPI } from "@/lib/api/category"

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [categories, setCategories] = useState<Category[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Debounce search query
    useEffect(() => {
        // Show loading indicator when search query changes and doesn't match debounced value
        if (searchQuery !== debouncedSearchQuery) {
            setIsSearching(true)
        }

        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
            setIsSearching(false)
        }, 500) // 500ms debounce

        return () => clearTimeout(timer)
    }, [searchQuery, debouncedSearchQuery])

    // Fetch categories for filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getCategories(1, 1000)
                if (response && response.data) {
                    setCategories(response.data)
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            }
        }
        fetchCategories()
    }, [])

    const fetchData = useCallback(async (
        page: number, 
        size: number, 
        search?: string, 
        status?: string | null, 
        categoryId?: number | null
    ) => {
        setLoading(true)
        try {
            const response = await productAPI.getProducts(
                page, 
                size, 
                search || undefined, 
                undefined, 
                categoryId || undefined, 
                status || undefined
            )
            if (response && response.data) {
                setData(response.data)
                setTotal(response.total)
            } else {
                setData([])
                setTotal(0)
            }
        } catch (error) {
            console.error("Failed to fetch products:", error)
            setData([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [])

    // Reset to page 1 when filters change (except pageIndex itself)
    useEffect(() => {
        setPageIndex(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, statusFilter, categoryFilter])

    // Fetch data when filters change
    useEffect(() => {
        const categoryId = categoryFilter !== "all" ? parseInt(categoryFilter) : null
        fetchData(
            pageIndex, 
            pageSize, 
            debouncedSearchQuery || undefined, 
            statusFilter !== "all" ? statusFilter : null,
            categoryId && categoryId > 0 ? categoryId : null
        )
    }, [pageIndex, pageSize, debouncedSearchQuery, statusFilter, categoryFilter, fetchData])

    const pageCount = Math.ceil(total / pageSize) || 1

    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    const columns = createColumns({ onViewDetails: handleViewDetails })

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                <div className="flex items-center gap-2">
                    <div className="relative w-[280px]">
                        {isSearching ? (
                            <Loader2 className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                        ) : (
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
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
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                {category.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            {loading ? (
                <Loader text="Loading products..." />
            ) : (
                <div className="relative">
                    {isSearching && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-md">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
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
            )}

            {/* Product Detail Modal */}
            <ProductDetailModal
                product={selectedProduct}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    )
}
