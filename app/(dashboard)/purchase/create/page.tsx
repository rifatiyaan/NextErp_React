"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Loader2, Search, PackagePlus, Inbox } from "lucide-react"

import { CategoryCombobox } from "@/components/shared/category-combobox"
import { Combobox } from "@/components/shared/combobox"
import { CompactField, CompactInput, CompactTable } from "@/components/shared/erp"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { purchaseAPI } from "@/lib/api/purchase"
import { supplierAPI } from "@/lib/api/supplier"
import { productAPI } from "@/lib/api/product"
import { categoryAPI } from "@/lib/api/category"
import type { Supplier } from "@/lib/api/supplier"
import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import type { PurchaseItemRequest } from "@/types/purchase"
import { pickPrimaryVariant } from "@/lib/product-variant"
import { useRadiusClass } from "@/hooks/use-radius-class"
import { tableBodyRowHoverClassName } from "@/components/ui/table"
import { cn } from "@/lib/utils"
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

export default function CreatePurchasePage() {
    const router = useRouter()
    const radiusClass = useRadiusClass()
    const selectTriggerErp = cn(
        "h-9 w-full border-border bg-background px-2.5 text-sm shadow-sm transition-colors hover:bg-muted/40 [&>span]:truncate",
        radiusClass
    )
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
    const productSearchSeq = useRef(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(productSearchQuery.trim())
        }, PRODUCT_SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [productSearchQuery])

    useEffect(() => {
        const run = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setSearchProducts([])
                setLoadingProducts(false)
                return
            }
            const seq = ++productSearchSeq.current
            setLoadingProducts(true)
            try {
                const response = await productAPI.getProducts(
                    1,
                    20,
                    debouncedSearch,
                    undefined,
                    selectedCategory || undefined,
                    "active"
                )
                if (seq !== productSearchSeq.current) return
                setSearchProducts(response.data || [])
            } catch {
                if (seq !== productSearchSeq.current) return
                setSearchProducts([])
            } finally {
                if (seq === productSearchSeq.current) setLoadingProducts(false)
            }
        }
        void run()
    }, [debouncedSearch, selectedCategory])

    useEffect(() => {
        const q = productSearchQuery.trim()
        const d = debouncedSearch.trim()
        if (q.length < 2 || d.length < 2) {
            setSearchOpen(false)
            return
        }
        if (q !== d) {
            setSearchOpen(false)
            return
        }
        if (loadingProducts) {
            setSearchOpen(searchProducts.length > 0)
            return
        }
        setSearchOpen(searchProducts.length > 0)
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
        <div className="mx-auto max-w-[1920px] px-2 py-2 sm:px-4 sm:py-3">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/15",
                            radiusClass
                        )}
                    >
                        <PackagePlus className="h-4 w-4" aria-hidden />
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                        New purchase
                    </h1>
                </div>
                <Badge
                    variant="secondary"
                    className={cn("h-8 w-fit px-3 text-xs font-medium tabular-nums", radiusClass)}
                >
                    {items.length} line{items.length === 1 ? "" : "s"}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <div
                    className={cn(
                        "min-w-0 overflow-hidden border border-border/80 bg-card shadow-md ring-1 ring-border/40",
                        radiusClass
                    )}
                >
                        {/* Header: supplier | date */}
                        <div className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent px-4 py-3 sm:px-5 sm:py-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                            </div>
                        </div>

                        {/* Product search + category */}
                        <div className="border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
                            <CompactField label="Add products" htmlFor="productSearch">
                                <div className="flex w-full min-w-0 items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <Popover
                                            open={searchOpen}
                                            onOpenChange={(open) => {
                                                if (!open) setSearchOpen(false)
                                            }}
                                        >
                                            <PopoverTrigger asChild>
                                                <div
                                                    tabIndex={0}
                                                    className={cn(
                                                        "relative block w-full min-w-0 cursor-text ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2",
                                                        radiusClass
                                                    )}
                                                >
                                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <CompactInput
                                                        id="productSearch"
                                                        value={productSearchQuery}
                                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                                        onKeyDown={handleSearchKeyDown}
                                                        placeholder="Search by name or SKU…"
                                                        className="h-8 w-full min-w-0 pl-9 pr-9"
                                                        autoComplete="off"
                                                    />
                                                    {loadingProducts ? (
                                                        <Loader2
                                                            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
                                                            aria-hidden
                                                        />
                                                    ) : null}
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-[var(--radix-popover-trigger-width)] overflow-hidden border border-border p-0 shadow-xl"
                                                align="start"
                                                onOpenAutoFocus={(ev) => ev.preventDefault()}
                                            >
                                            <Command shouldFilter={false}>
                                                <CommandList className="max-h-72">
                                                    {loadingProducts && searchProducts.length === 0 ? (
                                                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                                            Searching…
                                                        </div>
                                                    ) : null}
                                                    <CommandGroup className="divide-y divide-border p-0">
                                                        {searchProducts.map((product) => {
                                                            const img = product.imageUrl?.trim() || ""
                                                            return (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.id.toString()}
                                                                    onSelect={() =>
                                                                        addProductToItems(product)
                                                                    }
                                                                    className="cursor-pointer px-2 py-2 text-sm aria-selected:bg-accent data-[selected=true]:bg-accent"
                                                                >
                                                                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                                        <div
                                                                            className={cn(
                                                                                "relative h-11 w-11 shrink-0 overflow-hidden border border-border bg-muted",
                                                                                radiusClass
                                                                            )}
                                                                        >
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
                                                                                {formatMoney(product.price)} ·
                                                                                stock {product.stock}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            )
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <CategoryCombobox
                                        categories={categories}
                                        value={selectedCategory}
                                        onChange={(id) => {
                                            setSelectedCategory(id)
                                            setProductSearchQuery("")
                                            setSearchProducts([])
                                        }}
                                        triggerClassName="h-8"
                                        size="compact"
                                    />
                                </div>
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
                        <CompactTable className="border-0 shadow-none ring-0">
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
                                                <div
                                                    className={cn(
                                                        "flex h-12 w-12 items-center justify-center bg-muted text-muted-foreground",
                                                        radiusClass
                                                    )}
                                                >
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
                                                className={cn(
                                                    "align-middle",
                                                    tableBodyRowHoverClassName
                                                )}
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
                                                        className={cn(
                                                            "h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                                                            radiusClass
                                                        )}
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

                    <div className="border-t border-border/60 bg-muted/10 px-4 py-4 sm:px-5 sm:py-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1 lg:max-w-xl">
                                <CompactField label="Invoice note" htmlFor="invoiceNote">
                                    <Textarea
                                        id="invoiceNote"
                                        value={invoiceNote}
                                        onChange={(e) => setInvoiceNote(e.target.value)}
                                        placeholder="Reference, delivery notes, internal comments…"
                                        rows={3}
                                        className={cn(
                                            "min-h-[5rem] resize-y border-border bg-background px-3 py-2 text-sm shadow-sm transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring/25",
                                            radiusClass
                                        )}
                                    />
                                </CompactField>
                            </div>

                            <div className="flex w-full max-w-[17.5rem] flex-col gap-3 self-end lg:max-w-[17.5rem] lg:shrink-0">
                                <p className="text-[11px] font-medium text-muted-foreground">
                                    Totals · {items.length} line{items.length === 1 ? "" : "s"}
                                </p>
                                <div
                                    className={cn(
                                        "overflow-hidden border border-border/70 bg-card",
                                        radiusClass
                                    )}
                                >
                                    <table className="w-full border-collapse text-xs tabular-nums">
                                        <tbody>
                                            <tr className="border-b border-border/50">
                                                <td className="px-3 py-2 text-muted-foreground">
                                                    Subtotal
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                                    {formatMoney(subtotal)}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-border/50">
                                                <td className="px-3 py-2 text-muted-foreground">Tax</td>
                                                <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                                    {formatMoney(taxTotal)}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-border/50">
                                                <td className="px-3 py-2 align-middle text-muted-foreground">
                                                    Discount
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <CompactInput
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        value={discount}
                                                        onChange={(e) =>
                                                            setDiscount(parseFloat(e.target.value) || 0)
                                                        }
                                                        className="ms-auto h-8 w-full min-w-0 max-w-[7.5rem] text-right font-mono text-xs tabular-nums"
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="bg-primary/5">
                                                <td className="px-3 py-2.5 font-semibold text-foreground">
                                                    Grand total
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold text-primary">
                                                    {formatMoney(grandTotal)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className={cn(
                                            "h-10 flex-1 px-3 text-sm font-medium",
                                            radiusClass
                                        )}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || items.length === 0}
                                        className={cn(
                                            "h-10 flex-1 px-3 text-sm font-semibold shadow-sm",
                                            radiusClass
                                        )}
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
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
