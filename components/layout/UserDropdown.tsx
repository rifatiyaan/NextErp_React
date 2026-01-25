import Link from "next/link"
import { LogOut, User, UserCog, LayoutGrid, Sidebar as SidebarIcon } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { userData } from "@/data/user"

import { getInitials } from "@/lib/utils"
import { useSidebarView } from "@/contexts/sidebar-view-context"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserDropdown({
    dictionary,
    locale = "en",
}: {
    dictionary: DictionaryType
    locale?: LocaleType
}) {
    const { mode, toggleMode } = useSidebarView()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    aria-label="User"
                >
                    <Avatar className="size-9">
                        <AvatarImage src={userData?.avatar} alt="" />
                        <AvatarFallback className="bg-transparent">
                            {userData?.name && getInitials(userData.name)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent forceMount>
                <DropdownMenuLabel className="flex gap-2">
                    <Avatar>
                        <AvatarImage src={userData?.avatar} alt="Avatar" />
                        <AvatarFallback className="bg-transparent">
                            {userData?.name && getInitials(userData.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-medium truncate">{userData.name}</p>
                        <p className="text-xs text-muted-foreground font-semibold truncate">
                            {userData?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="max-w-48">
                    <DropdownMenuItem asChild>
                        <Link href="/pages/account/profile">
                            <User className="me-2 size-4" />
                            {dictionary.navigation.userNav.profile}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/pages/account/settings">
                            <UserCog className="me-2 size-4" />
                            {dictionary.navigation.userNav.settings}
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onSelect={(e) => {
                        e.preventDefault()
                        toggleMode()
                    }}
                >
                    <div className="flex items-center gap-2">
                        {mode === "grid" ? (
                            <LayoutGrid className="me-2 size-4" />
                        ) : (
                            <SidebarIcon className="me-2 size-4" />
                        )}
                        <span className="text-sm">
                            {mode === "grid" ? "Grid View" : "Sidebar View"}
                        </span>
                    </div>
                    <Switch
                        checked={mode === "sidebar"}
                        onCheckedChange={toggleMode}
                        onClick={(e) => e.stopPropagation()}
                    />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogOut className="me-2 size-4" />
                    {dictionary.navigation.userNav.signOut}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
