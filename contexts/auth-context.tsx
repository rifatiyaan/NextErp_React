"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { CurrentUser, LoginDto, RegisterDto } from "@/types/auth"
import { fetchAPI } from "@/lib/api/client"
import { authAPI } from "@/lib/api/auth"
import { tokenStorage } from "@/lib/auth/storage"
import {
    extractIsGlobalFromJwtPayload,
    extractRolesFromJwtPayload,
} from "@/lib/auth/roles"

interface AuthContextType {
    user: CurrentUser | null
    permissions: Set<string>
    isLoading: boolean
    error: string | null
    login: (credentials: LoginDto) => Promise<void>
    register: (data: RegisterDto) => Promise<void>
    /**
     * Save a freshly issued token, hydrate `me`, and redirect to the dashboard.
     * Used by the login/register forms (which now perform the network call via
     * `useLogin` / `useRegister`) to hand the resulting token to the context.
     */
    setSession: (token: string) => Promise<void>
    logout: () => void
    hasPermission: (key: string) => boolean
    hasAnyPermission: (keys: string[]) => boolean
    hasAllPermissions: (keys: string[]) => boolean
    refreshPermissions: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Decode JWT to get a minimal user shape — kept for backward compat as a fallback
// when /me has not yet resolved (e.g. during initial mount).
const decodeToken = (token: string): CurrentUser | null => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])) as Record<string, unknown>
        const id =
            (payload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] as string) || (payload.sub as string)
        const email =
            (payload[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            ] as string) || (payload.email as string)
        const userName =
            (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string) ||
            (payload.name as string)
        const isGlobal = extractIsGlobalFromJwtPayload(payload)
        return {
            id,
            email,
            userName,
            roles: extractRolesFromJwtPayload(payload),
            isGlobal,
            isSuperAdmin: isGlobal,
            permissions: [],
        }
    } catch {
        return null
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null)
    const [permissions, setPermissions] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const applyCurrentUser = useCallback((current: CurrentUser) => {
        setUser(current)
        setPermissions(new Set(current.permissions ?? []))
    }, [])

    const clearAuth = useCallback(() => {
        tokenStorage.clearToken()
        setUser(null)
        setPermissions(new Set())
    }, [])

    const fetchMe = useCallback(async () => {
        const current = await authAPI.me()
        applyCurrentUser(current)
        return current
    }, [applyCurrentUser])

    // On mount: if a token exists, hydrate via /me. On 401, log out silently.
    useEffect(() => {
        let cancelled = false
        const init = async () => {
            const token = tokenStorage.getToken()
            if (!token) {
                setIsLoading(false)
                return
            }
            // Pre-populate from JWT for snappier UX while /me is in flight.
            const fallback = decodeToken(token)
            if (fallback && !cancelled) setUser(fallback)
            try {
                await fetchMe()
            } catch (err: unknown) {
                const status = (err as { status?: number })?.status
                if (status === 401) {
                    if (!cancelled) {
                        clearAuth()
                        router.push("/login")
                    }
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        void init()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = async (credentials: LoginDto) => {
        try {
            setError(null)
            setIsLoading(true)

            const response = await fetchAPI<{ token: string }>("/api/Auth/login", {
                method: "POST",
                body: JSON.stringify(credentials),
            })

            tokenStorage.saveToken(response.token)
            try {
                await fetchMe()
            } catch {
                // Fallback to token decode if /me fails for any reason.
                const fallback = decodeToken(response.token)
                if (fallback) setUser(fallback)
            }
            router.push("/")
        } catch (err: any) {
            setError(err.message || "Login failed")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (data: RegisterDto) => {
        try {
            setError(null)
            setIsLoading(true)

            const response = await fetchAPI<{ token: string }>("/api/Auth/register", {
                method: "POST",
                body: JSON.stringify(data),
            })

            tokenStorage.saveToken(response.token)
            try {
                await fetchMe()
            } catch {
                const fallback = decodeToken(response.token)
                if (fallback) setUser(fallback)
            }
            router.push("/")
        } catch (err: any) {
            setError(err.message || "Registration failed")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const setSession = useCallback(
        async (token: string) => {
            tokenStorage.saveToken(token)
            try {
                await fetchMe()
            } catch {
                // Fallback to token decode if /me fails for any reason.
                const fallback = decodeToken(token)
                if (fallback) setUser(fallback)
            }
            router.push("/")
        },
        [fetchMe, router],
    )

    const logout = () => {
        clearAuth()
        router.push("/login")
    }

    const hasPermission = useCallback(
        (key: string) => {
            if (user?.isSuperAdmin) return true
            return permissions.has(key)
        },
        [user, permissions],
    )

    const hasAnyPermission = useCallback(
        (keys: string[]) => {
            if (user?.isSuperAdmin) return true
            return keys.some((k) => permissions.has(k))
        },
        [user, permissions],
    )

    const hasAllPermissions = useCallback(
        (keys: string[]) => {
            if (user?.isSuperAdmin) return true
            return keys.every((k) => permissions.has(k))
        },
        [user, permissions],
    )

    const refreshPermissions = useCallback(async () => {
        try {
            await fetchMe()
        } catch (err: unknown) {
            const status = (err as { status?: number })?.status
            if (status === 401) {
                clearAuth()
                router.push("/login")
            }
        }
    }, [fetchMe, clearAuth, router])

    return (
        <AuthContext.Provider
            value={{
                user,
                permissions,
                isLoading,
                error,
                login,
                register,
                setSession,
                logout,
                hasPermission,
                hasAnyPermission,
                hasAllPermissions,
                refreshPermissions,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
