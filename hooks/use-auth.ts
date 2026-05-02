"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchAPI } from "@/lib/api/client"
import { authQueries } from "@/lib/query/options"
import type { AuthResponse, LoginDto, RegisterDto } from "@/types/auth"

/**
 * Auth — `me` query plus login/register mutations.
 *
 * Login and register go through the shared `fetchAPI` client so APIError handling
 * (including HTTP 422 ValidationException → field errors via `applyValidationErrors`)
 * works the same way as for any other mutation. The AuthContext owns post-success
 * state (token storage, /me hydration, navigation); the hooks just return the mutation
 * handle so the form can react to `isPending` and `onError` without try/catch.
 */

// ----- Reads -----

export function useMe() {
    return useQuery(authQueries.me())
}

// ----- Mutations -----

export function useLogin() {
    return useMutation({
        mutationFn: (input: LoginDto) =>
            fetchAPI<AuthResponse>("/api/Auth/login", {
                method: "POST",
                body: JSON.stringify(input),
            }),
        meta: {
            // Login error/success toasts are owned by the form/auth context — keep silent.
            silent: true,
        },
    })
}

export function useRegister() {
    return useMutation({
        mutationFn: (input: RegisterDto) =>
            fetchAPI<AuthResponse>("/api/Auth/register", {
                method: "POST",
                body: JSON.stringify(input),
            }),
        meta: {
            silent: true,
        },
    })
}
