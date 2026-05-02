"use client"

import { useState } from "react"
import { useIdentityDashboard, usePatchUser } from "@/hooks/use-identity"
import { useMenuPermissionGroups } from "@/hooks/use-modules"
import { RoleBentoGrid } from "./_components/role-bento-grid"
import { UserDirectory } from "./_components/user-directory"
import { PermissionMatrix } from "./_components/permission-matrix"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { IdentityRoleEntry, IdentityUserEntry } from "@/lib/types/identity"
import { AlertCircle, RefreshCw, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

function CommandCenterSkeleton() {
 return (
 <div className="grid h-full grid-cols-[300px_1fr_260px] gap-0 divide-x divide-border overflow-hidden border border-border">
 <div className="space-y-2 p-3">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} className="h-[88px] w-full " />
 ))}
 </div>
 <div className="space-y-0 divide-y divide-border">
 {Array.from({ length: 8 }).map((_, i) => (
 <Skeleton key={i} className="h-14 w-full " />
 ))}
 </div>
 <div className="space-y-0 divide-y divide-border">
 {Array.from({ length: 6 }).map((_, i) => (
 <Skeleton key={i} className="h-10 w-full " />
 ))}
 </div>
 </div>
 )
}

export default function IdentityCommandCenterPage() {
 const { roles, users, branches, loading, error, refetch } =
 useIdentityDashboard()
 const patchUserMutation = usePatchUser()
 const patchUser = (userId: string, patch: { branchId?: string; roleName?: string }) =>
 patchUserMutation.mutateAsync({ userId, patch }).then(() => undefined)
 const {
 groups: permissionGroups,
 loading: menuLoading,
 error: menuError,
 refetch: refetchMenu,
 } = useMenuPermissionGroups()

 // The role selected in the Bento Grid (drives permission matrix + user filter)
 const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

 // The user selected in the Directory (drives role highlight)
 const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

 // Which role to highlight because a user with that role was clicked
 const [highlightedRoleId, setHighlightedRoleId] = useState<string | null>(null)

 function handleRoleClick(role: IdentityRoleEntry) {
 setSelectedRoleId((prev) => (prev === role.id ? null : role.id))
 setSelectedUserId(null)
 setHighlightedRoleId(null)
 }

 function handleUserClick(user: IdentityUserEntry) {
 setSelectedUserId((prev) => (prev === user.id ? null : user.id))

 const matchingRole = roles.find((r) => r.name === user.roleName)
 if (matchingRole) {
 setHighlightedRoleId(matchingRole.id)
 setSelectedRoleId(matchingRole.id)
 }
 }

 const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null

 return (
 <div className="flex h-full flex-col gap-0 overflow-hidden">
 {/* Page header */}
 <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3">
 <div className="flex items-center gap-2.5">
 <ShieldCheck className="size-4 text-primary" />
 <div>
 <h1 className="text-sm font-semibold leading-tight">
 Identity Command Center
 </h1>
 <p className="text-xs text-muted-foreground">
 {roles.length} roles · {users.length} users · {branches.length} branches
 </p>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 className=" text-xs"
 onClick={() => {
 void refetch()
 void refetchMenu()
 }}
 disabled={loading}
 >
 <RefreshCw className={cn("mr-1.5 size-3.5", loading && "animate-spin")} />
 Refresh
 </Button>
 </div>

 {/* Error banner */}
 {error && (
 <div className="flex shrink-0 items-center gap-2 border-b border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
 <AlertCircle className="size-3.5" />
 {error.message}
 </div>
 )}

 {loading && !error ? (
 <div className="flex-1 overflow-hidden p-4">
 <CommandCenterSkeleton />
 </div>
 ) : (
 /* Three-pane layout */
 <div className="flex min-h-0 flex-1 divide-x divide-border overflow-hidden border-b border-border">
 {/* ── PANE A: Role Bento Grid ── */}
 <section className="flex w-[300px] shrink-0 flex-col overflow-hidden">
 <div className="shrink-0 border-b border-border/60 bg-muted/30 px-3 py-2">
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
 Roles
 </p>
 </div>
 <div className="flex-1 overflow-y-auto p-3">
 <RoleBentoGrid
 roles={roles}
 selectedRoleId={selectedRoleId}
 highlightedRoleId={highlightedRoleId}
 onRoleClick={handleRoleClick}
 />
 </div>
 {selectedRole && (
 <button
 className="shrink-0 border-t border-border/60 px-3 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
 onClick={() => {
 setSelectedRoleId(null)
 setHighlightedRoleId(null)
 }}
 >
 ✕ Clear filter
 </button>
 )}
 </section>

 {/* ── PANE B: Identity Directory ── */}
 <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
 <div className="shrink-0 border-b border-border/60 bg-muted/30 px-3 py-2">
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
 Users
 </p>
 </div>
 <div className="min-h-0 flex-1 overflow-hidden">
 <UserDirectory
 users={users}
 roles={roles}
 branches={branches}
 selectedUserId={selectedUserId}
 filterRoleId={selectedRoleId}
 onUserClick={handleUserClick}
 onPatchUser={patchUser}
 />
 </div>
 </section>

 {/* ── PANE C: Permission Matrix ── */}
 <section className="flex w-[260px] shrink-0 flex-col overflow-hidden">
 <div className="shrink-0 border-b border-border/60 bg-muted/30 px-3 py-2">
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
 Permissions
 </p>
 </div>
 <div className="min-h-0 flex-1 overflow-hidden">
 <PermissionMatrix
 selectedRole={selectedRole}
 permissionGroups={permissionGroups}
 groupsLoading={menuLoading}
 groupsError={menuError}
 />
 </div>
 </section>
 </div>
 )}
 </div>
 )
}
