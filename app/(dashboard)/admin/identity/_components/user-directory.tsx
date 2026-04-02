"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { MoreHorizontal, Building2, Shield } from "lucide-react"
import type { IdentityBranchEntry, IdentityRoleEntry, IdentityUserEntry } from "@/lib/types/identity"

interface UserDirectoryProps {
 users: IdentityUserEntry[]
 roles: IdentityRoleEntry[]
 branches: IdentityBranchEntry[]
 selectedUserId: string | null
 filterRoleId: string | null
 onUserClick: (user: IdentityUserEntry) => void
 onPatchUser: (userId: string, patch: { branchId?: string; roleName?: string }) => Promise<void>
}

function userInitials(user: IdentityUserEntry): string {
 const first = user.firstName?.charAt(0) ?? ""
 const last = user.lastName?.charAt(0) ?? ""
 if (first || last) return `${first}${last}`.toUpperCase()
 return user.email.charAt(0).toUpperCase()
}

function UserCard({
 user,
 roles,
 branches,
 isSelected,
 onUserClick,
 onPatchUser,
}: {
 user: IdentityUserEntry
 roles: IdentityRoleEntry[]
 branches: IdentityBranchEntry[]
 isSelected: boolean
 onUserClick: (u: IdentityUserEntry) => void
 onPatchUser: (userId: string, patch: { branchId?: string; roleName?: string }) => Promise<void>
}) {
 const [patching, setPatching] = useState(false)

 async function handlePatch(patch: { branchId?: string; roleName?: string }) {
 setPatching(true)
 try {
 await onPatchUser(user.id, patch)
 } finally {
 setPatching(false)
 }
 }

 return (
 <div
 role="button"
 tabIndex={0}
 onClick={() => onUserClick(user)}
 onKeyDown={(e) => e.key === "Enter" && onUserClick(user)}
 className={cn(
 "group flex items-center gap-3 border-b border-border/60 px-4 py-3",
 "cursor-pointer transition-colors last:border-b-0",
 "hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40",
 isSelected && "bg-primary/5 border-l-2 border-l-primary pl-[14px]"
 )}
 >
 <Avatar className="size-8 shrink-0 ">
 {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.userName} />}
 <AvatarFallback className=" text-xs font-semibold">
 {userInitials(user)}
 </AvatarFallback>
 </Avatar>

 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5 truncate">
 <span className="truncate text-sm font-medium text-foreground">
 {user.firstName || user.lastName
 ? `${user.firstName} ${user.lastName}`.trim()
 : user.userName}
 </span>
 {!user.isEmailConfirmed && (
 <span className="shrink-0 text-[10px] text-muted-foreground">(unverified)</span>
 )}
 </div>
 <p className="truncate text-xs text-muted-foreground">{user.email}</p>
 </div>

 <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
 {user.roleName && (
 <Badge
 variant="outline"
 className=" border px-1.5 py-0 text-[10px] font-medium"
 >
 <Shield className="mr-1 size-2.5" />
 {user.roleName}
 </Badge>
 )}
 {user.branchName && (
 <Badge
 variant="secondary"
 className=" px-1.5 py-0 text-[10px]"
 >
 <Building2 className="mr-1 size-2.5" />
 {user.branchName}
 </Badge>
 )}
 </div>

 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Button
 variant="ghost"
 size="icon"
 className={cn(
 "size-7 shrink-0 opacity-0 transition-opacity",
 "group-hover:opacity-100 focus:opacity-100",
 patching && "opacity-50 pointer-events-none"
 )}
 >
 <MoreHorizontal className="size-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-44 " onClick={(e) => e.stopPropagation()}>
 <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
 <DropdownMenuSeparator />

 <DropdownMenuSub>
 <DropdownMenuSubTrigger className="text-xs">
 <Building2 className="mr-2 size-3.5" /> Change Branch
 </DropdownMenuSubTrigger>
 <DropdownMenuSubContent className="">
 {branches.filter((b) => b.isActive).map((b) => (
 <DropdownMenuItem
 key={b.id}
 className={cn("text-xs", b.id === user.branchId && "font-semibold")}
 onClick={() => void handlePatch({ branchId: b.id })}
 >
 {b.name}
 {b.id === user.branchId && " ✓"}
 </DropdownMenuItem>
 ))}
 </DropdownMenuSubContent>
 </DropdownMenuSub>

 <DropdownMenuSub>
 <DropdownMenuSubTrigger className="text-xs">
 <Shield className="mr-2 size-3.5" /> Change Role
 </DropdownMenuSubTrigger>
 <DropdownMenuSubContent className="">
 {roles.map((r) => (
 <DropdownMenuItem
 key={r.id}
 className={cn("text-xs", r.name === user.roleName && "font-semibold")}
 onClick={() => void handlePatch({ roleName: r.name })}
 >
 {r.name}
 {r.name === user.roleName && " ✓"}
 </DropdownMenuItem>
 ))}
 </DropdownMenuSubContent>
 </DropdownMenuSub>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 )
}

export function UserDirectory({
 users,
 roles,
 branches,
 selectedUserId,
 filterRoleId,
 onUserClick,
 onPatchUser,
}: UserDirectoryProps) {
 const [search, setSearch] = useState("")

 const visible = users.filter((u) => {
 if (filterRoleId) {
 const role = roles.find((r) => r.id === filterRoleId)
 if (role && u.roleName !== role.name) return false
 }
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
 <div className="flex h-full flex-col">
 <div className="border-b border-border px-4 py-2">
 <input
 type="search"
 placeholder="Search users…"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className={cn(
 "w-full bg-transparent text-sm placeholder:text-muted-foreground",
 "border-0 focus:outline-none focus:ring-0"
 )}
 />
 </div>

 {filterRoleId && (
 <div className="border-b border-border/60 bg-primary/5 px-4 py-1.5 text-xs text-muted-foreground">
 Filtered by role:{" "}
 <span className="font-medium text-foreground">
 {roles.find((r) => r.id === filterRoleId)?.name}
 </span>
 </div>
 )}

 <div className="flex-1 overflow-y-auto">
 {visible.length === 0 ? (
 <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
 No users match
 </div>
 ) : (
 visible.map((user) => (
 <UserCard
 key={user.id}
 user={user}
 roles={roles}
 branches={branches}
 isSelected={selectedUserId === user.id}
 onUserClick={onUserClick}
 onPatchUser={onPatchUser}
 />
 ))
 )}
 </div>

 <div className="border-t border-border/60 px-4 py-1.5 text-xs text-muted-foreground">
 {visible.length} of {users.length} users
 </div>
 </div>
 )
}
