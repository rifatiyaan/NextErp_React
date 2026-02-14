"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, Plus, ShoppingCart, Minus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { productAPI } from "@/lib/api/product"
import { categoryAPI } from "@/lib/api/category"
import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import { toast } from "sonner"
import Image from "next/image"
import { Package } from "lucide-react"
import { ResizablePanel } from "@/components/ui/resizable-panel"
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

interface CartItem extends Product {
  quantity: number
}

export default function CreateSalesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isCreatingSale, setIsCreatingSale] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")

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

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProducts(
        1,
        1000, // Large page size for POS
        searchQuery || undefined,
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
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300) // Debounce search

    return () => clearTimeout(timer)
  }, [fetchProducts])

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
    toast.success(`${product.title} added to cart`)
  }

  // Update cart item quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.id === productId)
      if (!item) return prevCart

      const newQuantity = item.quantity + delta
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== productId)
      }

      return prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    })
  }

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
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
        items: cart.map(item => ({
          productId: item.id,
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
    } catch (error) {
      console.error("Failed to create sale:", error)
      toast.error("Failed to create sale. Please try again.")
    } finally {
      setIsCreatingSale(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-3">POS System</h1>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
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
              const categoryImage = category.assets && category.assets.length > 0 ? category.assets[0].url : null
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                  className="h-10 px-3 flex items-center gap-2"
                >
                  {categoryImage && (
                    <img
                      src={categoryImage}
                      alt={category.title}
                      className="w-5 h-5 object-cover rounded"
                    />
                  )}
                  {category.title}
                </Button>
              )
            })
          )}
        </div>

        {/* Products Grid */}
        <ScrollArea className="flex-1" orientation="vertical">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden cursor-pointer group border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-4xl text-muted-foreground">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <Button
                      size="icon"
                      className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-1 truncate">{product.title}</h3>
                    <p className="text-base font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.stock !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Stock: {product.stock}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart Button - Fixed position */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="h-14 px-6 shadow-lg"
            onClick={handleCreateOrderClick}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Create Order ({cart.length})
            <span className="ml-2 font-bold">${finalAmount.toFixed(2)}</span>
          </Button>
        </div>
      )}

      {/* Left Side Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
            <SheetDescription>
              Review your order before confirming
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Cart Items */}
            <ScrollArea className="flex-1 mt-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start p-3 rounded-lg border border-border/50 bg-muted/20">
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
                        <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
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
                            onClick={() => updateQuantity(item.id, 1)}
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
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Order Summary */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-4">
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
