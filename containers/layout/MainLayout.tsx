"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

import type { ReactNode } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { getDictionary } from "@/lib/get-dictionary"
// import { Footer } from "@/components/layout/footer" // Not implemented yet

// We can fetch dictionary here or receive it.
// Since we are client component (because Sidebar/Header are client), and getDictionary is async mock...
// Actually, Sidebar and Header are client components, but MainLayout can be too if needed.
// Simplest: Mock dictionary synchronously or use simple objects.
// In lib/get-dictionary we exported async.
// Let's use the static 'en' object directly for now to avoid async issues in client components if not handling promises.
import { en } from "@/data/dictionaries/en"

export function MainLayout({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const dictionary = en

    useEffect(() => {
        if (!isLoading && !user) {
            router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
        }
    }, [user, isLoading, router, pathname])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading application...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect
    }

    return (
        <div className="flex h-full min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 transition-[margin] duration-300 ease-in-out bg-background">
                <Header dictionary={dictionary} />
                <main className="flex-1 p-3 overflow-y-auto bg-background">
                    {children}
                </main>
                {/* <Footer /> */}
            </div>
        </div>
    )
}
