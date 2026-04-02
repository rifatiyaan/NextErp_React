"use client"

import { useState } from "react"
import { useIdentityDashboard } from "@/hooks/use-identity-dashboard"
import { useMenuPermissionGroups } from "@/hooks/use-menu-permission-groups"
import { countRoleMenuPermissions } from "@/lib/permissions/menu-permission-groups"
import { EditablePermissionMatrix } from "./_components/editable-permission-matrix"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/ui/loader"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Building2, MoreHorizontal, RefreshCw, Shield, ShieldCheck, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IdentityRoleEntry, IdentityUserEntry } from "@/lib/types/identity"

function initials(user: IdentityUserEntry) {
    const f = user.firstName?.charAt(0) ?? ""
    const l = user.lastName?.charAt(0) ?? ""
    return (f + l).toUpperCase() || user.email.charAt(0).toUpperCase()
}

export default function UserControlPage() {
    const { roles, users, branches, loading, error, refetch, patchUser } =
        useIdentityDashboard()
    const {
        groups: permissionGroups,
        menuKeySet,
        loading: menuLoading,
        error: menuError,
        refetch: refetchMenu,
        totalCount: menuPermissionTotal,
    } = useMenuPermissionGroups()

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
    const [roleFilter, setRoleFilter] = useState("all")
    const [search, setSearch] = useState("")

    // Update local roles when permissions are saved
    const [localRoles, setLocalRoles] = useState<IdentityRoleEntry[] | null>(null)
    const displayRoles = localRoles ?? roles

    function handlePermissionsUpdated(roleId: string, keys: string[]) {
        setLocalRoles((prev) => {
            const base = prev ?? roles
            return base.map((r) =>
                r.id === roleId ? { ...r, permissions: keys } : r
            )
        })
    }

    const selectedRole = displayRoles.find((r) => r.id === selectedRoleId) ?? null

    const visibleUsers = users.filter((u) => {
        if (roleFilter !== "all" && u.roleName !== roleFilter) return false
        if (search) {
            const q = search.toLowerCase()
            return (
                u.email.toLowerCase().includes(q) ||
                u.userName.toLowerCase().includes(q) ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
            )
        }
        return true
    })

    return (
        <div className="flex h-full flex-col gap-3 overflow-hidden">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/dashboard">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink href="/settings">Settings</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>User Control</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Page header */}
            <div className="flex shrink-0 items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="size-5 text-primary" />
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">User Control</h1>
                        <p className="text-xs text-muted-foreground">
                            {displayRoles.length} roles · {users.length} users · {branches.length} branches
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        void refetch()
                        void refetchMenu()
                    }}
                    disabled={loading}
                >
                    <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="shrink-0 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
                    {error.message}
                </div>
            )}

            {loading ? (
                <Loader text="Loading identity data..." />
            ) : (
                <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
                    {/* ── LEFT: Role cards ── */}
                    <section className="flex w-64 shrink-0 flex-col gap-2 overflow-y-auto">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Roles
                        </p>
                        {displayRoles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() =>
                                    setSelectedRoleId((prev) => (prev === role.id ? null : role.id))
                                }
                                className={cn(
                                    "flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors",
                                    "hover:bg-muted/40 focus:outline-none",
                                    selectedRoleId === role.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{role.name}</span>
                                    <Badge variant="outline" className="text-[10px]">
                                        <Users className="mr-1 size-2.5" />
                                        {role.userCount}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{role.permissionSummary}</p>
                                <div className="h-1 w-full overflow-hidden rounded-full bg-border/40">
                                    <div
                                        className="h-full bg-primary/60 transition-all"
                                        style={{
                                            width:
                                                menuPermissionTotal > 0
                                                    ? `${Math.min(
                                                          100,
                                                          (countRoleMenuPermissions(role.permissions, menuKeySet) /
                                                              menuPermissionTotal) *
                                                              100
                                                      )}%`
                                                    : "0%",
                                        }}
                                    />
                                </div>
                            </button>
                        ))}
                    </section>

                    {/* ── CENTER: User directory ── */}
                    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
                        <div className="shrink-0 border-b border-border bg-muted/30 px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Users
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2">
                            <Input
                                placeholder="Search users…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-7 text-xs"
                            />
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="h-7 w-36 text-xs">
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {displayRoles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                            {visibleUsers.length === 0 ? (
                                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                                    No users match
                                </div>
                            ) : (
                                visibleUsers.map((user) => (
                                    <div key={user.id} className="group flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                                        <Avatar className="size-8 shrink-0">
                                            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                                            <AvatarFallback className="text-xs font-semibold">
                                                {initials(user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {user.firstName || user.lastName
                                                    ? `${user.firstName} ${user.lastName}`.trim()
                                                    : user.userName}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                                            {user.roleName && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    <Shield className="mr-1 size-2.5" />{user.roleName}
                                                </Badge>
                                            )}
                                            {user.branchName && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    <Building2 className="mr-1 size-2.5" />{user.branchName}
                                                </Badge>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="text-xs">
                                                        <Building2 className="mr-2 size-3.5" />Change Branch
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        {branches.filter((b) => b.isActive).map((b) => (
                                                            <DropdownMenuItem
                                                                key={b.id}
                                                                className={cn("text-xs", b.id === user.branchId && "font-semibold")}
                                                                onClick={() => void patchUser(user.id, { branchId: b.id })}
                                                            >
                                                                {b.name}{b.id === user.branchId && " ✓"}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="text-xs">
                                                        <Shield className="mr-2 size-3.5" />Change Role
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        {displayRoles.map((r) => (
                                                            <DropdownMenuItem
                                                                key={r.id}
                                                                className={cn("text-xs", r.name === user.roleName && "font-semibold")}
                                                                onClick={() => void patchUser(user.id, { roleName: r.name })}
                                                            >
                                                                {r.name}{r.name === user.roleName && " ✓"}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="shrink-0 border-t border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
                            {visibleUsers.length} of {users.length} users
                        </div>
                    </section>

                    {/* ── RIGHT: Editable Permission Matrix ── */}
                    <section className="flex w-72 shrink-0 flex-col overflow-hidden rounded-lg border border-border">
                        <div className="shrink-0 border-b border-border bg-muted/30 px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Permissions
                            </p>
                        </div>
                        <div className="min-h-0 flex-1 overflow-hidden">
                            <EditablePermissionMatrix
                                selectedRole={selectedRole}
                                permissionGroups={permissionGroups}
                                groupsLoading={menuLoading}
                                groupsError={menuError}
                                onPermissionsUpdated={handlePermissionsUpdated}
                            />
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
