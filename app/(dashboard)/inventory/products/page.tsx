"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { productAPI } from "@/lib/api/product"
import { Product } from "@/types/product"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { ProductDetailModal } from "./_components/ProductDetailModal"
import { Button } from "@/components/ui/button"
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
import { Search, Loader2, Plus } from "lucide-react"
import { Category } from "@/types/category"
import { categoryAPI } from "@/lib/api/category"
import { TopBar } from "@/components/layout/TopBar"
import { ColumnVisibility } from "./_components/ColumnVisibility"
import { Table } from "@tanstack/react-table"

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
    const [table, setTable] = useState<Table<Product> | null>(null)

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

    const columns = createColumns({ 
        onViewDetails: handleViewDetails,
        pageIndex,
        pageSize
    })

    return (
        <div className="space-y-3">
            <TopBar
                title="Products"
                search={{
                    placeholder: "Search products...",
                    value: searchQuery,
                    onChange: setSearchQuery,
                }}
                actions={[
                    {
                        label: "Add New Product",
                        icon: <Plus className="h-3.5 w-3.5" />,
                        onClick: () => window.location.href = "/inventory/products/create",
                        variant: "default",
                        size: "sm",
                    },
                ]}
                filters={
                    <>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] h-8 text-sm">
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
                            <SelectTrigger className="w-[160px] h-8 text-sm">
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
                    </>
                }
                columnVisibility={table ? <ColumnVisibility table={table} /> : null}
            />

            {/* Data Table */}
            {loading ? (
                <Loader text="Loading products..." />
            ) : (
                <div className="relative border rounded-lg bg-card">
                    {isSearching && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
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
                        onTableReady={setTable}
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
