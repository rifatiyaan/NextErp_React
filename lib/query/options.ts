import { queryOptions } from "@tanstack/react-query"
import { authAPI } from "@/lib/api/auth"
import { branchAPI } from "@/lib/api/branch"
import { categoryAPI } from "@/lib/api/category"
import { customerAPI } from "@/lib/api/customer"
import { identityAPI } from "@/lib/api/identity"
import { moduleAPI } from "@/lib/api/module"
import { paymentAPI } from "@/lib/api/payment"
import { productAPI } from "@/lib/api/product"
import { purchaseAPI, type PurchaseListFilters } from "@/lib/api/purchase"
import { saleAPI } from "@/lib/api/sale"
import { stockAPI } from "@/lib/api/stock"
import { supplierAPI } from "@/lib/api/supplier"
import { systemSettingsAPI } from "@/lib/api/system-settings"
import { unitOfMeasureAPI } from "@/lib/api/unit-of-measure"
import { variationAPI } from "@/lib/api/variation"
import { queryKeys } from "./keys"


// ---------------- Categories ----------------
export interface CategoryListFilters {
    pageIndex: number
    pageSize: number
    searchText?: string
    sortBy?: string
}

export const categoryQueries = {
    all: () =>
        queryOptions({
            queryKey: queryKeys.categories.lists(),
            queryFn: ({ signal }) => categoryAPI.getAllCategories(signal),
        }),
    list: (filters: CategoryListFilters) =>
        queryOptions({
            queryKey: queryKeys.categories.list(filters),
            queryFn: ({ signal }) =>
                categoryAPI.getCategories(
                    filters.pageIndex,
                    filters.pageSize,
                    filters.searchText,
                    filters.sortBy,
                    signal,
                ),
        }),
    detail: (id: number | string) =>
        queryOptions({
            queryKey: queryKeys.categories.detail(id),
            queryFn: ({ signal }) => categoryAPI.getCategory(id, signal),
            enabled: !!id,
        }),
} as const

// ---------------- Units of Measure ----------------
export const unitOfMeasureQueries = {
    all: () =>
        queryOptions({
            queryKey: queryKeys.unitsOfMeasure.list(),
            queryFn: ({ signal }) => unitOfMeasureAPI.getAll(signal),
        }),
    detail: (id: number) =>
        queryOptions({
            queryKey: queryKeys.unitsOfMeasure.detail(id),
            queryFn: ({ signal }) => unitOfMeasureAPI.getById(id, signal),
            enabled: !!id,
        }),
} as const

// ---------------- Variation Options ----------------
export const variationQueries = {
    bulkOptions: () =>
        queryOptions({
            queryKey: queryKeys.variationOptions.bulk(),
            queryFn: ({ signal }) => variationAPI.getBulkOptions(signal),
            // Variation options are very static — extend stale time beyond the global default.
            staleTime: 30 * 60 * 1000,
        }),
    options: () =>
        queryOptions({
            queryKey: queryKeys.variationOptions.options(),
            queryFn: ({ signal }) => variationAPI.getOptions(signal),
            staleTime: 30 * 60 * 1000,
        }),
    byProduct: (productId: number) =>
        queryOptions({
            queryKey: queryKeys.variationOptions.byProduct(productId),
            queryFn: ({ signal }) => variationAPI.getOptionsByProduct(productId, signal),
            enabled: !!productId,
        }),
} as const

// ---------------- Products ----------------
export interface ProductListFilters {
    pageIndex: number
    pageSize: number
    searchText?: string
    sortBy?: string
    categoryId?: number | null
    status?: string | null
    includeStock?: boolean
}

export const productQueries = {
    list: (filters: ProductListFilters) =>
        queryOptions({
            queryKey: queryKeys.products.list(filters),
            queryFn: ({ signal }) =>
                productAPI.getProducts(
                    filters.pageIndex,
                    filters.pageSize,
                    filters.searchText,
                    filters.sortBy,
                    filters.categoryId,
                    filters.status,
                    filters.includeStock,
                    signal,
                ),
        }),
    detail: (id: number | string) =>
        queryOptions({
            queryKey: queryKeys.products.detail(id),
            queryFn: ({ signal }) => productAPI.getProduct(id, signal),
            enabled: !!id,
        }),
} as const

