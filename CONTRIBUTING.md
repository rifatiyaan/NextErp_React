# Contributing — NextERP frontend

Conventions for the React/Next.js client at `NextErp_React/`.

## Server state — TanStack Query

**Use TanStack Query for every server data fetch.** No direct `fetch` + `useState` + `useEffect` for API calls in new code.

### Why

- **Caching across mounts** — navigating away and back shows data instantly.
- **Automatic deduplication** — two components requesting the same data fire one request.
- **Cancellation** — unmount or route change aborts in-flight requests via `AbortSignal`.
- **Background refresh** — stale data is shown while a fresh fetch runs.
- **DevTools** — `@tanstack/react-query-devtools` (dev only) shows every query, key, and cache state.

### Architecture — three layers

```
lib/api/<entity>.ts           ← raw fetch wrappers, accept optional AbortSignal
lib/query/keys.ts             ← centralized query key factory
lib/query/options.ts          ← queryOptions(...) factories per entity
hooks/use-<feature>.ts        ← custom hooks (the only thing components import)
```

A component **never** imports from `@tanstack/react-query` directly. It imports a custom hook, which encapsulates the query.

### 1. Query key factory (`lib/query/keys.ts`)

Single source of truth for cache keys. Hierarchical so `invalidateQueries({ queryKey: queryKeys.categories.all })` invalidates everything categories-related in one call.

```typescript
export const queryKeys = {
    categories: {
        all: ["categories"] as const,
        lists: () => [...queryKeys.categories.all, "list"] as const,
        detail: (id: number) => [...queryKeys.categories.all, "detail", id] as const,
    },
} as const
```

### 2. Query options factory (`lib/query/options.ts`)

Bundles `{ queryKey, queryFn, staleTime?, ... }` per query. The `signal` from the queryFn context is forwarded to fetch — no manual cancellation logic needed.

```typescript
export const categoryQueries = {
    all: () =>
        queryOptions({
            queryKey: queryKeys.categories.lists(),
            queryFn: ({ signal }) => categoryAPI.getAllCategories(signal),
        }),
} as const
```

### 3. Custom hook (`hooks/use-<feature>.ts`)

Public API consumers see. Composes one or more queries, derives presentation-friendly fields, exposes a unified loading state.

```typescript
export function useProductFormLookups(): ProductFormLookups {
    const categoriesQuery = useQuery(categoryQueries.all())
    const unitsQuery = useQuery(unitOfMeasureQueries.all())
    const variationsQuery = useQuery(variationQueries.bulkOptions())

    return useMemo(() => ({
        parentCategories: (categoriesQuery.data ?? []).filter(c => !c.parentId && c.isActive),
        // ...
        loading: categoriesQuery.isPending || unitsQuery.isPending || variationsQuery.isPending,
    }), [/* derived deps */])
}
```

Component usage stays trivial:

```typescript
const { parentCategories, unitsOfMeasure, loading } = useProductFormLookups()
```

### Cleanup / disposal

TanStack Query handles cleanup automatically:

| Event | What happens |
|---|---|
| Component unmounts | Query subscription removed. In-flight fetch aborted via `AbortSignal`. |
| All observers gone for `gcTime` (default 10 min) | Cache entry garbage-collected. |
| Manual cancel | `queryClient.cancelQueries({ queryKey })` aborts via `AbortSignal`. |
| Mutation invalidates a key | All matching queries refetch on next observer (or immediately if active). |

The API layer **must** forward `signal` to `fetch` for abort to actually fire — see `lib/api/client.ts` for the pattern.

```typescript
async getAllCategories(signal?: AbortSignal): Promise<Category[]> {
    return fetchAPI<Category[]>("/api/Category", { signal })
}
```

### Tuning defaults (`lib/query/client.ts`)

| Default | Value | Rationale |
|---|---|---|
| `staleTime` | 5 min | Lookup data rarely changes mid-session |
| `gcTime` | 10 min | Keep cache alive across navigation |
| `refetchOnWindowFocus` | `false` | B2B users alt-tab a lot; aggressive refresh annoys |
| `retry` | 1 (network/5xx only) | Don't retry validation errors (4xx) |

Override per-query when needed: `queryOptions({ ..., staleTime: 30 * 60 * 1000 })`.

### Centralised error handling — no try/catch in components

**Don't write `try / catch / finally` around `useQuery` or `useMutation`.** The `QueryClient` is wired with global `QueryCache` + `MutationCache` handlers (in `lib/query/client.ts`) that:

