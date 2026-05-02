"use client"

import { useState, type ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createQueryClient } from "@/lib/query/client"

/**
 * App-wide TanStack Query provider. The QueryClient is held in component state so
 * that React Strict Mode + HMR cannot tear down and recreate it between renders.
 * The component itself owns disposal: when it unmounts (only on full app teardown),
 * React garbage-collects the client.
 *
 * Devtools render only in development. They do not ship to production bundles
 * (Next.js tree-shakes them out via `process.env.NODE_ENV`).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => createQueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            )}
        </QueryClientProvider>
    )
}