// ---------------- Customers ----------------
export interface CustomerListFilters {
    pageIndex: number
    pageSize: number
    searchText?: string
    sortBy?: string
}

export const customerQueries = {
    list: (filters: CustomerListFilters) =>
        queryOptions({
            queryKey: queryKeys.customers.list(filters),
            queryFn: ({ signal }) =>
                customerAPI.getCustomers(
                    filters.pageIndex,
                    filters.pageSize,
                    filters.searchText,
                    filters.sortBy,
                    signal,
                ),
        }),
    detail: (id: string) =>
        queryOptions({
            queryKey: queryKeys.customers.detail(id),
            queryFn: ({ signal }) => customerAPI.getCustomerById(id, signal),
            enabled: !!id,
        }),
} as const

// ---------------- Suppliers ----------------
export interface SupplierListFilters {
    pageIndex: number
    pageSize: number
    searchText?: string
    sortBy?: string
}

export const supplierQueries = {
    list: (filters: SupplierListFilters) =>
        queryOptions({
            queryKey: queryKeys.suppliers.list(filters),
            queryFn: ({ signal }) =>
                supplierAPI.getSuppliers(
                    filters.pageIndex,
                    filters.pageSize,
                    filters.searchText,
                    filters.sortBy,
                    signal,
                ),
        }),
    detail: (id: string) =>
        queryOptions({
            queryKey: queryKeys.suppliers.detail(id),
            queryFn: ({ signal }) => supplierAPI.getSupplierById(id, signal),
            enabled: !!id,
        }),
} as const

// ---------------- Branches ----------------
export const branchQueries = {
    all: () =>
        queryOptions({
            queryKey: queryKeys.branches.lists(),
            queryFn: ({ signal }) => branchAPI.getBranches(signal),
        }),
    detail: (id: string) =>
        queryOptions({
            queryKey: queryKeys.branches.detail(id),
            queryFn: ({ signal }) => branchAPI.getBranchById(id, signal),
            enabled: !!id,
        }),
} as const

// ---------------- Modules ----------------
export interface ModuleListFilters {
    tenantId?: string
    type?: number
}

export const moduleQueries = {
    userMenu: () =>
        queryOptions({
            queryKey: queryKeys.modules.userMenu(),
            queryFn: ({ signal }) => moduleAPI.getUserMenu(signal),
        }),
    list: (filters: ModuleListFilters = {}) =>
        queryOptions({
            queryKey: queryKeys.modules.list(filters),
            queryFn: ({ signal }) =>
                filters.type != null
                    ? moduleAPI.getModulesByType(filters.type, filters.tenantId, signal)
                    : moduleAPI.getAllModules(filters.tenantId, signal),
        }),
    detail: (id: number) =>
        queryOptions({
            queryKey: queryKeys.modules.detail(id),
            queryFn: ({ signal }) => moduleAPI.getModuleById(id, signal),
            enabled: !!id,
        }),
} as const

// ---------------- Sales ----------------
export interface SaleListFilters {
    pageIndex: number
    pageSize: number
    searchText?: string
    sortBy?: string
}

export interface SalesReportFilters {
    startDate: string
    endDate: string
    customerId?: string | null
}

export const saleQueries = {
    list: (filters: SaleListFilters) =>
        queryOptions({
            queryKey: queryKeys.sales.list(filters),
            queryFn: ({ signal }) =>
                saleAPI.getSales(
                    filters.pageIndex,
                    filters.pageSize,
                    filters.searchText,
                    filters.sortBy,
                    signal,
                ),
        }),
    detail: (id: string | undefined) =>
        queryOptions({
            queryKey: queryKeys.sales.detail(id ?? ""),
            queryFn: ({ signal }) => saleAPI.getSaleById(id as string, signal),
            enabled: !!id,
        }),
    report: (filters: SalesReportFilters) =>
        queryOptions({
            queryKey: queryKeys.sales.report(filters),
            queryFn: ({ signal }) =>
                saleAPI.getSalesReport(filters.startDate, filters.endDate, filters.customerId, signal),
            enabled: !!filters.startDate && !!filters.endDate,
        }),
} as const

