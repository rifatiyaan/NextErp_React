"use client"

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import type { ComponentProps } from "react"
import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

export function ContextMenu({ ...props }: ComponentProps<typeof ContextMenuPrimitive.Root>) {
    return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

export function ContextMenuTrigger({
    className,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
    return (
        <ContextMenuPrimitive.Trigger
            data-slot="context-menu-trigger"
            className={cn("outline-none", className)}
            {...props}
        />
    )
}

export function ContextMenuGroup({ ...props }: ComponentProps<typeof ContextMenuPrimitive.Group>) {
    return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

export function ContextMenuPortal({ ...props }: ComponentProps<typeof ContextMenuPrimitive.Portal>) {
    return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
}

export function ContextMenuSub({ ...props }: ComponentProps<typeof ContextMenuPrimitive.Sub>) {
    return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

export function ContextMenuRadioGroup({
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
    return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

export function ContextMenuSubTrigger({
    className,
    inset,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
    const radiusClass = useRadiusClass()
    return (
        <ContextMenuPrimitive.SubTrigger
            data-slot="context-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:ps-8 focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
                radiusClass,
                className
            )}
            {...props}
        />
    )
}

export function ContextMenuSubContent({
    className,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
    const radiusClass = useRadiusClass()
    return (
        <ContextMenuPrimitive.SubContent
            data-slot="context-menu-sub-content"
            className={cn(
                "z-50 min-w-[8rem] overflow-hidden border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                radiusClass,
                className
            )}
            {...props}
        />
    )
}

export function ContextMenuContent({
    className,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.Content>) {
    const radiusClass = useRadiusClass()
    return (
        <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Content
                data-slot="context-menu-content"
                className={cn(
                    "z-50 min-w-[10rem] overflow-hidden border bg-popover p-1 text-popover-foreground shadow-md",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    radiusClass,
                    className
                )}
                {...props}
            />
        </ContextMenuPrimitive.Portal>
    )
}

type ContextMenuItemProps = ComponentProps<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
    variant?: "default" | "destructive"
}

export function ContextMenuItem({
    className,
    inset,
    variant = "default",
    ...props
}: ContextMenuItemProps) {
    const radiusClass = useRadiusClass()
    return (
        <ContextMenuPrimitive.Item
            data-slot="context-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:ps-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground",
                radiusClass,
                className
            )}
            {...props}
        />
    )
}

export function ContextMenuCheckboxItem({
    className,
    children,
    checked,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
    const radiusClass = useRadiusClass()
    return (
        <ContextMenuPrimitive.CheckboxItem
            data-slot="context-menu-checkbox-item"
            className={cn(
                "relative flex cursor-pointer items-center rounded-sm py-1.5 ps-8 pe-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
                radiusClass,
                className
            )}
            checked={checked}
            {...props}
        >
            {children}
        </ContextMenuPrimitive.CheckboxItem>
    )
}

export function ContextMenuRadioItem({
    className,
    children,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
    const radiusClass = useRadiusClass()
    return (
        <ContextMenuPrimitive.RadioItem
            data-slot="context-menu-radio-item"
            className={cn(
                "relative flex cursor-pointer items-center rounded-sm py-1.5 ps-8 pe-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
                radiusClass,
                className
            )}
            {...props}
        >
            {children}
        </ContextMenuPrimitive.RadioItem>
    )
}

export function ContextMenuLabel({
    className,
    inset,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
    return (
        <ContextMenuPrimitive.Label
            data-slot="context-menu-label"
            data-inset={inset}
            className={cn(
                "px-2 py-1.5 text-sm font-medium text-foreground data-[inset]:ps-8",
                className
            )}
            {...props}
        />
    )
}

export function ContextMenuSeparator({
    className,
    ...props
}: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
    return (
        <ContextMenuPrimitive.Separator
            data-slot="context-menu-separator"
            className={cn("-mx-1 my-1 h-px bg-border", className)}
            {...props}
        />
    )
}

export function ContextMenuShortcut({ className, ...props }: ComponentProps<"span">) {
    return (
        <span
            data-slot="context-menu-shortcut"
            className={cn("ms-auto text-xs tracking-widest text-muted-foreground", className)}
            {...props}
        />
    )
}
