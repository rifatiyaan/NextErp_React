"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function useRequirePermission(
    permission: string | string[],
    redirectTo: string = "/dashboard",
) {
    const { hasPermission, hasAnyPermission, isLoading } = useAuth()
    const router = useRouter()
    useEffect(() => {
        if (isLoading) return
        const allowed = Array.isArray(permission)
            ? hasAnyPermission(permission)
            : hasPermission(permission)
        if (!allowed) router.replace(redirectTo)
    }, [isLoading, permission, redirectTo, hasPermission, hasAnyPermission, router])
}
