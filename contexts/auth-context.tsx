"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { LoginDto, RegisterDto, User } from "@/types/auth"
import { fetchAPI } from "@/lib/api/client"
import { tokenStorage } from "@/lib/auth/storage"

interface AuthContextType {
    user: User | null
    isLoading: boolean
    error: string | null
    login: (credentials: LoginDto) => Promise<void>
    register: (data: RegisterDto) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Decode JWT to get user info (simple implementation)
    const decodeToken = (token: string): User | null => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            return {
                id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub,
                email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email,
                userName: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.name,
            }
        } catch {
            return null
        }
    }

    // Check for existing token on mount
    useEffect(() => {
        const token = tokenStorage.getToken()
        if (token) {
            const userData = decodeToken(token)
            setUser(userData)
        }
        setIsLoading(false)
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
            const userData = decodeToken(response.token)
            setUser(userData)
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
            const userData = decodeToken(response.token)
            setUser(userData)
            router.push("/")
        } catch (err: any) {
            setError(err.message || "Registration failed")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        tokenStorage.clearToken()
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                login,
                register,
                logout,
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
