"use client"

import { useState, useMemo } from "react"
import { Search, Plus, ShoppingCart, Minus, X, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { mockProducts, categories, type Product, type CartItem } from "@/data/pos-mock-data"

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])

  // Filter products based on category and search
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

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
  }

  // Update cart item quantity
  const updateQuantity = (productId: string, delta: number) => {
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
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + tax

  // Create order
  const handleCreateOrder = () => {
    if (cart.length === 0) return
    // TODO: Integrate with API later
    console.log("Creating order:", cart)
    alert(`Order created! Total: $${total.toFixed(2)}`)
    setCart([])
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">POS System</h1>
          <div className="flex gap-2 flex-wrap">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline">
              <Table className="mr-2 h-4 w-4" />
              Tables
            </Button>
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <span>{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <ScrollArea className="flex-1" orientation="vertical">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                  <span className="text-6xl transition-transform group-hover:scale-110">{product.emoji}</span>
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                  <p className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Shopping Cart Sidebar */}
      <div className="w-96 border-l bg-background flex flex-col flex-shrink-0">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Your Cart
          </h2>
        </div>

        <ScrollArea className="flex-1" orientation="vertical">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="relative w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{item.emoji}</span>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
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
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <>
            <Separator />
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (5%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleCreateOrder}
              >
                Create Order
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

