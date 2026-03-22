"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Loader2, Search, PackagePlus, Inbox } from "lucide-react"

import { Combobox } from "@/components/shared/combobox"
import {
    CompactField,
    CompactInput,
    CompactTable,
    SummaryPanel,
} from "@/components/shared/erp"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { purchaseAPI } from "@/lib/api/purchase"
import { supplierAPI } from "@/lib/api/supplier"
import { productAPI } from "@/lib/api/product"
import { categoryAPI } from "@/lib/api/category"
import type { Supplier } from "@/lib/api/supplier"
import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import type { PurchaseItemRequest } from "@/types/purchase"
import { pickPrimaryVariant } from "@/lib/product-variant"
import { toast } from "sonner"

function formatMoney(n: number) {
    return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function lineSubtotal(qty: number, unit: number) {
    return qty * unit
}

function lineTaxAmount(qty: number, unit: number, taxPercent: number) {
    return lineSubtotal(qty, unit) * (taxPercent / 100)
}

interface PurchaseItemRow extends PurchaseItemRequest {
    id: string
    productTitle?: string
    productCode?: string
    measureUnit?: string
    /** Line tax % — UI only; not sent to API */
    taxPercent: number
}

/** Debounce delay before calling product search API */
const PRODUCT_SEARCH_DEBOUNCE_MS = 480

const selectTriggerErp =
    "h-9 w-full rounded-none border-border bg-background px-2.5 text-sm shadow-sm transition-colors hover:bg-muted/40 [&>span]:truncate"

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

    const [productSearchQuery, setProductSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [searchProducts, setSearchProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(productSearchQuery.trim())
        }, PRODUCT_SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [productSearchQuery])

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
                    20,
                    debouncedSearch,
                    undefined,
                    selectedCategory || undefined,
                    "active"
                )
                setSearchProducts(response.data || [])
            } catch {
                setSearchProducts([])
            } finally {
                setLoadingProducts(false)
            }
        }
        void fetchProducts()
    }, [debouncedSearch, selectedCategory])

    /**
     * Popover: open while a request is in flight, or when debounced query matches the input
     * and API returned ≥1 row. Never open for zero matches; avoid showing stale results while typing.
     */
    useEffect(() => {
        const q = productSearchQuery.trim()
        const d = debouncedSearch.trim()
        if (q.length < 2 || d.length < 2) {
            setSearchOpen(false)
            return
        }
        if (loadingProducts) {
            setSearchOpen(true)
            return
        }
        const searchMatchesInput = q === d
        setSearchOpen(searchMatchesInput && searchProducts.length > 0)
    }, [
        productSearchQuery,
        debouncedSearch,
        loadingProducts,
        searchProducts.length,
    ])

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoadingSuppliers(true)
                const response = await supplierAPI.getSuppliers(1, 1000)
                setSuppliers(response.data.filter((s) => s.isActive))
            } catch {
                toast.error("Failed to load suppliers")
            } finally {
                setLoadingSuppliers(false)
            }
        }
        void fetchSuppliers()
    }, [])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategories(await categoryAPI.getAllCategories())
            } catch {
                toast.error("Failed to load categories")
            }
        }
        void fetchCategories()
    }, [])

    const addProductToItems = useCallback((product: Product) => {
        const variant = pickPrimaryVariant(product)
        if (!variant) {
            toast.error(`${product.title} has no purchasable SKU.`)
            return
        }
        setItems((prev) => {
            if (prev.some((item) => item.productVariantId === variant.id)) {
                toast.info(`${product.title} is already in the list`)
                return prev
            }
            const lineTitle = product.hasVariations
                ? `${product.title} (${variant.title})`
                : product.title
            const newItem: PurchaseItemRow = {
                id: `temp-${Date.now()}`,
                title: lineTitle,
                productVariantId: variant.id,
                quantity: 1,
                unitCost: variant.price,
                productTitle: product.title,
                productCode: product.code,
                measureUnit: "pc",
                taxPercent: 0,
            }
            toast.success(`${lineTitle} added`)
            return [...prev, newItem]
        })
        setProductSearchQuery("")
        setSearchOpen(false)
    }, [])

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return
        if (debouncedSearch.trim().length < 2 || loadingProducts) return
        if (searchProducts.length === 0) return
        e.preventDefault()
        addProductToItems(searchProducts[0])
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const updateItem = (id: string, field: keyof PurchaseItemRow, value: unknown) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        )
    }

    const { subtotal, taxTotal, grandTotal } = useMemo(() => {
        let sub = 0
        let tax = 0
        for (const item of items) {
            const s = lineSubtotal(item.quantity, item.unitCost)
            sub += s
            tax += lineTaxAmount(item.quantity, item.unitCost, item.taxPercent)
        }
        return {
            subtotal: sub,
            taxTotal: tax,
            grandTotal: sub + tax - discount,
        }
    }, [items, discount])

    const generatePurchaseNumber = () => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
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
            (item) => !item.productVariantId || item.quantity <= 0 || item.unitCost < 0
        )
        if (invalidItems.length > 0) {
            toast.error("Please fill all item fields correctly")
            return
        }

        setLoading(true)
        try {
            await purchaseAPI.createPurchase({
                title: `Purchase - ${new Date().toLocaleDateString()}`,
                purchaseNumber: generatePurchaseNumber(),
                supplierId,
                purchaseDate: new Date(purchaseDate).toISOString(),
                discount,
                items: items.map((item) => ({
                    title: item.title,
                    productVariantId: item.productVariantId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    metadata: item.metadata || undefined,
                })),
                metadata: { notes: invoiceNote || undefined },
            })
            toast.success("Purchase created successfully!")
            router.push("/purchase/invoices")
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to create purchase"
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-[1920px] px-2 py-3 sm:px-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary ring-1 ring-primary/15">
                        <PackagePlus className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                            New purchase
                        </h1>
                        <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                            Enter supplier and date, search products, then review totals before saving.
                        </p>
                    </div>
                </div>
                <Badge
                    variant="secondary"
                    className="h-8 w-fit rounded-none px-3 text-xs font-medium tabular-nums"
                >
                    {items.length} line{items.length === 1 ? "" : "s"}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
                    <div className="min-w-0 overflow-hidden rounded-none border border-border/80 bg-card shadow-md ring-1 ring-border/40">
                        {/* Header: supplier | date | category */}
                        <div className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent px-4 py-4 sm:px-5 sm:py-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <CompactField label="Supplier *" htmlFor="supplier">
                                    <Combobox
                                        items={suppliers.map((s) => ({
                                            value: String(s.id),
                                            label: s.title,
                                        }))}
                                        value={supplierId != null ? String(supplierId) : null}
                                        onChange={(v) =>
                                            setSupplierId(v != null ? parseInt(v, 10) : null)
                                        }
                                        placeholder={
                                            loadingSuppliers ? "Loading suppliers…" : "Search supplier…"
                                        }
                                        emptyText="No supplier found."
                                        disabled={loadingSuppliers}
                                        triggerClassName={selectTriggerErp}
                                    />
                                </CompactField>
                                <CompactField label="Date *" htmlFor="purchaseDate">
                                    <CompactInput
                                        id="purchaseDate"
                                        type="date"
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                        required
                                    />
                                </CompactField>
                                <CompactField label="Category filter" htmlFor="category">
                                    <Select
                                        value={selectedCategory?.toString() || "all"}
                                        onValueChange={(value) => {
                                            setSelectedCategory(
                                                value === "all" ? null : parseInt(value, 10)
                                            )
                                            setProductSearchQuery("")
                                            setSearchProducts([])
                                        }}
                                    >
                                        <SelectTrigger id="category" className={selectTriggerErp}>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-border shadow-lg">
                                            <SelectItem value="all" className="rounded-none text-sm">
                                                All categories
                                            </SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                    className="rounded-none text-sm"
                                                >
                                                    {category.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CompactField>
                            </div>
                        </div>

                        {/* Product search */}
                        <div className="border-b border-border/60 px-4 py-4 sm:px-5 sm:py-5">
                            <CompactField
                                label="Add products"
                                htmlFor="productSearch"
                            >
                                <p className="-mt-1 mb-2 text-xs text-muted-foreground">
                                    Waits {PRODUCT_SEARCH_DEBOUNCE_MS / 1000}s after you stop typing, then searches.
                                    With results open, press{" "}
                                    <kbd className="rounded-none border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
                                        Enter
                                    </kbd>{" "}
                                    to add the first match.
                                </p>
                                <Popover
                                    open={searchOpen}
                                    onOpenChange={(open) => {
                                        if (!open) setSearchOpen(false)
                                    }}
                                >
                                    <PopoverTrigger asChild>
                                        <div className="relative rounded-none ring-offset-background transition-shadow focus-within:ring-2 focus-within:ring-ring/30 focus-within:ring-offset-2">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <CompactInput
                                                ref={searchInputRef}
                                                id="productSearch"
                                                value={productSearchQuery}
                                                onChange={(e) => setProductSearchQuery(e.target.value)}
                                                onKeyDown={handleSearchKeyDown}
                                                placeholder="Search by name or SKU…"
                                                className="pl-10"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-none border border-border p-0 shadow-xl"
                                        align="start"
                                        onOpenAutoFocus={(ev) => ev.preventDefault()}
                                    >
                                        <Command shouldFilter={false} className="rounded-none">
                                            <CommandList className="max-h-72 rounded-none">
                                                {loadingProducts ? (
                                                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                                        <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                                                        Searching…
                                                    </div>
                                                ) : (
                                                    <CommandGroup className="divide-y divide-border p-0">
                                                        {searchProducts.map((product) => {
                                                            const img =
                                                                product.imageUrl?.trim() || ""
                                                            return (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.id.toString()}
                                                                    onSelect={() =>
                                                                        addProductToItems(product)
                                                                    }
                                                                    className="cursor-pointer rounded-none px-2 py-2 text-sm aria-selected:bg-accent data-[selected=true]:bg-accent"
                                                                >
                                                                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-border bg-muted">
                                                                            {img ? (
                                                                                <Image
                                                                                    src={img}
                                                                                    alt={product.title}
                                                                                    fill
                                                                                    className="object-cover"
                                                                                    sizes="44px"
                                                                                    unoptimized
                                                                                />
                                                                            ) : (
                                                                                <div
                                                                                    className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground"
                                                                                    aria-hidden
                                                                                >
                                                                                    —
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex min-w-0 flex-col gap-0.5">
                                                                            <span className="truncate font-medium text-foreground">
                                                                                {product.title}
                                                                            </span>
                                                                            <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                                                                {product.code} ·{" "}
                                                                                {formatMoney(
                                                                                    product.price
                                                                                )}{" "}
                                                                                · stock {product.stock}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            )
                                                        })}
                                                    </CommandGroup>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {productSearchQuery.trim().length >= 2 &&
                                debouncedSearch.trim().length >= 2 &&
                                productSearchQuery.trim() === debouncedSearch.trim() &&
                                !loadingProducts &&
                                searchProducts.length === 0 ? (
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        No matching products — try another term or category.
                                    </p>
                                ) : null}
                            </CompactField>
                        </div>

                        {/* Lines table */}
                        <CompactTable className="rounded-none border-0 shadow-none ring-0">
                            <thead>
                                <tr className="sticky top-0 z-10 border-b border-border/80 bg-muted/80 backdrop-blur-md">
                                    <th className="w-10 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        #
                                    </th>
                                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        Product
                                    </th>
                                    <th className="w-24 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        Qty
                                    </th>
                                    <th className="w-28 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        Unit price
                                    </th>
                                    <th className="w-24 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        Tax %
                                    </th>
                                    <th className="w-32 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        Total
                                    </th>
                                    <th className="w-12 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        {""}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/80">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-14">
                                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-none bg-muted text-muted-foreground">
                                                    <Inbox className="h-6 w-6" aria-hidden />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">
                                                    No line items yet
                                                </p>
                                                <p className="max-w-xs text-xs text-muted-foreground">
                                                    Use the search field above to add products to this purchase.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, rowIndex) => {
                                        const sub = lineSubtotal(item.quantity, item.unitCost)
                                        const taxAmt = lineTaxAmount(
                                            item.quantity,
                                            item.unitCost,
                                            item.taxPercent
                                        )
                                        const total = sub + taxAmt
                                        return (
                                            <tr
                                                key={item.id}
                                                className="align-middle transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-2 py-2 text-center">
                                                    <span className="font-mono text-sm tabular-nums text-muted-foreground">
                                                        {rowIndex + 1}
                                                    </span>
                                                </td>
                                                <td className="min-w-0 px-3 py-2">
                                                    <div className="flex min-w-0 flex-col gap-0.5">
                                                        <span className="truncate text-sm font-medium leading-snug text-foreground">
                                                            {item.productTitle ?? item.title}
                                                        </span>
                                                        <span className="truncate font-mono text-xs text-muted-foreground">
                                                            {item.productCode ?? "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <CompactInput
                                                        type="number"
                                                        min={0.01}
                                                        step={0.01}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                "quantity",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="ms-auto w-full min-w-[4.5rem] text-right font-mono text-sm tabular-nums"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <CompactInput
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={item.unitCost}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                "unitCost",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="ms-auto w-full min-w-[5.5rem] text-right font-mono text-sm tabular-nums"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <CompactInput
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={item.taxPercent}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                "taxPercent",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="ms-auto w-full min-w-[4rem] text-right font-mono text-sm tabular-nums"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <span className="font-mono text-sm tabular-nums font-medium text-foreground">
                                                        {formatMoney(total)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(item.id)}
                                                        className="h-8 w-8 rounded-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        aria-label="Remove line"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </CompactTable>
                    </div>

                    <SummaryPanel>
                        <CompactField label="Invoice note" htmlFor="invoiceNote">
                            <Textarea
                                id="invoiceNote"
                                value={invoiceNote}
                                onChange={(e) => setInvoiceNote(e.target.value)}
                                placeholder="Reference, delivery notes, internal comments…"
                                rows={3}
                                className="min-h-[5.5rem] resize-y rounded-none border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring/25"
                            />
                        </CompactField>

                        <div className="flex flex-1 flex-col gap-3 rounded-none border border-border/60 bg-muted/25 p-3">
                            <div className="flex justify-between gap-3 text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono tabular-nums font-medium text-foreground">
                                    {formatMoney(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-3 text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-mono tabular-nums font-medium text-foreground">
                                    {formatMoney(taxTotal)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <CompactInput
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={discount}
                                    onChange={(e) =>
                                        setDiscount(parseFloat(e.target.value) || 0)
                                    }
                                    className="w-28 text-right font-mono text-sm tabular-nums"
                                />
                            </div>
                            <div className="mt-1 rounded-none border border-primary/20 bg-primary/5 px-3 py-3">
                                <div className="flex justify-between gap-3 text-sm font-semibold text-foreground">
                                    <span>Grand total</span>
                                    <span className="font-mono text-base tabular-nums text-primary">
                                        {formatMoney(grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex gap-2 border-t border-border/60 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="h-10 flex-1 rounded-none px-3 text-sm font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || items.length === 0}
                                className="h-10 flex-1 rounded-none px-3 text-sm font-semibold shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving
                                    </>
                                ) : (
                                    "Save purchase"
                                )}
                            </Button>
                        </div>
                    </SummaryPanel>
                </div>
            </form>
        </div>
    )
}
