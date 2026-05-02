  "use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
} from "@/components/shared/erp"
import { CategoryCombobox } from "@/components/shared/category-combobox"
import { useRadiusClass } from "@/hooks/use-radius-class"
import { tableBodyRowHoverClassName } from "@/components/ui/table"
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
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [posProductsReady, setPosProductsReady] = useState(false)
  const [posSearchPending, setPosSearchPending] = useState(false)
  const posFetchSeq = useRef(0)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isCreatingSale, setIsCreatingSale] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split("T")[0])
  const [saleInvoiceNote, setSaleInvoiceNote] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [layoutMode, setLayoutMode] = useState<SaleLayoutMode>("pos")

  const [invoiceProductSearchQuery, setInvoiceProductSearchQuery] = useState("")
  const [debouncedInvoiceSearch, setDebouncedInvoiceSearch] = useState("")
  const [invoiceSearchProducts, setInvoiceSearchProducts] = useState<Product[]>([])
  const [loadingInvoiceSearch, setLoadingInvoiceSearch] = useState(false)
  const [invoiceSearchOpen, setInvoiceSearchOpen] = useState(false)
  const invoiceSearchSeq = useRef(0)
  const radiusClass = useRadiusClass()

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
    const seq = ++posFetchSeq.current
    setPosSearchPending(true)
    try {
      const response = await productAPI.getProducts(
        1,
        1000,
        debouncedSearchQuery || undefined,
        undefined,
        selectedCategory || undefined,
        "active"
      )
      if (seq !== posFetchSeq.current) return
      setProducts(response?.data ?? [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      if (seq !== posFetchSeq.current) return
      toast.error("Failed to load products")
      setProducts([])
    } finally {
      if (seq === posFetchSeq.current) {
        setPosSearchPending(false)
        setPosProductsReady(true)
      }
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
        setLoadingInvoiceSearch(false)
        return
      }
      const seq = ++invoiceSearchSeq.current
      setLoadingInvoiceSearch(true)
      try {
        const response = await productAPI.getProducts(
          1,
          20,
          debouncedInvoiceSearch,
          undefined,
          selectedCategory || undefined,
          "active"
        )
        if (seq !== invoiceSearchSeq.current) return
        setInvoiceSearchProducts(response.data || [])
      } catch {
        if (seq !== invoiceSearchSeq.current) return
        setInvoiceSearchProducts([])
      } finally {
        if (seq === invoiceSearchSeq.current) setLoadingInvoiceSearch(false)
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
    if (q !== d) {
      setInvoiceSearchOpen(false)
      return
    }
    if (loadingInvoiceSearch) {
      setInvoiceSearchOpen(invoiceSearchProducts.length > 0)
      return
    }
    setInvoiceSearchOpen(invoiceSearchProducts.length > 0)
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

    const availableStock = variant.availableQuantity ?? 0
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
          stock: variant.availableQuantity ?? 0,
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
        paidAmount: finalAmount,
        notes: saleInvoiceNote.trim() || undefined,
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

  const posSearchCategoryRow = (
    <div className="flex w-full min-w-0 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-full min-w-0 pl-9 pr-9"
        />
        {posSearchPending ? (
          <Loader2
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>
      <CategoryCombobox
        categories={categories}
        value={selectedCategory}
        onChange={setSelectedCategory}
        loading={loadingCategories}
        triggerClassName="h-8"
        size="compact"
      />
    </div>
  )

  const layoutModeToggle = (
    <div
      className={cn(
        "flex items-center gap-3 border border-border bg-muted/30 px-3 py-2",
        radiusClass
      )}
    >
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
  )

  return (
    <>
      {layoutMode === "pos" ? (
        <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col gap-2">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">New sale</h1>
            {layoutModeToggle}
          </div>

        <div className="flex min-h-0 min-w-0 flex-1 gap-3">
      {/* Main Content Area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="mb-2 shrink-0">{posSearchCategoryRow}</div>

        {/* Products grid — native scroll so flex height resolves (Radix ScrollArea often collapses). */}
        <div className="min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden">
          {!posProductsReady && products.length === 0 ? (
            <div className="flex min-h-[12rem] items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading products…</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[12rem] flex-col items-center justify-center p-6 text-center">
              <ShoppingCart className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
              {products.map((product) => {
                const primary = pickPrimaryVariant(product)
                const displayPrice = primary?.price ?? product.price
                const displayStock = primary?.availableQuantity ?? product.totalAvailableQuantity ?? 0
                return (
                  <Card
                    key={product.id}
                    className="group cursor-pointer overflow-hidden border border-border/50 transition-colors hover:border-primary/50"
                  >
                    <div className="relative h-[4.5rem] w-full overflow-hidden bg-muted/30 sm:h-[5rem]">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 33vw, 120px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Package className="h-7 w-7" />
                        </div>
                      )}
                      <Button
                        size="icon"
                        className="absolute bottom-1 right-1 h-6 w-6 bg-primary opacity-0 transition-opacity hover:bg-primary/90 group-hover:opacity-100"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardContent className="space-y-0.5 p-2">
                      <h3 className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                        {product.title}
                      </h3>
                      <p className="text-xs font-semibold tabular-nums text-primary">
                        ${displayPrice.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        Stk {displayStock}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right cart — narrower default; list scrolls between header and totals */}
      <ResizablePanel
        defaultWidth={300}
        minWidth={260}
        maxWidth={420}
        side="right"
        className="flex min-h-0 max-h-full flex-col border-l bg-background"
        storageKey="nexterp-pos-cart-width-v2"
      >
        <div className="flex min-h-0 h-full max-h-full flex-col overflow-hidden">
          <div className="shrink-0 border-b px-3 py-2">
            <h2 className="text-sm font-semibold">
              Cart{" "}
              <span className="font-normal tabular-nums text-muted-foreground">
                ({cart.length})
              </span>
            </h2>
          </div>

          <div className="min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <ShoppingCart className="mb-2 h-9 w-9 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {cart.map((item) => (
                  <div
                    key={item.productVariantId}
                    className={cn(
                      "flex gap-2 border border-border/50 bg-muted/20 p-2",
                      radiusClass
                    )}
                  >
                    <div
                      className={cn(
                        "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-muted",
                        radiusClass
                      )}
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs font-medium leading-tight">{item.title}</h3>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        ${item.price.toFixed(2)} ea
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productVariantId, -1)}
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productVariantId, 1)}
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold tabular-nums">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="mt-0.5 h-6 w-6 text-destructive"
                        onClick={() => removeFromCart(item.productVariantId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="shrink-0 space-y-3 border-t bg-background p-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span className="font-medium tabular-nums">${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Discount</span>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="h-7 w-20 text-right text-xs tabular-nums"
                    min="0"
                    step="0.01"
                  />
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between gap-2 text-sm font-bold">
                  <span>Final</span>
                  <span className="tabular-nums">${finalAmount.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="h-9 w-full text-sm"
                onClick={handleCreateOrderClick}
                disabled={cart.length === 0}
              >
                <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                Create order
              </Button>
            </div>
          )}
        </div>
      </ResizablePanel>
        </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[1920px] px-2 py-2 sm:px-4 sm:py-3">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/15",
                  radiusClass
                )}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                New sale
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {layoutModeToggle}
              <Badge
                variant="secondary"
                className={cn("h-8 w-fit px-3 text-xs font-medium tabular-nums", radiusClass)}
              >
                {cart.length} line{cart.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              "min-w-0 overflow-hidden border border-border/80 bg-card shadow-md ring-1 ring-border/40",
              radiusClass
            )}
          >
            <div className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent px-4 py-3 sm:px-5 sm:py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CompactField label="Sale date" htmlFor="saleDate">
                  <CompactInput
                    id="saleDate"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                  />
                </CompactField>
                <CompactField label="Document" htmlFor="saleDocType">
                  <span
                    id="saleDocType"
                    className="flex h-9 items-center text-sm text-muted-foreground"
                  >
                    Invoice
                  </span>
                </CompactField>
              </div>
            </div>

            <div className="border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
              <CompactField label="Add products" htmlFor="invoiceProductSearch">
                <div className="flex w-full min-w-0 items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <Popover
                      open={invoiceSearchOpen}
                      onOpenChange={(open) => {
                        if (!open) setInvoiceSearchOpen(false)
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
                            id="invoiceProductSearch"
                            value={invoiceProductSearchQuery}
                            onChange={(e) => setInvoiceProductSearchQuery(e.target.value)}
                            onKeyDown={handleInvoiceSearchKeyDown}
                            placeholder="Search by name or SKU…"
                            className="h-8 w-full min-w-0 pl-9 pr-9"
                            autoComplete="off"
                          />
                        {loadingInvoiceSearch ? (
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
                          {loadingInvoiceSearch && invoiceSearchProducts.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                              Searching…
                            </div>
                          ) : null}
                          <CommandGroup className="divide-y divide-border p-0">
                            {invoiceSearchProducts.map((product) => {
                              const img = product.imageUrl?.trim() || ""
                              const primary = pickPrimaryVariant(product)
                              const displayPrice = primary?.price ?? product.price
                              const displayStock = primary?.availableQuantity ?? product.totalAvailableQuantity ?? 0
                              return (
                                <CommandItem
                                  key={product.id}
                                  value={product.id.toString()}
                                  onSelect={() => addToCart(product, { fromInvoiceSearch: true })}
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
                                        {product.code} · {formatMoney(displayPrice)} · stock{" "}
                                        {displayStock}
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
                    onChange={setSelectedCategory}
                    loading={loadingCategories}
                    triggerClassName="h-8"
                    size="compact"
                  />
                </div>
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
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center bg-muted text-muted-foreground",
                              radiusClass
                            )}
                          >
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
                          className={cn("align-middle", tableBodyRowHoverClassName)}
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

            <div className="border-t border-border/60 bg-muted/10 px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 lg:max-w-xl">
                  <CompactField label="Order note" htmlFor="saleInvoiceNote">
                    <Textarea
                      id="saleInvoiceNote"
                      value={saleInvoiceNote}
                      onChange={(e) => setSaleInvoiceNote(e.target.value)}
                      placeholder="Reference, customer note, internal comments…"
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
                    Totals · {cart.length} line{cart.length === 1 ? "" : "s"}
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
                          <td className="px-3 py-2 text-muted-foreground">Subtotal</td>
                          <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                            {formatMoney(subtotal)}
                          </td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="px-3 py-2 text-muted-foreground">Tax (5%)</td>
                          <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                            {formatMoney(tax)}
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
                              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                              className="ms-auto h-8 w-full min-w-0 max-w-[7.5rem] text-right font-mono text-xs tabular-nums"
                            />
                          </td>
                        </tr>
                        <tr className="bg-primary/5">
                          <td className="px-3 py-2.5 font-semibold text-foreground">
                            Final amount
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold text-primary">
                            {formatMoney(finalAmount)}
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
                      className={cn("h-10 flex-1 px-3 text-sm font-medium", radiusClass)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={cart.length === 0}
                      className={cn(
                        "h-10 flex-1 px-3 text-sm font-semibold shadow-sm",
                        radiusClass
                      )}
                      onClick={handleCreateOrderClick}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Create order
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                className={cn(
                  "h-10 w-full border border-input bg-background px-3 py-2 text-sm",
                  radiusClass
                )}
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
    </>
  )
}
