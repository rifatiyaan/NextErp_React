import {
    MutationCache,
    QueryCache,
    QueryClient,
    type DefaultOptions,
    type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { APIError } from "@/lib/api/client"

export interface QueryMeta {
    silent?: boolean
    errorMessage?: string
}

export interface MutationMeta {
    silent?: boolean
    successMessage?: string
    errorMessage?: string
    invalidates?: ReadonlyArray<QueryKey>
}

const asQueryMeta = (meta: unknown): QueryMeta => (meta ?? {}) as QueryMeta
const asMutationMeta = (meta: unknown): MutationMeta => (meta ?? {}) as MutationMeta

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
