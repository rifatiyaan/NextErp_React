"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { IdentityRoleEntry } from "@/lib/types/identity"

interface RoleBentoGridProps {
 roles: IdentityRoleEntry[]
 selectedRoleId: string | null
 highlightedRoleId: string | null
 onRoleClick: (role: IdentityRoleEntry) => void
}

// Sizes cycle: first role gets the biggest card, then medium, then small
const SIZE_CLASSES = [
 "col-span-2 row-span-2",
 "col-span-2 row-span-1",
 "col-span-1 row-span-1",
 "col-span-1 row-span-1",
 "col-span-1 row-span-1",
]

const ACCENT_COLORS: Record<string, string> = {
 SuperAdmin: "bg-chart-1/10 border-chart-1/30 hover:border-chart-1/60",
 Admin: "bg-chart-2/10 border-chart-2/30 hover:border-chart-2/60",
 Manager: "bg-chart-3/10 border-chart-3/30 hover:border-chart-3/60",
 Cashier: "bg-chart-4/10 border-chart-4/30 hover:border-chart-4/60",
 Viewer: "bg-muted/60 border-border hover:border-muted-foreground/40",
}

const BADGE_COLORS: Record<string, string> = {
 "Full Access": "bg-green-500/15 text-green-600 border-green-500/30",
 "Full Access (Branch)":"bg-blue-500/15 text-blue-600 border-blue-500/30",
 "Operational": "bg-amber-500/15 text-amber-600 border-amber-500/30",
 "POS Only": "bg-purple-500/15 text-purple-600 border-purple-500/30",
 "Read Only": "bg-slate-500/15 text-slate-500 border-slate-500/30",
 "Custom": "bg-muted text-muted-foreground border-border",
}

function AccessLevelBar({ count, max }: { count: number; max: number }) {
 const pct = max > 0 ? Math.min(100, (count / max) * 100) : 0
 return (
 <div className="mt-3 h-1 w-full overflow-hidden bg-border/40">
 <div
 className="h-full bg-primary/60 transition-all duration-500"
 style={{ width: `${pct}%` }}
 />
 </div>
 )
}

export function RoleBentoGrid({
 roles,
 selectedRoleId,
 highlightedRoleId,
 onRoleClick,
}: RoleBentoGridProps) {
 const maxUsers = Math.max(...roles.map((r) => r.userCount), 1)

 if (roles.length === 0) {
 return (
 <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
 No roles found
 </div>
 )
 }

 return (
 <div className="grid grid-cols-3 auto-rows-[90px] gap-2">
 {roles.map((role, i) => {
 const sizeClass = SIZE_CLASSES[i] ?? "col-span-1 row-span-1"
 const accentClass = ACCENT_COLORS[role.name] ?? ACCENT_COLORS.Viewer
 const isSelected = selectedRoleId === role.id
 const isHighlighted = highlightedRoleId === role.id
 const badgeClass = BADGE_COLORS[role.permissionSummary] ?? BADGE_COLORS.Custom
 const isLargeCard = i === 0

 return (
 <button
 key={role.id}
 onClick={() => onRoleClick(role)}
 className={cn(
 "group relative flex flex-col justify-between border p-3 text-left",
 "transition-all duration-150 cursor-pointer select-none",
 " focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
 sizeClass,
 accentClass,
 isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
 isHighlighted && !isSelected && "ring-1 ring-primary/60"
 )}
 >
 <div className="flex items-start justify-between gap-2">
 <span
 className={cn(
 "font-semibold leading-tight text-foreground",
 isLargeCard ? "text-base" : "text-sm"
 )}
 >
 {role.name}
 </span>
 <Badge
 variant="outline"
 className={cn(
 "shrink-0 border px-1.5 py-0 text-[10px] font-medium leading-5",
 badgeClass
 )}
 >
 {role.permissionSummary}
 </Badge>
 </div>

 <div>
 <div className="flex items-baseline gap-1">
 <span
 className={cn(
 "font-bold tabular-nums text-foreground",
 isLargeCard ? "text-3xl" : "text-xl"
 )}
 >
 {role.userCount}
 </span>
 <span className="text-xs text-muted-foreground">
 {role.userCount === 1 ? "user" : "users"}
 </span>
 </div>
 <AccessLevelBar count={role.userCount} max={maxUsers} />
 </div>
 </button>
 )
 })}
 </div>
 )
}
