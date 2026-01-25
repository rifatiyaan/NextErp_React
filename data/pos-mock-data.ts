export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  emoji: string
}

export interface CartItem extends Product {
  quantity: number
}

export const categories = [
  { id: "all", name: "All", emoji: "🍱" },
  { id: "snack", name: "Snack", emoji: "🍟" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "hamburger", name: "Hamburger", emoji: "🍔" },
  { id: "coffee", name: "Coffee", emoji: "☕️" },
  { id: "drink", name: "Drink", emoji: "🍷" },
  { id: "pasta", name: "Pasta", emoji: "🍝" },
  { id: "sauces", name: "Sauces", emoji: "🫙" },
]

export const mockProducts: Product[] = [
  // Pizza
  { id: "1", name: "Pizza", price: 10.00, category: "pizza", image: "/api/placeholder/300/200", emoji: "🍕" },
  { id: "2", name: "Pizza", price: 12.00, category: "pizza", image: "/api/placeholder/300/200", emoji: "🍕" },
  { id: "3", name: "Pizza", price: 16.00, category: "pizza", image: "/api/placeholder/300/200", emoji: "🍕" },
  { id: "4", name: "Pizza", price: 18.00, category: "pizza", image: "/api/placeholder/300/200", emoji: "🍕" },
  
  // Burger
  { id: "5", name: "Burger", price: 18.40, category: "hamburger", image: "/api/placeholder/300/200", emoji: "🍔" },
  { id: "6", name: "Burger", price: 21.15, category: "hamburger", image: "/api/placeholder/300/200", emoji: "🍔" },
  { id: "7", name: "Burger", price: 10.15, category: "hamburger", image: "/api/placeholder/300/200", emoji: "🍔" },
  
  // Coffee
  { id: "8", name: "Coffee", price: 4.00, category: "coffee", image: "/api/placeholder/300/200", emoji: "☕️" },
  { id: "9", name: "Coffee", price: 12.00, category: "coffee", image: "/api/placeholder/300/200", emoji: "☕️" },
  { id: "10", name: "Coffee", price: 5.00, category: "coffee", image: "/api/placeholder/300/200", emoji: "☕️" },
  { id: "11", name: "Coffee", price: 6.00, category: "coffee", image: "/api/placeholder/300/200", emoji: "☕️" },
  { id: "12", name: "Coffee", price: 10.00, category: "coffee", image: "/api/placeholder/300/200", emoji: "☕️" },
  
  // Snack
  { id: "13", name: "Snack", price: 10.00, category: "snack", image: "/api/placeholder/300/200", emoji: "🍟" },
  { id: "14", name: "Snack", price: 10.00, category: "snack", image: "/api/placeholder/300/200", emoji: "🍟" },
  { id: "15", name: "Snack", price: 10.00, category: "snack", image: "/api/placeholder/300/200", emoji: "🍟" },
  { id: "16", name: "Snack", price: 10.00, category: "snack", image: "/api/placeholder/300/200", emoji: "🍟" },
  { id: "17", name: "Snack", price: 10.00, category: "snack", image: "/api/placeholder/300/200", emoji: "🍟" },
  
  // Tea
  { id: "18", name: "Tea", price: 10.00, category: "drink", image: "/api/placeholder/300/200", emoji: "🍷" },
  { id: "19", name: "Tea", price: 10.00, category: "drink", image: "/api/placeholder/300/200", emoji: "🍷" },
]

