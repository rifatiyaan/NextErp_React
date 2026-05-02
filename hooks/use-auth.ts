"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { authAPI } from "@/lib/api/auth"
import { authQueries } from "@/lib/query/options"

/**
 * Auth — `me` query plus login/register mutations.
 *
 * Login and register hit endpoints via fetch directly because the AuthContext owns
 * post-success state (token storage, user state, navigation). The hooks return the
 * mutation handle so the form can react to `isPending` and `onError` without try/catch.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7245"

interface LoginInput {
    email: string
    password: string
}

interface RegisterInput {
    email: string
    password: string
    fullName: string
}

interface AuthResponse {
    accessToken: string
    user: {
        id: string
        email: string
        fullName: string
        tenantId: string
        branchId?: string
        roles?: string[]
    }
}

async function postAuth<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const text = await res.text().catch(() => "")
        let message = "Request failed"
        try {
            const data = JSON.parse(text)
            message = data?.detail ?? data?.title ?? data?.message ?? message
        } catch {
            if (text) message = text
        }
        const err = new Error(message) as Error & { status?: number }
        err.status = res.status
        throw err
    }
    return (await res.json()) as T
}

// ----- Reads -----

export function useMe() {
    return useQuery(authQueries.me())
}

// ----- Mutations -----

export function useLogin() {
    return useMutation({
        mutationFn: (input: LoginInput) => postAuth<AuthResponse>("/api/Auth/login", input),
        meta: {
            // Login error/success toasts are owned by the form/auth context — keep silent.
            silent: true,
        },
    })
}

export function useRegister() {
    return useMutation({
        mutationFn: (input: RegisterInput) =>
            postAuth<AuthResponse>("/api/Auth/register", input),
        meta: {
            silent: true,
        },
    })
}
