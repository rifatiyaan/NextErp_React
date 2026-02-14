import { fetchAPI } from "@/lib/api/client"

export interface SaleItemRequest {
  productId: number
  quantity: number
  price: number
  subtotal: number
}

export interface CreateSaleRequest {
  customerId?: string | null
  totalAmount: number
  discount: number
  tax: number
  finalAmount: number
  paymentMethod?: string
  items: SaleItemRequest[]
}

export interface Sale {
  id: string
  customerId?: string | null
  totalAmount: number
  discount: number
  tax: number
  finalAmount: number
  paymentMethod?: string
  createdAt: string
  items: Array<{
    id: string
    productId: number
    productTitle: string
    quantity: number
    price: number
    subtotal: number
  }>
}

export const saleAPI = {
  /**
   * Create a new sale
   */
  async createSale(data: CreateSaleRequest): Promise<Sale> {
    return fetchAPI<Sale>("/api/Sale", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Get sale by ID
   */
  async getSale(id: string): Promise<Sale> {
    return fetchAPI<Sale>(`/api/Sale/${id}`)
  },

  /**
   * Get paginated sales
   */
  async getSales(
    pageIndex: number = 1,
    pageSize: number = 10,
    searchText?: string,
    sortBy?: string
  ) {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    })
    if (searchText) params.append("searchText", searchText)
    if (sortBy) params.append("sortBy", sortBy)

    return fetchAPI<{
      total: number
      totalDisplay: number
      data: Sale[]
    }>(`/api/Sale?${params.toString()}`)
  },
}