- Toast any failure automatically (with friendly messages for 401/403/network errors)
- Suppress generic toast for HTTP 422 (forms render field errors instead)
- Show success toasts when the mutation declares one
- Invalidate downstream caches automatically when the mutation declares them

All behaviour is configured **declaratively via the `meta` field** on the query/mutation, not imperatively in the component.

#### Mutation hooks — declarative

```typescript
// hooks/use-categories.ts
export function useCreateCategory() {
    return useMutation({
        mutationFn: (input: CreateCategoryRequest) => categoryAPI.createCategory(input),
        meta: {
            successMessage: "Category created",
            invalidates: [queryKeys.categories.all],
        },
    })
}
```

```typescript
// component
const create = useCreateCategory()
create.mutate(input)
// ✓ success toast on 2xx
// ✓ error toast on 4xx/5xx (validation 422 silent — handled by form)
// ✓ category lists refetch on success
```

#### Available `meta` fields

```typescript
interface QueryMeta {
    silent?: boolean         // suppress error toast
    errorMessage?: string    // override toast text
}

interface MutationMeta {
    silent?: boolean
    successMessage?: string  // emit success toast on 2xx
    errorMessage?: string    // override error toast text
    invalidates?: QueryKey[] // refetch these on success
}
```

#### Validation errors (HTTP 422) → react-hook-form

For forms, map the backend's per-field errors directly onto `setError`:

```typescript
import { applyValidationErrors } from "@/lib/query/rhf"

const { setError, handleSubmit } = useForm(...)
const create = useCreateProduct()

const onSubmit = handleSubmit((data) => {
    create.mutate(data, {
        onError: (error) => applyValidationErrors(error, setError),
    })
})
```

The global toast is automatically suppressed for 422 (the form renders field-level errors).

#### When you DO want try/catch

Only when the caller needs to **branch** on the error (e.g. retry with different input, fall back to another path). For toast-and-forget — the global handler is doing it for you.

#### Optimistic updates

```typescript
useMutation({
    mutationFn: ...,
    onMutate: async (input) => {
        const previous = queryClient.getQueryData(queryKeys.products.detail(input.id))
        queryClient.setQueryData(queryKeys.products.detail(input.id), optimistic)
        return { previous }
    },
    onError: (_err, _input, ctx) => {
        // restore on failure
        if (ctx?.previous) queryClient.setQueryData(queryKeys.products.detail(input.id), ctx.previous)
    },
})
```

### When NOT to use TanStack Query

- **Pure client state** (form values, UI toggles, modal open/close) → `useState` or `jotai`
- **Auth state derived from JWT decode** → already lives in `AuthContext`
- **Static data hard-coded in the bundle** → just import it

### Migration order

When adding TanStack Query to an existing page:

1. Add `signal` parameter to the API method(s) used
2. Add entry to `lib/query/keys.ts`
3. Add entry to `lib/query/options.ts`
4. Create a hook in `hooks/use-<feature>.ts`
5. Replace the page's `useState` + `useEffect` fetch with the hook
6. Delete unused imports from the page

That's the path the product form took (3 separate `useEffect` fetches → 1 hook call). See `app/(dashboard)/inventory/products/_components/product-form.tsx`.

## File organization

```
NextErp_React/
├── app/                    Next.js App Router pages
├── components/             Reusable UI (shadcn) + layout + providers
├── containers/             Page-specific composite components
├── contexts/               React Context providers (auth, sidebar)
├── data/                   Static dictionaries / mock data (delete when API ready)
├── hooks/                  Custom hooks (use-*.ts) — public API for consumers
├── lib/
│   ├── api/                Raw API client + per-entity fetch wrappers
│   ├── auth/               Token storage, auth helpers
│   ├── query/              TanStack Query: client, keys, options factories
│   └── types/              Shared type definitions
├── schemas/                Zod schemas (form validation)
└── types/                  Domain types from API contracts
```

## Misc conventions

- ISO 8601 dates, 24-hour time everywhere user-facing.
- Tailwind 4 + shadcn/ui — do not invent component primitives, extend shadcn.
- Forms: `react-hook-form` + `zod` via `@hookform/resolvers/zod`.
- Toast: `sonner` (`toast.success`, `toast.error`).
- Routing: Next.js App Router (`app/` directory). Client components must declare `"use client"` at the top.
