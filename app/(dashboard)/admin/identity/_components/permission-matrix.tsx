"use client"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import type { IdentityRoleEntry } from "@/lib/types/identity"
import type { MenuPermissionItem } from "@/lib/permissions/menu-permission-groups"

function normKey(k: string) {
 return k.toLowerCase()
}

interface PermissionMatrixProps {
 selectedRole: IdentityRoleEntry | null
 permissionGroups: Record<string, MenuPermissionItem[]>
 groupsLoading: boolean
 groupsError: Error | null
}

function PermissionGroup({
 groupName,
 items,
 rolePermissions,
}: {
 groupName: string
 items: { key: string; label: string }[]
 rolePermissions: Set<string>
}) {
 const [open, setOpen] = useState(true)
 const enabledCount = items.filter((i) => rolePermissions.has(normKey(i.key))).length

 return (
 <Collapsible open={open} onOpenChange={setOpen}>
 <CollapsibleTrigger className="flex w-full items-center justify-between border-b border-border/60 px-4 py-2.5 hover:bg-muted/30 transition-colors">
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
 {groupName}
 </span>
 <Badge
 variant="outline"
 className=" border px-1 py-0 text-[10px]"
 >
 {enabledCount}/{items.length}
 </Badge>
 </div>
 <ChevronDown
 className={cn(
 "size-3.5 text-muted-foreground transition-transform duration-200",
 open && "rotate-180"
 )}
 />
 </CollapsibleTrigger>
 <CollapsibleContent>
 <div className="divide-y divide-border/40">
 {items.map((item) => {
 const enabled = rolePermissions.has(normKey(item.key))
 return (
 <div
 key={item.key}
 className="flex items-center justify-between px-4 py-2"
 >
 <span
 className={cn(
 "text-xs",
 enabled
 ? "text-foreground"
 : "text-muted-foreground/60"
 )}
 >
 {item.label}
 </span>
 <Switch
 checked={enabled}
 disabled
 className={cn(
 "scale-75 cursor-default",
 enabled && "data-[state=checked]:bg-primary"
 )}
 />
 </div>
 )
 })}
 </div>
 </CollapsibleContent>
 </Collapsible>
 )
}

export function PermissionMatrix({
 selectedRole,
 permissionGroups,
 groupsLoading,
 groupsError,
}: PermissionMatrixProps) {
 if (groupsLoading) {
 return (
 <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
 Loading menu…
 </div>
 )
 }

 if (groupsError) {
 return (
 <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-destructive">
 {groupsError.message}
 </div>
 )
 }

 if (!selectedRole) {
 return (
 <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
 <div className="text-sm font-medium text-muted-foreground">No role selected</div>
 <p className="text-xs text-muted-foreground/60">
 Click a role card to inspect its permissions
 </p>
 </div>
 )
 }

 const rolePermissions = new Set(selectedRole.permissions.map(normKey))
 const totalAll = Object.values(permissionGroups).flat().length
 const totalEnabled = Object.values(permissionGroups)
 .flat()
 .filter((i) => rolePermissions.has(normKey(i.key))).length

 return (
 <div className="flex h-full flex-col">
 <div className="border-b border-border px-4 py-3">
 <div className="flex items-center justify-between">
 <span className="text-sm font-semibold">{selectedRole.name}</span>
 <Badge
 variant="outline"
 className=" border text-[10px]"
 >
 {totalEnabled}/{totalAll} permissions
 </Badge>
 </div>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {selectedRole.permissionSummary}
 </p>
 </div>

 <div className="flex-1 overflow-y-auto">
 {Object.entries(permissionGroups).map(([groupName, items]) => (
 <PermissionGroup
 key={groupName}
 groupName={groupName}
 items={items}
 rolePermissions={rolePermissions}
 />
 ))}
 </div>
 </div>
 )
}
