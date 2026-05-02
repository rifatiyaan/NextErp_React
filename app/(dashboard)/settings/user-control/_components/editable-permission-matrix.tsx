"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronDown, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IdentityRoleEntry } from "@/lib/types/identity"
import type { MenuPermissionItem } from "@/lib/permissions/menu-permission-groups"
import { flattenMenuPermissionKeys } from "@/lib/permissions/menu-permission-groups"
import { useSetRolePermissions } from "@/hooks/use-identity"

function normKey(k: string) {
    return k.toLowerCase()
}

interface EditablePermissionMatrixProps {
    selectedRole: IdentityRoleEntry | null
    permissionGroups: Record<string, MenuPermissionItem[]>
    groupsLoading: boolean
    groupsError: Error | null
    onPermissionsUpdated: (roleId: string, keys: string[]) => void
}

export function EditablePermissionMatrix({
    selectedRole,
    permissionGroups,
    groupsLoading,
    groupsError,
    onPermissionsUpdated,
}: EditablePermissionMatrixProps) {
    const menuKeys = flattenMenuPermissionKeys(permissionGroups)

    const [draft, setDraft] = useState<Set<string>>(new Set())
    const [hasChanges, setHasChanges] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())
    const setRolePermissions = useSetRolePermissions()
    const saving = setRolePermissions.isPending

    useEffect(() => {
        setOpenGroups(new Set(Object.keys(permissionGroups)))
    }, [permissionGroups])

    useEffect(() => {
        if (!selectedRole) return
        const mk = flattenMenuPermissionKeys(permissionGroups)
        if (mk.size === 0) return
        setDraft(
            new Set(selectedRole.permissions.map(normKey).filter((k) => mk.has(k)))
        )
        setHasChanges(false)
        setSaveError(null)
    }, [selectedRole?.id, selectedRole?.permissions, permissionGroups])

    function togglePermission(key: string) {
        const k = normKey(key)
        setDraft((prev) => {
            const next = new Set(prev)
            next.has(k) ? next.delete(k) : next.add(k)
            return next
        })
        setHasChanges(true)
    }

    function toggleGroup(groupName: string, items: { key: string }[]) {
        const allEnabled = items.every((i) => draft.has(normKey(i.key)))
        setDraft((prev) => {
            const next = new Set(prev)
            items.forEach((i) => {
                const k = normKey(i.key)
                allEnabled ? next.delete(k) : next.add(k)
            })
            return next
        })
        setHasChanges(true)
    }

    function toggleGroupOpen(groupName: string) {
        setOpenGroups((prev) => {
            const next = new Set(prev)
            next.has(groupName) ? next.delete(groupName) : next.add(groupName)
            return next
        })
    }

    function handleSave() {
        if (!selectedRole) return
        setSaveError(null)
        const fromMenu = Array.from(draft)
        const roleLower = selectedRole.permissions.map(normKey)
        const orphans = roleLower.filter((k) => !menuKeys.has(k))
        const merged = [...new Set([...orphans, ...fromMenu])]
        setRolePermissions.mutate(
            { roleId: selectedRole.id, permissionKeys: merged },
            {
                onSuccess: () => {
                    onPermissionsUpdated(selectedRole.id, merged)
                    setHasChanges(false)
                },
                onError: (e: unknown) => {
                    setSaveError(e instanceof Error ? e.message : "Save failed")
                },
            }
        )
    }

    if (groupsLoading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">Loading menu…</p>
                <p className="text-xs text-muted-foreground/60">
                    Permissions follow modules from your database
                </p>
            </div>
        )
    }

    if (groupsError) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm font-medium text-destructive">Could not load menu</p>
                <p className="text-xs text-muted-foreground">{groupsError.message}</p>
            </div>
        )
    }

    if (!selectedRole) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">No role selected</p>
                <p className="text-xs text-muted-foreground/60">
                    Click a role card to view and edit its permissions
                </p>
            </div>
        )
    }

    const totalAll = Object.values(permissionGroups).flat().length

    if (totalAll === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">No menu modules</p>
                <p className="text-xs text-muted-foreground/60">
                    Add modules under Settings → Manage Module
                </p>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            <div className="shrink-0 border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">{selectedRole.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {draft.size}/{totalAll} permissions
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="h-7 text-xs"
                        disabled={!hasChanges || saving}
                        onClick={() => void handleSave()}
                    >
                        <Save className="mr-1.5 h-3 w-3" />
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </div>
                {saveError && (
                    <p className="mt-1.5 text-[11px] text-destructive">{saveError}</p>
                )}
                {hasChanges && !saveError && (
                    <p className="mt-1 text-[11px] text-amber-500">Unsaved changes</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {Object.entries(permissionGroups).map(([groupName, items]) => {
                    const enabledCount = items.filter((i) => draft.has(normKey(i.key))).length
                    const allEnabled = enabledCount === items.length
                    const isOpen = openGroups.has(groupName)

                    return (
                        <Collapsible key={groupName} open={isOpen} onOpenChange={() => toggleGroupOpen(groupName)}>
                            <div className="flex w-full items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5 transition-colors hover:bg-muted/30">
                                <button
                                    type="button"
                                    className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    aria-expanded={isOpen}
                                    onClick={() => toggleGroupOpen(groupName)}
                                >
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {groupName}
                                    </span>
                                    <Badge variant="outline" className="border px-1 py-0 text-[10px]">
                                        {enabledCount}/{items.length}
                                    </Badge>
                                </button>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Switch
                                        checked={allEnabled}
                                        onCheckedChange={() => toggleGroup(groupName, items)}
                                        className="scale-75"
                                    />
                                    <button
                                        type="button"
                                        className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted/50"
                                        aria-expanded={isOpen}
                                        aria-label={isOpen ? "Collapse section" : "Expand section"}
                                        onClick={() => toggleGroupOpen(groupName)}
                                    >
                                        <ChevronDown
                                            className={cn(
                                                "size-3.5 transition-transform duration-200",
                                                isOpen && "rotate-180"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                            <CollapsibleContent>
                                <div className="divide-y divide-border/40">
                                    {items.map((item) => (
                                        <div key={item.key} className="flex items-center justify-between px-4 py-2">
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    draft.has(normKey(item.key)) ? "text-foreground" : "text-muted-foreground/60"
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                            <Switch
                                                checked={draft.has(normKey(item.key))}
                                                onCheckedChange={() => togglePermission(item.key)}
                                                className="scale-75"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )
                })}
            </div>
        </div>
    )
}
