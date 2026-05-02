"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"

interface Props {
    permission: string | string[]
    fallback?: ReactNode
    children: ReactNode
}

export function RequirePermission({ permission, fallback = null, children }: Props) {
    const { hasPermission, hasAnyPermission } = useAuth()
    const allowed = Array.isArray(permission)
        ? hasAnyPermission(permission)
        : hasPermission(permission)
    if (!allowed) return <>{fallback}</>
    return <>{children}</>
}
