"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  LayoutGrid,
  Table2,
  Inbox,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { productAPI } from "@/lib/api/product"
import { categoryAPI } from "@/lib/api/category"
import { pickPrimaryVariant } from "@/lib/product-variant"
import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import { toast } from "sonner"
import Image from "next/image"
import { ResizablePanel } from "@/components/ui/resizable-panel"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  CompactField,
  CompactInput,
  CompactTable,
  SummaryPanel,
} from "@/components/shared/erp"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

const PRODUCT_SEARCH_DEBOUNCE_MS = 480

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type SaleLayoutMode = "pos" | "invoice"

interface CartLine {
  productVariantId: number
  productId: number
  title: string
  code?: string | null
  price: number
  stock: number
  imageUrl?: string | null
  quantity: number
}

export default function CreateSalesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isCreatingSale, setIsCreatingSale] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [layoutMode, setLayoutMode] = useState<SaleLayoutMode>("pos")

  const [invoiceProductSearchQuery, setInvoiceProductSearchQuery] = useState("")
  const [debouncedInvoiceSearch, setDebouncedInvoiceSearch] = useState("")
  const [invoiceSearchProducts, setInvoiceSearchProducts] = useState<Product[]>([])
  const [loadingInvoiceSearch, setLoadingInvoiceSearch] = useState(false)
  const [invoiceSearchOpen, setInvoiceSearchOpen] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const allCategories = await categoryAPI.getAllCategories()
        // Filter to only show parent categories (no parentId)
        const parentCategories = allCategories.filter(
          (cat) => !cat.parentId
        )
        setCategories(parentCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
    }, PRODUCT_SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInvoiceSearch(invoiceProductSearchQuery.trim())
    }, PRODUCT_SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [invoiceProductSearchQuery])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts(
        1,
        1000, // Large page size for POS
        debouncedSearchQuery || undefined,
        undefined,
        selectedCategory || undefined,
        "active" // Only active products
      )
      if (response && response.data) {
        setProducts(response.data)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast.error("Failed to load products")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, selectedCategory])

  useEffect(() => {
    if (layoutMode !== "pos") return
    void fetchProducts()
  }, [fetchProducts, layoutMode])

  useEffect(() => {
    if (layoutMode !== "invoice") return
    const run = async () => {
      if (!debouncedInvoiceSearch || debouncedInvoiceSearch.length < 2) {
        setInvoiceSearchProducts([])
        return
      }
      try {
        setLoadingInvoiceSearch(true)
        const response = await productAPI.getProducts(
          1,
          20,
          debouncedInvoiceSearch,
          undefined,
          selectedCategory || undefined,
          "active"
        )
        setInvoiceSearchProducts(response.data || [])
      } catch {
        setInvoiceSearchProducts([])
      } finally {
        setLoadingInvoiceSearch(false)
      }
    }
    void run()
  }, [debouncedInvoiceSearch, selectedCategory, layoutMode])

  useEffect(() => {
    const q = invoiceProductSearchQuery.trim()
    const d = debouncedInvoiceSearch.trim()
    if (q.length < 2 || d.length < 2) {
      setInvoiceSearchOpen(false)
      return
    }
    if (loadingInvoiceSearch) {
      setInvoiceSearchOpen(true)
      return
    }
    const searchMatchesInput = q === d
    setInvoiceSearchOpen(searchMatchesInput && invoiceSearchProducts.length > 0)
  }, [
    invoiceProductSearchQuery,
    debouncedInvoiceSearch,
    loadingInvoiceSearch,
    invoiceSearchProducts.length,
  ])

  const addToCart = (product: Product, options?: { fromInvoiceSearch?: boolean }) => {
    const variant = pickPrimaryVariant(product)
    if (!variant) {
      toast.error(`${product.title} has no sellable SKU.`)
      return
    }

    const availableStock = variant.stock ?? 0
    if (availableStock <= 0) {
      toast.error(`${product.title} is out of stock. Please purchase stock first.`, {
        duration: 5000,
      })
      return
    }

    const lineTitle = product.hasVariations
      ? `${product.title} (${variant.title})`
      : product.title

    let mutated = false
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productVariantId === variant.id)
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1
        if (newQuantity > availableStock) {
          toast.error(
            `Insufficient stock for ${lineTitle}. Available: ${availableStock}, Requested: ${newQuantity}`,
            { duration: 5000 }
          )
          return prevCart
        }
        mutated = true
        return prevCart.map((item) =>
          item.productVariantId === variant.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      }
      mutated = true
      return [
        ...prevCart,
        {
          productVariantId: variant.id,
          productId: product.id,
          title: lineTitle,
          code: product.code,
          price: variant.price,
          stock: variant.stock,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ]
    })
    if (mutated) {
      if (options?.fromInvoiceSearch) {
        setInvoiceProductSearchQuery("")
        setInvoiceSearchOpen(false)
      }
      toast.success(`${lineTitle} added to cart`)
    }
  }

  const handleInvoiceSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    if (debouncedInvoiceSearch.trim().length < 2 || loadingInvoiceSearch) return
    if (invoiceSearchProducts.length === 0) return
    e.preventDefault()
    addToCart(invoiceSearchProducts[0], { fromInvoiceSearch: true })
  }

  const setCartLineQuantity = (productVariantId: number, value: number) => {
    const n = Math.floor(Math.abs(value)) || 0
    if (n <= 0) {
      setCart((prev) => prev.filter((i) => i.productVariantId !== productVariantId))
      return
    }
    setCart((prev) => {
      const item = prev.find((i) => i.productVariantId === productVariantId)
      if (!item) return prev
      const max = item.stock ?? 0
      if (n > max) {
        toast.error(
          `Insufficient stock for ${item.title}. Available: ${max}, Requested: ${n}`,
          { duration: 5000 }
        )
        return prev.map((i) =>
          i.productVariantId === productVariantId ? { ...i, quantity: max } : i
        )
      }
      return prev.map((i) =>
        i.productVariantId === productVariantId ? { ...i, quantity: n } : i
      )
    })
  }

  const setCartLinePrice = (productVariantId: number, value: number) => {
    const p = Number(value)
    if (!Number.isFinite(p) || p < 0) return
    setCart((prev) =>
      prev.map((i) => (i.productVariantId === productVariantId ? { ...i, price: p } : i))
    )
  }

  // Update cart item quantity
  const updateQuantity = (productVariantId: number, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.productVariantId === productVariantId)
      if (!item) return prevCart

      const newQuantity = item.quantity + delta
      if (newQuantity <= 0) {
        return prevCart.filter((i) => i.productVariantId !== productVariantId)
      }

      const availableStock = item.stock ?? 0
      if (newQuantity > availableStock) {
        toast.error(
          `Insufficient stock for ${item.title}. Available: ${availableStock}, Requested: ${newQuantity}`,
          { duration: 5000 }
        )
        return prevCart
      }

      return prevCart.map((i) =>
        i.productVariantId === productVariantId ? { ...i, quantity: newQuantity } : i
      )
    })
  }

  const removeFromCart = (productVariantId: number) => {
    setCart((prevCart) => prevCart.filter((i) => i.productVariantId !== productVariantId))
  }

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const tax = subtotal * 0.05 // 5% tax
  const finalAmount = subtotal + tax - discount

  // Open drawer when Create Order is clicked
  const handleCreateOrderClick = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }
    setIsDrawerOpen(true)
  }

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    setIsConfirmModalOpen(false)
    setIsCreatingSale(true)
    
    try {
      // Import sale API
      const { saleAPI } = await import("@/lib/api/sale")
      
      const saleData = {
        customerId: null, // Optional
        totalAmount: subtotal,
        discount: discount,
        tax: tax,
        finalAmount: finalAmount,
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      }

      await saleAPI.createSale(saleData)
      toast.success("Sale created successfully!")
      setCart([])
      setDiscount(0)
      setIsDrawerOpen(false)
    } catch (error: any) {
      console.error("Failed to create sale:", error)
      
      // Extract error message
      let errorMessage = "Failed to create sale. Please try again."
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      // Check for stock-related errors
      if (errorMessage.toLowerCase().includes("insufficient stock")) {
        toast.error(errorMessage, { duration: 5000 })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsCreatingSale(false)
    }
  }

  const categoryFilterRow = (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => setSelectedCategory(null)}
        size="sm"
        className="h-10 px-3"
      >
        All
      </Button>
      {loadingCategories ? (
        <div className="text-sm text-muted-foreground">Loading categories...</div>
      ) : (
        categories.map((category) => {
          const categoryImage =
            category.assets && category.assets.length > 0 ? category.assets[0].url : null
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
              className="flex h-10 items-center gap-2 px-3"
            >
              {categoryImage && (
                <img
                  src={categoryImage}
                  alt={category.title}
                  className="h-5 w-5 rounded object-cover"
                />
              )}
              {category.title}
            </Button>
          )
        })
      )}
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New sale</h1>
          <p className="text-sm text-muted-foreground">
            {layoutMode === "pos"
              ? "POS — browse the grid and build the cart."
              : "Invoice — search products and edit lines in a table."}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
          <LayoutGrid className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <Label
            htmlFor="sale-layout-mode"
            className={cn(
              "cursor-pointer text-sm",
              layoutMode === "pos" ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            POS
          </Label>
          <Switch
            id="sale-layout-mode"
            checked={layoutMode === "invoice"}
            onCheckedChange={(on) => setLayoutMode(on ? "invoice" : "pos")}
            aria-label="Switch between POS and invoice layout"
          />
          <Table2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span
            className={cn(
              "text-sm",
              layoutMode === "invoice" ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            Invoice
          </span>
        </div>
      </div>

      {layoutMode === "pos" ? (
        <div className="flex min-h-0 flex-1 gap-4">
      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-10"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-4">{categoryFilterRow}</div>

        {/* Products Grid */}
        <ScrollArea className="flex-1" orientation="vertical">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <ShoppingCart className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const primary = pickPrimaryVariant(product)
                const displayPrice = primary?.price ?? product.price
                const displayStock = primary?.stock ?? product.stock ?? 0
                return (
                  <Card
                    key={product.id}
                    className="group cursor-pointer overflow-hidden border border-border/50 transition-colors hover:border-primary/50"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted/30">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-4xl text-muted-foreground">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 bg-primary opacity-0 transition-opacity hover:bg-primary/90 group-hover:opacity-100"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="mb-1 truncate text-sm font-semibold">{product.title}</h3>
                      <p className="text-base font-bold text-primary">
                        ${displayPrice.toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Stock: {displayStock}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Side Cart Panel */}
      <ResizablePanel
        defaultWidth={400}
        minWidth={300}
        maxWidth={600}
        side="right"
        className="flex flex-col border-l bg-background h-full"
        storageKey="pos-cart-width"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Cart</h2>
            <p className="text-sm text-muted-foreground">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
          </div>

          <ScrollArea className="flex-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {cart.map((item) => (
                  <div
                    key={item.productVariantId}
                    className="flex gap-3 items-start p-3 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div className="relative w-14 h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productVariantId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productVariantId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 mt-1 text-destructive"
                        onClick={() => removeFromCart(item.productVariantId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (5%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Discount:</span>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="h-8 w-24"
                    min="0"
                    step="0.01"
                  />
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Amount:</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateOrderClick}
                disabled={cart.length === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </div>
          )}
        </div>
      </ResizablePanel>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-background">
            <div className="shrink-0 space-y-3 border-b border-border/60 p-4">
              {categoryFilterRow}
            </div>
            <div className="shrink-0 border-b border-border/60 px-4 py-4 sm:px-5 sm:py-5">
              <CompactField label="Add products" htmlFor="invoiceProductSearch">
                <p className="-mt-1 mb-2 text-xs text-muted-foreground">
                  Waits {PRODUCT_SEARCH_DEBOUNCE_MS / 1000}s after you stop typing, then searches. With
                  results open, press{" "}
                  <kbd className="rounded-none border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
                    Enter
                  </kbd>{" "}
                  to add the first match.
                </p>
                <Popover
                  open={invoiceSearchOpen}
                  onOpenChange={(open) => {
                    if (!open) setInvoiceSearchOpen(false)
                  }}
                >
                  <PopoverTrigger asChild>
                    <div className="relative rounded-none ring-offset-background transition-shadow focus-within:ring-2 focus-within:ring-ring/30 focus-within:ring-offset-2">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <CompactInput
                        id="invoiceProductSearch"
                        value={invoiceProductSearchQuery}
                        onChange={(e) => setInvoiceProductSearchQuery(e.target.value)}
                        onKeyDown={handleInvoiceSearchKeyDown}
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
                        {loadingInvoiceSearch ? (
                          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                            <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                            Searching…
                          </div>
                        ) : (
                          <CommandGroup className="divide-y divide-border p-0">
                            {invoiceSearchProducts.map((product) => {
                              const img = product.imageUrl?.trim() || ""
                              const primary = pickPrimaryVariant(product)
                              const displayPrice = primary?.price ?? product.price
                              const displayStock = primary?.stock ?? product.stock ?? 0
                              return (
                                <CommandItem
                                  key={product.id}
                                  value={product.id.toString()}
                                  onSelect={() => addToCart(product, { fromInvoiceSearch: true })}
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
                                        {product.code} · {formatMoney(displayPrice)} · stock{" "}
                                        {displayStock}
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
                {invoiceProductSearchQuery.trim().length >= 2 &&
                debouncedInvoiceSearch.trim().length >= 2 &&
                invoiceProductSearchQuery.trim() === debouncedInvoiceSearch.trim() &&
                !loadingInvoiceSearch &&
                invoiceSearchProducts.length === 0 ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    No matching products — try another term or category.
                  </p>
                ) : null}
              </CompactField>
            </div>

            <ScrollArea className="min-h-0 flex-1">
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
                    <th className="w-32 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Line total
                    </th>
                    <th className="w-12 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {""}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-14">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-muted text-muted-foreground">
                            <Inbox className="h-6 w-6" aria-hidden />
                          </div>
                          <p className="text-sm font-medium text-foreground">No line items yet</p>
                          <p className="max-w-xs text-xs text-muted-foreground">
                            Use the search field above to add products to this sale.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, rowIndex) => {
                      const lineTotal = item.price * item.quantity
                      return (
                        <tr
                          key={item.productVariantId}
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
                                {item.title}
                              </span>
                              <span className="truncate font-mono text-xs text-muted-foreground">
                                {item.code ?? "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <CompactInput
                              type="number"
                              min={1}
                              step={1}
                              value={item.quantity}
                              onChange={(e) =>
                                setCartLineQuantity(
                                  item.productVariantId,
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="ms-auto w-full min-w-[4.5rem] text-right font-mono text-sm tabular-nums"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <CompactInput
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.price}
                              onChange={(e) =>
                                setCartLinePrice(
                                  item.productVariantId,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="ms-auto w-full min-w-[5.5rem] text-right font-mono text-sm tabular-nums"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="font-mono text-sm tabular-nums text-foreground">
                              {formatMoney(lineTotal)}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.productVariantId)}
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
            </ScrollArea>
          </div>

          <SummaryPanel className="top-0 lg:sticky">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
              <p className="text-xs text-muted-foreground">
                {cart.length} line{cart.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-3 rounded-none border border-border/60 bg-muted/25 p-3">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatMoney(subtotal)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatMoney(tax)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Discount</span>
                <CompactInput
                  type="number"
                  min={0}
                  step={0.01}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-28 text-right font-mono text-sm tabular-nums"
                />
              </div>
              <div className="mt-1 rounded-none border border-primary/20 bg-primary/5 px-3 py-3">
                <div className="flex justify-between gap-3 text-sm font-semibold text-foreground">
                  <span>Final amount</span>
                  <span className="font-mono text-base tabular-nums text-primary">
                    {formatMoney(finalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="h-10 w-full rounded-none text-sm font-semibold shadow-sm"
              size="lg"
              onClick={handleCreateOrderClick}
              disabled={cart.length === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create order
            </Button>
          </SummaryPanel>
        </div>
      )}

      {/* Right Side Drawer - Order Confirmation */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Confirm Order</SheetTitle>
            <SheetDescription>
              Review your order summary before confirming
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-8rem)] mt-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Your cart is empty.</p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-4">
                    <div>
                      <h3 className="font-semibold mb-3">Order Items ({cart.length})</h3>
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div
                            key={item.productVariantId}
                            className="flex justify-between items-center p-2 rounded border border-border/50 bg-muted/20"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold text-sm ml-2">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="border-t pt-4 space-y-4 mt-auto">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (5%):</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium">${discount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Final Amount:</span>
                      <span>${finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsConfirmModalOpen(true)}
                    disabled={cart.length === 0 || isCreatingSale}
                  >
                    {isCreatingSale ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Please review the order summary before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span>${discount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Final Amount:</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOrder} disabled={isCreatingSale}>
              {isCreatingSale ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
