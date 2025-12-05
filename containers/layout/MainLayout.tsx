"use client"

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
    const dictionary = en

    return (
        <div className="flex h-full min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 transition-[margin] duration-300 ease-in-out">
                <Header dictionary={dictionary} />
                <main className="flex-1 p-6 overflow-y-auto bg-muted/20">
                    {children}
                </main>
                {/* <Footer /> */}
            </div>
        </div>
    )
}