// ---------------- Purchases ----------------
export interface PurchaseListFiltersExt {
    pageIndex: number
    pageSize: number
    searchText?: string
    sortBy?: string
    filters?: PurchaseListFilters
}

export interface PurchasesReportFilters {
    startDate: string
    endDate: string
    supplierId?: number | null
}

export const purchaseQueries = {
    list: (filters: PurchaseListFiltersExt) =>
        queryOptions({
            queryKey: queryKeys.purchases.list(filters),
            queryFn: ({ signal }) =>
                purchaseAPI.getPurchases(
                    filters.pageIndex,
                    filters.pageSize,
                    filters.searchText,
                    filters.sortBy,
                    filters.filters,
                    signal,
                ),
        }),
    detail: (id: string | undefined) =>
        queryOptions({
            queryKey: queryKeys.purchases.detail(id ?? ""),
            queryFn: ({ signal }) => purchaseAPI.getPurchaseById(id as string, signal),
            enabled: !!id,
        }),
    report: (filters: PurchasesReportFilters) =>
        queryOptions({
            queryKey: queryKeys.purchases.report(filters),
            queryFn: ({ signal }) =>
                purchaseAPI.getReport(filters.startDate, filters.endDate, filters.supplierId, signal),
            enabled: !!filters.startDate && !!filters.endDate,
        }),
} as const

// ---------------- Payments ----------------
export const paymentQueries = {
    bySale: (saleId: string | undefined) =>
        queryOptions({
            queryKey: queryKeys.payments.bySale(saleId ?? ""),
            queryFn: ({ signal }) => paymentAPI.listBySaleId(saleId as string, signal),
            enabled: !!saleId,
        }),
} as const

// ---------------- Stock ----------------
export interface StockAdjustmentsFilters {
    productVariantId?: number
    pageIndex?: number
    pageSize?: number
}

export const stockQueries = {
    current: () =>
        queryOptions({
            queryKey: queryKeys.stock.current(),
            queryFn: ({ signal }) => stockAPI.getCurrentStockReport(signal),
        }),
    low: () =>
        queryOptions({
            queryKey: queryKeys.stock.low(),
            queryFn: ({ signal }) => stockAPI.getLowStockReport(signal),
        }),
    adjustments: (filters: StockAdjustmentsFilters) =>
        queryOptions({
            queryKey: queryKeys.stock.adjustments(filters),
            queryFn: ({ signal }) => stockAPI.getAdjustmentHistory(filters, signal),
        }),
    adjustmentReasons: () =>
        queryOptions({
            queryKey: queryKeys.stock.adjustmentReasons(),
            queryFn: ({ signal }) => stockAPI.getAdjustmentReasons(signal),
            staleTime: 30 * 60 * 1000,
        }),
} as const

// ---------------- Identity ----------------
export const identityQueries = {
    dashboard: () =>
        queryOptions({
            queryKey: queryKeys.identity.dashboard(),
            queryFn: ({ signal }) => identityAPI.getDashboard(signal),
        }),
} as const

// ---------------- Auth ----------------
export const authQueries = {
    me: () =>
        queryOptions({
            queryKey: queryKeys.auth.me(),
            queryFn: ({ signal }) => authAPI.me(signal),
        }),
} as const

// ---------------- System Settings ----------------
export const systemSettingsQueries = {
    current: () =>
        queryOptions({
            queryKey: queryKeys.systemSettings.current(),
            queryFn: ({ signal }) => systemSettingsAPI.get(signal),
            staleTime: 15 * 60 * 1000,
        }),
} as const
