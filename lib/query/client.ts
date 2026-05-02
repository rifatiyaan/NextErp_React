import {
    MutationCache,
    QueryCache,
    QueryClient,
    type DefaultOptions,
    type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { APIError } from "@/lib/api/client"

/**
 * Typed shape of the `meta` field passed to `useQuery({ meta: ... })`. The
 * QueryCache global `onError` reads these flags to decide whether to toast.
 */
export interface QueryMeta {
    /** Suppress the global error toast for this query. */
    silent?: boolean
    /** Override the toast message text on error. */
    errorMessage?: string
}

/**
 * Typed shape of the `meta` field for mutations. Read by the MutationCache
 * global handlers to drive declarative success/error toasts and cache
 * invalidation — callers never write try/catch.
 */
export interface MutationMeta {
    /** Suppress global error/success toasts for this mutation. */
    silent?: boolean
    /** Toast text on success. Omit to suppress success toast. */
    successMessage?: string
    /** Override the toast message on error. Omit to use APIError.message. */
    errorMessage?: string
    /**
     * Cache keys to invalidate after a successful mutation. Each key is matched
     * with prefix semantics, so passing `queryKeys.products.all` invalidates list
     * + detail + filtered queries for that entity.
     */
    invalidates?: ReadonlyArray<QueryKey>
}

const asQueryMeta = (meta: unknown): QueryMeta => (meta ?? {}) as QueryMeta
const asMutationMeta = (meta: unknown): MutationMeta => (meta ?? {}) as MutationMeta

/**
 * Format any thrown value into a user-facing message.
 * For HTTP 422, return null — the form layer renders field errors directly,
 * so we suppress the generic toast.
 */
function formatErrorForToast(error: unknown): string | null {
    if (error instanceof APIError) {
        if (error.isValidation) return null
        if (error.status === 0) return "Network error — could not reach the server."
        if (error.status === 401) return "Session expired. Please sign in again."
        if (error.status === 403) return "You do not have permission to do that."
        return error.message || "Something went wrong."
    }
    if (error instanceof Error) return error.message
    return "Something went wrong."
}

/**
 * Default query/mutation options applied across the app.
 *
 * Tuning rationale:
 * - `staleTime: 5min`  — most lookup data (categories, UoM, variation options) rarely
 *   changes within a session. 5 min keeps repeat form mounts instant without surprising
 *   the user with very stale data. Override per-query for fast-moving entities.
 * - `gcTime: 10min`    — keep cache alive 10 min after no observers, so back-navigation
 *   does not refetch.
 * - `refetchOnWindowFocus: false` — too aggressive for a B2B ERP; users alt-tab a lot.
 * - `retry: 1`         — single retry on transient network errors. Server-validation
 *   errors (4xx) should NOT be retried; we surface them via APIError.
 */
const queryDefaults: DefaultOptions = {
    queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            const status = (error as { status?: number })?.status
            if (status && status >= 400 && status < 500) return false
            return failureCount < 1
        },
    },
    mutations: {
        retry: false,
    },
}

/**
 * Build the QueryClient, wiring global QueryCache + MutationCache handlers so
 * components no longer need ad-hoc try/catch around server calls. Behaviour is
 * declared via the typed `meta` field on each query/mutation.
 */
export function createQueryClient(): QueryClient {
    const client: QueryClient = new QueryClient({
        defaultOptions: queryDefaults,
        queryCache: new QueryCache({
            onError: (error, query) => {
                const meta = asQueryMeta(query.meta)
                if (meta.silent) return
                const text = meta.errorMessage ?? formatErrorForToast(error)
                if (text) toast.error(text)
            },
        }),
        mutationCache: new MutationCache({
            onError: (error, _vars, _ctx, mutation) => {
                const meta = asMutationMeta(mutation.meta)
                if (meta.silent) return
                const text = meta.errorMessage ?? formatErrorForToast(error)
                if (text) toast.error(text)
            },
            onSuccess: (_data, _vars, _ctx, mutation) => {
                const meta = asMutationMeta(mutation.meta)
                if (!meta.silent && meta.successMessage) {
                    toast.success(meta.successMessage)
                }
            },
            onSettled: (_data, error, _vars, _ctx, mutation) => {
                // Auto-invalidate on success only — failed mutations leave cache untouched.
                if (error) return
                const invalidates = asMutationMeta(mutation.meta).invalidates
                if (!invalidates || invalidates.length === 0) return
                for (const key of invalidates) {
                    void client.invalidateQueries({ queryKey: key })
                }
            },
        }),
    })
    return client
}
