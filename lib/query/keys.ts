/**
 * Query key factory — single source of truth for all TanStack Query cache keys.
 *
 * Pattern (Tkdodo's "Query Key Factories"):
 *   queryKeys.{entity}.{action}(params?) -> readonly array
 *
 * Why a factory and not loose strings?
 * - **Type safety**: misspelt keys are caught at compile time, not after a stale-cache bug
 *   ships to production.
 * - **Hierarchical invalidation**: `queryClient.invalidateQueries({ queryKey: queryKeys.products.all })`
 *   invalidates every products-* query (list, by id, by filter) in one call. Sub-keys are
 *   prefixed with their parent's key, so partial-match invalidation is automatic.
 * - **Refactoring**: rename a key in one place, every consumer updates.
 *
 * Conventions:
 * - All keys are `as const` so TS infers literal-tuple types.
 * - `all`     — the entity root (most general, invalidates everything for the entity)
 * - `lists()` — sub-root for list/paged queries
 * - `list(filters)` — concrete list with filter tuple
 * - `details()` / `detail(id)` — same for entity-by-id
 */
export const queryKeys = {
    categories: {
        all: ["categories"] as const,
        lists: () => [...queryKeys.categories.all, "list"] as const,
        list: (filters: object) =>
            [...queryKeys.categories.lists(), filters] as const,
        details: () => [...queryKeys.categories.all, "detail"] as const,
        detail: (id: number | string) => [...queryKeys.categories.details(), id] as const,
    },
    unitsOfMeasure: {
        all: ["unitsOfMeasure"] as const,
        list: () => [...queryKeys.unitsOfMeasure.all, "list"] as const,
        detail: (id: number) => [...queryKeys.unitsOfMeasure.all, "detail", id] as const,
    },
    variationOptions: {
        all: ["variationOptions"] as const,
        bulk: () => [...queryKeys.variationOptions.all, "bulk"] as const,
        options: () => [...queryKeys.variationOptions.all, "options"] as const,
        byProduct: (productId: number) =>
            [...queryKeys.variationOptions.all, "by-product", productId] as const,
    },
    products: {
        all: ["products"] as const,
        lists: () => [...queryKeys.products.all, "list"] as const,
        list: (filters: object) =>
            [...queryKeys.products.lists(), filters] as const,
        details: () => [...queryKeys.products.all, "detail"] as const,
        detail: (id: number | string) => [...queryKeys.products.details(), id] as const,
    },
    customers: {
        all: ["customers"] as const,
        lists: () => [...queryKeys.customers.all, "list"] as const,
        list: (filters: object) =>
            [...queryKeys.customers.lists(), filters] as const,
        details: () => [...queryKeys.customers.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    },
    suppliers: {
        all: ["suppliers"] as const,
        lists: () => [...queryKeys.suppliers.all, "list"] as const,
        list: (filters: object) =>
            [...queryKeys.suppliers.lists(), filters] as const,
        details: () => [...queryKeys.suppliers.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.suppliers.details(), id] as const,
    },
    branches: {
        all: ["branches"] as const,
        lists: () => [...queryKeys.branches.all, "list"] as const,
        details: () => [...queryKeys.branches.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.branches.details(), id] as const,
    },
    modules: {
        all: ["modules"] as const,
        lists: () => [...queryKeys.modules.all, "list"] as const,
        list: (filters: object) =>
            [...queryKeys.modules.lists(), filters] as const,
        userMenu: () => [...queryKeys.modules.all, "user-menu"] as const,
        details: () => [...queryKeys.modules.all, "detail"] as const,
        detail: (id: number) => [...queryKeys.modules.details(), id] as const,
    },
    sales: {
        all: ["sales"] as const,
        lists: () => [...queryKeys.sales.all, "list"] as const,
        list: (filters: object) =>
            [...queryKeys.sales.lists(), filters] as const,
        details: () => [...queryKeys.sales.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.sales.details(), id] as const,
        report: (filters: object) =>
            [...queryKeys.sales.all, "report", filters] as const,
    },
    purchases: {
        all: ["purchases"] as const,
        lists: () => [...queryKeys.purchases.all, "list"] as const,
        list: (filters: object) =>
            [...queryKeys.purchases.lists(), filters] as const,
        details: () => [...queryKeys.purchases.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.purchases.details(), id] as const,
        report: (filters: object) =>
            [...queryKeys.purchases.all, "report", filters] as const,
    },
    payments: {
        all: ["payments"] as const,
        bySale: (saleId: string) => [...queryKeys.payments.all, "by-sale", saleId] as const,
    },
    stock: {
        all: ["stock"] as const,
        current: () => [...queryKeys.stock.all, "current"] as const,
        low: () => [...queryKeys.stock.all, "low"] as const,
        adjustments: (filters: object) =>
            [...queryKeys.stock.all, "adjustments", filters] as const,
        adjustmentReasons: () => [...queryKeys.stock.all, "adjustment-reasons"] as const,
    },
    identity: {
        all: ["identity"] as const,
        dashboard: () => [...queryKeys.identity.all, "dashboard"] as const,
    },
    auth: {
        all: ["auth"] as const,
        me: () => [...queryKeys.auth.all, "me"] as const,
    },
} as const
