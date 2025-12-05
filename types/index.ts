import type { LucideIcon, icons } from "lucide-react"
import type { ComponentType, SVGAttributes } from "react"
import type { i18n } from "@/configs/i18n" // We might need to mock this or remove LocaleType dependency on it

export type LayoutType = "vertical" | "horizontal"

export type ModeType = "light" | "dark" | "system"

export type OrientationType = "vertical" | "horizontal"

export type DirectionType = "ltr" | "rtl"

// Simplified LocaleType since we removed i18n config
export type LocaleType = "en" | "fr" | "ar" // Add more if needed or just "en"

export type FormatStyleType = "percent" | "duration" | "currency" | "regular"

export interface IconProps extends SVGAttributes<SVGElement> {
    children?: never
    color?: string
}

export type IconType = ComponentType<IconProps> | LucideIcon

export type DynamicIconNameType = keyof typeof icons

export interface NavigationType {
    title: string
    items: NavigationRootItem[]
}

export type NavigationRootItem =
    | NavigationRootItemWithHrefType
    | NavigationRootItemWithItemsType

export interface NavigationRootItemBasicType {
    title: string
    label?: string
    iconName: DynamicIconNameType
}

export interface NavigationRootItemWithHrefType
    extends NavigationRootItemBasicType {
    href: string
    items?: never
}

export interface NavigationRootItemWithItemsType
    extends NavigationRootItemBasicType {
    items: (
        | NavigationNestedItemWithHrefType
        | NavigationNestedItemWithItemsType
    )[]
    href?: never
}

export interface NavigationNestedItemBasicType {
    title: string
    label?: string
}

export interface NavigationNestedItemWithHrefType
    extends NavigationNestedItemBasicType {
    href: string
    items?: never
}

export interface NavigationNestedItemWithItemsType
    extends NavigationNestedItemBasicType {
    items: (
        | NavigationNestedItemWithHrefType
        | NavigationNestedItemWithItemsType
    )[]
    href?: never
}

export type NavigationNestedItem =
    | NavigationNestedItemWithHrefType
    | NavigationNestedItemWithItemsType

export interface OAuthLinkType {
    href: string
    label: string
    icon: IconType
}

export interface UserType {
    id: string
    name: string
    email: string
    avatar: string
    role?: string
}

export interface NotificationType {
    unreadCount: number
    notifications: Array<{
        id: string
        iconName: DynamicIconNameType
        content: string
        url: string
        date: Date
        isRead: boolean
    }>
}
