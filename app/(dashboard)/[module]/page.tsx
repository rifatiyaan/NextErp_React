"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { moduleAPI } from "@/lib/api/module"
import type { Module } from "@/types/module"
import { useSidebarView } from "@/contexts/sidebar-view-context"
import { DynamicIcon } from "@/components/dynamic-icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ModuleDashboard({ params }: { params: Promise<{ module: string }> }) {
    // Next.js 15+ convention: params is a promise
    const { module: moduleSlug } = use(params)
    const { mode } = useSidebarView()
    const [currentModule, setCurrentModule] = useState<Module | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadModule = async () => {
            try {
                // Fetch user menu (already hierarchical and filtered by roles)
                const modules = await moduleAPI.getUserMenu()

                // Match /slug or /slug/ - find the parent module
                const found = modules.find(m => {
                    if (!m.url) return false
                    const normalizedUrl = m.url.toLowerCase().replace(/\/$/, "") // Remove trailing slash
                    const normalizedSlug = moduleSlug.toLowerCase()

                    return normalizedUrl === `/${normalizedSlug}` || normalizedUrl === `/${normalizedSlug}/`
                })

                if (found) {
                    setCurrentModule(found)
                } else {
                    console.warn(`Module not found via slug: ${moduleSlug}`)
                }
            } catch (error) {
                console.error("Failed to load module data", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadModule()
    }, [moduleSlug])

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading module...</p>
            </div>
        )
    }

    if (!currentModule) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold text-destructive">Module Not Found</h1>
                <p>The module "{moduleSlug}" does not exist or you do not have permissions.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb / Header */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <span>&gt;</span>
                <span className="font-medium text-foreground">{currentModule.title}</span>
            </div>

            {/* Grid of Child Modules/Links - Only show in grid mode */}
            {mode === "grid" && (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {currentModule.children && currentModule.children.length > 0 ? (
                        currentModule.children
                            .sort((a, b) => a.order - b.order)
                            .map((child) => (
                                <Link
                                    key={child.id}
                                    href={child.url || "#"}
                                    target={child.metadata?.openInNewTab ? "_blank" : undefined}
                                    rel={child.isExternal ? "noopener noreferrer" : undefined}
                                    className="block group h-full"
                                >
                                    <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer">
                                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                            {child.icon && (
                                                <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    <DynamicIcon name={child.icon as any} className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                                    {child.title}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {child.metadata?.description || child.metadata?.badgeText || child.title}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-muted/20 rounded-lg border border-dashed text-muted-foreground">
                            No sub-modules available.
                        </div>
                    )}
                </div>
            )}
            
            {/* In sidebar mode, show a message or redirect */}
            {mode === "sidebar" && (
                <div className="py-12 text-center bg-muted/20 rounded-lg border border-dashed text-muted-foreground">
                    <p className="text-sm">
                        In sidebar mode, child modules are displayed in the left sidebar.
                        <br />
                        Toggle to grid mode to see child modules as cards here.
                    </p>
                </div>
            )}
        </div>
    )
}
