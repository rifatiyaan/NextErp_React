"use client"

import { Bell, ChevronRight, Layers, Search, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface PreviewPaneProps {
    style?: React.CSSProperties
    placement: "sidebar" | "topbar"
    radius: "none" | "sm" | "md"
    companyName: string | null
    companyLogoUrl: string | null
}

export function PreviewPane({ style, placement, radius, companyName, companyLogoUrl }: PreviewPaneProps) {
    const radiusClass = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
    }[radius]

    return (
        <div
            className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            style={{
                // Scoped overrides only inside this preview block; the rest of the
                // page keeps its own theme until the user clicks Save.
                ...style,
                colorScheme: "inherit",
            }}
        >
            {/* Title strip */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Live preview
                </span>
                <Sparkles className="size-3 text-muted-foreground" />
            </div>

            {/* Mock body */}
            <div className="bg-background" style={{ minHeight: 320 }}>
                {placement === "topbar" ? (
                    <TopbarLayout
                        radiusClass={radiusClass}
                        companyName={companyName}
                        companyLogoUrl={companyLogoUrl}
                    />
                ) : (
                    <SidebarLayout
                        radiusClass={radiusClass}
                        companyName={companyName}
                        companyLogoUrl={companyLogoUrl}
                    />
                )}
            </div>
        </div>
    )
}

interface LayoutProps {
    radiusClass: string
    companyName: string | null
    companyLogoUrl: string | null
}

function SidebarLayout({ radiusClass, companyName, companyLogoUrl }: LayoutProps) {
    return (
        <div className="flex h-full">
            <div
                className="w-32 shrink-0 border-r border-sidebar-border bg-sidebar p-2"
                style={{ background: "hsl(var(--sidebar-background))", color: "hsl(var(--sidebar-foreground))" }}
            >
                <BrandHeader companyName={companyName} companyLogoUrl={companyLogoUrl} compact />
                <nav className="mt-3 flex flex-col gap-1">
                    {["Dashboard", "Inventory", "Sales", "Reports"].map((item, i) => (
                        <div
                            key={item}
                            className={cn(
                                "flex items-center gap-1.5 px-1.5 py-1 text-[10px]",
                                radiusClass,
                                i === 0 && "bg-primary text-primary-foreground",
                                i !== 0 && "hover:bg-sidebar-accent",
                            )}
                        >
                            <Layers className="size-3" />
                            {item}
                        </div>
                    ))}
                </nav>
            </div>
            <MainArea radiusClass={radiusClass} />
        </div>
    )
}

function TopbarLayout({ radiusClass, companyName, companyLogoUrl }: LayoutProps) {
    return (
        <div className="flex h-full flex-col">
            <div
                className="flex items-center justify-between border-b border-sidebar-border px-3 py-2"
                style={{ background: "hsl(var(--sidebar-background))", color: "hsl(var(--sidebar-foreground))" }}
            >
                <BrandHeader companyName={companyName} companyLogoUrl={companyLogoUrl} compact />
                <nav className="flex items-center gap-2">
                    {["Home", "Inventory", "Sales"].map((item, i) => (
                        <span
                            key={item}
                            className={cn(
                                "px-2 py-0.5 text-[10px]",
                                radiusClass,
                                i === 0 && "bg-primary text-primary-foreground",
                            )}
                        >
                            {item}
                        </span>
                    ))}
                </nav>
            </div>
            <MainArea radiusClass={radiusClass} />
        </div>
    )
}

function BrandHeader({
    companyName,
    companyLogoUrl,
    compact,
}: {
    companyName: string | null
    companyLogoUrl: string | null
    compact?: boolean
}) {
    return (
        <div className="flex items-center gap-1.5">
            {companyLogoUrl ? (
                <img
                    src={companyLogoUrl}
                    alt={companyName ?? "Logo"}
                    className={cn("rounded shrink-0", compact ? "size-5" : "size-6")}
                />
            ) : (
                <div
                    className={cn(
                        "shrink-0 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold",
                        compact ? "size-5 text-[8px]" : "size-6 text-[10px]",
                    )}
                >
                    {(companyName ?? "N").charAt(0).toUpperCase()}
                </div>
            )}
            <span className={cn("font-semibold truncate", compact ? "text-[10px]" : "text-xs")}>
                {companyName ?? "Your Company"}
            </span>
        </div>
    )
}

function MainArea({ radiusClass }: { radiusClass: string }) {
    return (
        <div className="flex-1 p-3">
            <div className="mb-2 flex items-center gap-1.5">
                <div className={cn("flex flex-1 items-center gap-1 border border-border bg-background px-2 py-1", radiusClass)}>
                    <Search className="size-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Search</span>
                </div>
                <button className={cn("size-6 border border-border bg-background flex items-center justify-center", radiusClass)} aria-hidden>
                    <Bell className="size-3 text-muted-foreground" />
                </button>
                <button className={cn("size-6 bg-primary text-primary-foreground flex items-center justify-center font-bold text-[8px]", radiusClass)} aria-hidden>
                    <User className="size-3" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
                {[
                    { label: "Sales", value: "₹12.4k" },
                    { label: "Orders", value: "248" },
                    { label: "Stock", value: "1.2k" },
                ].map((stat) => (
                    <div key={stat.label} className={cn("border border-border bg-card p-1.5", radiusClass)}>
                        <p className="text-[8px] text-muted-foreground">{stat.label}</p>
                        <p className="text-xs font-semibold">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className={cn("mt-2 border border-border bg-secondary/30 p-2", radiusClass)}>
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-medium">Recent activity</span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                </div>
                {["Sale invoice", "Stock adjustment", "New customer"].map((row) => (
                    <div key={row} className="flex items-center justify-between border-t border-border/40 py-0.5 text-[9px] first:border-t-0">
                        <span>{row}</span>
                        <span className="text-muted-foreground">2m</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
