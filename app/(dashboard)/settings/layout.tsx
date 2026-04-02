"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { hasIdentityAdminRole } from "@/lib/auth/roles"
import { Loader } from "@/components/ui/loader"

/**
 * Settings (modules, branches, user-control) — SuperAdmin and Admin only.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const allowed = hasIdentityAdminRole(user?.roles ?? [])

    useEffect(() => {
        if (isLoading) return
        if (!user) {
            router.replace("/login")
            return
        }
        if (!allowed) {
            router.replace("/dashboard")
        }
    }, [isLoading, user, allowed, router])

    if (isLoading || !user || !allowed) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader text="Checking access…" />
            </div>
        )
    }

    return <>{children}</>
}
