"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { purchaseAPI } from "@/lib/api/purchase"
import { supplierAPI } from "@/lib/api/supplier"
import { productAPI } from "@/lib/api/product"
import { categoryAPI } from "@/lib/api/category"
import type { Supplier } from "@/lib/api/supplier"
import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import type { PurchaseItemRequest, PurchaseItemMetadata } from "@/types/purchase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface PurchaseItemRow extends PurchaseItemRequest {
    id: string
    productTitle?: string
    productCode?: string
    measureUnit?: string
}

export default function CreatePurchasePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingSuppliers, setLoadingSuppliers] = useState(true)
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    
    const [supplierId, setSupplierId] = useState<number | null>(null)
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0])
    const [items, setItems] = useState<PurchaseItemRow[]>([])
    const [discount, setDiscount] = useState(0)
    const [invoiceNote, setInvoiceNote] = useState("")

    // Product search state
    const [productSearchQuery, setProductSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [searchProducts, setSearchProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Debounce product search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(productSearchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [productSearchQuery])

    // Fetch products based on search and category
    useEffect(() => {
        const fetchProducts = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setSearchProducts([])
                return
            }

            try {
                setLoadingProducts(true)
                const response = await productAPI.getProducts(
                    1,
                    20, // Limit to 20 results for dropdown
                    debouncedSearch,
                    undefined,
                    selectedCategory || undefined,
                    "active"
                )
                setSearchProducts(response.data || [])
            } catch (error) {
                console.error("Failed to fetch products:", error)
                setSearchProducts([])
            } finally {
                setLoadingProducts(false)
            }
        }

        fetchProducts()
    }, [debouncedSearch, selectedCategory])

    // Fetch suppliers
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoadingSuppliers(true)
                const response = await supplierAPI.getSuppliers(1, 1000)
                setSuppliers(response.data.filter(s => s.isActive))
            } catch (error) {
                console.error("Failed to fetch suppliers:", error)
                toast.error("Failed to load suppliers")
            } finally {
                setLoadingSuppliers(false)
            }
        }
        fetchSuppliers()
    }, [])

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const allCategories = await categoryAPI.getAllCategories()
                setCategories(allCategories)
            } catch (error) {
                console.error("Failed to fetch categories:", error)
                toast.error("Failed to load categories")
            }
        }
        fetchCategories()
    }, [])

    // Add product to items list
    const addProductToItems = useCallback((product: Product) => {
        // Check if product already exists in items
        const existingItem = items.find(item => item.productId === product.id)
        if (existingItem) {
            toast.info(`${product.title} is already in the list`)
            return
        }

        const newItem: PurchaseItemRow = {
            id: `temp-${Date.now()}`,
            title: product.title,
            productId: product.id,
            quantity: 1,
            unitCost: product.price,
            productTitle: product.title,
            productCode: product.code,
            measureUnit: "pc",
        }

        setItems([...items, newItem])
        setProductSearchQuery("")
        setSearchOpen(false)
        toast.success(`${product.title} added to list`)
    }, [items])

    // Handle Enter key in search
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchProducts.length > 0) {
            e.preventDefault()
            addProductToItems(searchProducts[0])
        }
    }

    const removeItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id))
    }

    const updateItem = (id: string, field: keyof PurchaseItemRow, value: any) => {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    return { ...item, [field]: value }
                }
                return item
            })
        )
    }

    const updateItemMetadata = (id: string, field: keyof PurchaseItemMetadata, value: any) => {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        metadata: {
                            ...item.metadata,
                            [field]: value,
                        },
                    }
                }
                return item
            })
        )
    }

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
    }, [items])

    const netTotal = subtotal - discount

    const generatePurchaseNumber = () => {
        const date = new Date()
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        return `PUR-${dateStr}-${random}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!supplierId) {
            toast.error("Please select a supplier")
            return
        }

        if (items.length === 0) {
            toast.error("Please add at least one item")
            return
        }

        const invalidItems = items.filter(
            (item) => !item.productId || item.quantity <= 0 || item.unitCost < 0
        )
        if (invalidItems.length > 0) {
            toast.error("Please fill all item fields correctly")
            return
        }

        setLoading(true)
        try {
            const purchaseData = {
                title: `Purchase - ${new Date().toLocaleDateString()}`,
                purchaseNumber: generatePurchaseNumber(),
                supplierId,
                purchaseDate: new Date(purchaseDate).toISOString(),
                discount,
                items: items.map((item) => ({
                    title: item.title,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    metadata: item.metadata || undefined,
                })),
                metadata: {
                    notes: invoiceNote || undefined,
                },
            }

            await purchaseAPI.createPurchase(purchaseData)
            toast.success("Purchase created successfully!")
            router.push("/purchase/invoices")
        } catch (error: any) {
            console.error("Failed to create purchase:", error)
            toast.error(error?.message || "Failed to create purchase")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-[1920px] mx-auto p-4 space-y-4">
            <h1 className="text-xl font-bold">New Purchase</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Purchase Details Section */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="supplier" className="text-xs">Select supplier *</Label>
                                <Select
                                    value={supplierId?.toString() || ""}
                                    onValueChange={(value) => setSupplierId(parseInt(value))}
                                    disabled={loadingSuppliers}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem
                                                key={supplier.id}
                                                value={supplier.id.toString()}
                                            >
                                                {supplier.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="purchaseDate" className="text-xs">Date *</Label>
                                <Input
                                    id="purchaseDate"
                                    type="date"
                                    value={purchaseDate}
                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                    required
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-xs">Filter by Category</Label>
                                <Select
                                    value={selectedCategory?.toString() || "all"}
                                    onValueChange={(value) => {
                                        setSelectedCategory(value === "all" ? null : parseInt(value))
                                        setProductSearchQuery("")
                                        setSearchProducts([])
                                    }}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Search Section */}
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="productSearch" className="text-xs">Search Product (Type name or code, press Enter to add)</Label>
                            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                                <PopoverTrigger asChild>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            ref={searchInputRef}
                                            id="productSearch"
                                            value={productSearchQuery}
                                            onChange={(e) => {
                                                setProductSearchQuery(e.target.value)
                                                setSearchOpen(true)
                                            }}
                                            onKeyDown={handleSearchKeyDown}
                                            onFocus={() => {
                                                if (productSearchQuery.length >= 2) {
                                                    setSearchOpen(true)
                                                }
                                            }}
                                            placeholder="Search by product name or code..."
                                            className="h-9 pl-10"
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <Command shouldFilter={false}>
                                        <CommandList>
                                            {loadingProducts ? (
                                                <div className="flex items-center justify-center p-4">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : searchProducts.length === 0 && debouncedSearch.length >= 2 ? (
                                                <CommandEmpty>No products found.</CommandEmpty>
                                            ) : searchProducts.length === 0 ? (
                                                <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
                                            ) : (
                                                <CommandGroup>
                                                    {searchProducts.map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={product.id.toString()}
                                                            onSelect={() => addProductToItems(product)}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{product.title}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Code: {product.code} | Price: ${product.price.toFixed(2)} | Stock: {product.stock}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            )}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Items Table */}
                {items.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm">Items ({items.length})</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-2 font-medium text-xs">#</th>
                                                <th className="text-left p-2 font-medium text-xs">Item</th>
                                                <th className="text-left p-2 font-medium text-xs">Description</th>
                                                <th className="text-left p-2 font-medium text-xs">Unit</th>
                                                <th className="text-left p-2 font-medium text-xs">Quantity *</th>
                                                <th className="text-left p-2 font-medium text-xs">Unit Cost *</th>
                                                <th className="text-left p-2 font-medium text-xs">Weight (KG)</th>
                                                <th className="text-left p-2 font-medium text-xs">Expire Date</th>
                                                <th className="text-right p-2 font-medium text-xs">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => (
                                                <tr key={item.id} className="border-b hover:bg-muted/30">
                                                    <td className="p-2 text-xs">{index + 1}</td>
                                                    <td className="p-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-xs">{item.productTitle}</span>
                                                            <span className="text-xs text-muted-foreground">{item.productCode}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            value={item.metadata?.description || ""}
                                                            onChange={(e) =>
                                                                updateItemMetadata(
                                                                    item.id,
                                                                    "description",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Description"
                                                            className="w-[140px] h-8 text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-xs text-muted-foreground">
                                                        {item.measureUnit || "pc"}
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    item.id,
                                                                    "quantity",
                                                                    parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-20 h-8 text-xs"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitCost}
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    item.id,
                                                                    "unitCost",
                                                                    parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                            className="w-28 h-8 text-xs"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.metadata?.weight || ""}
                                                            onChange={(e) =>
                                                                updateItemMetadata(
                                                                    item.id,
                                                                    "weight",
                                                                    e.target.value ? parseFloat(e.target.value) : undefined
                                                                )
                                                            }
                                                            placeholder="0.00"
                                                            className="w-20 h-8 text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <Input
                                                            type="date"
                                                            value={item.metadata?.expiryDate ? new Date(item.metadata.expiryDate).toISOString().split("T")[0] : ""}
                                                            onChange={(e) =>
                                                                updateItemMetadata(
                                                                    item.id,
                                                                    "expiryDate",
                                                                    e.target.value ? new Date(e.target.value).toISOString() : undefined
                                                                )
                                                            }
                                                            className="w-32 h-8 text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(item.id)}
                                                            className="h-7 w-7"
                                                        >
                                                            <X className="h-3.5 w-3.5 text-destructive" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Invoice Note */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-4">
                                <Label htmlFor="invoiceNote" className="text-xs">Invoice Note</Label>
                                <Textarea
                                    id="invoiceNote"
                                    value={invoiceNote}
                                    onChange={(e) => setInvoiceNote(e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={4}
                                    className="mt-1.5 text-sm"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Box */}
                    <div>
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Sub Total:</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-muted-foreground">Discount:</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={discount}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                            className="w-20 h-8 text-xs"
                                        />
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>Net Total:</span>
                                            <span>${netTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="flex-1 h-9 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || items.length === 0}
                                        className="flex-1 h-9 text-xs"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}
