import { icons } from "lucide-react"
import type { LucideProps } from "lucide-react"
import type { IconType } from "react-icons"
import * as Fa from "react-icons/fa6"
import * as Md from "react-icons/md"
import * as Io5 from "react-icons/io5"
import * as Bs from "react-icons/bs"
import * as Hi2 from "react-icons/hi2"

export type DynamicIconNameType = keyof typeof icons | string

interface DynamicIconProps extends LucideProps {
    name: DynamicIconNameType
}

// Create a registry of React Icons
// Note: This does allow for some bundle bloat but is required for fully dynamic string-based lookup without lazy loading
const ReactIconsRegistry: Record<string, IconType> = {
    ...Fa,
    ...Md,
    ...Io5,
    ...Bs,
    ...Hi2
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    // 1. Check Lucide Icons first (Direct Match)
    let IconComponent: any = icons[name as keyof typeof icons]

    // 2. Check React Icons Registry (Direct Match)
    if (!IconComponent && typeof name === "string") {
        IconComponent = ReactIconsRegistry[name]
    }

    // 3. Normalization Fallback
    if (!IconComponent && typeof name === "string") {
        // Convert kebab-case, snake_case, or space-separated to PascalCase
        const normalizedName = name
            .split(/[-_ ]+/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("")

        // Check Lucide with normalized name
        IconComponent = icons[normalizedName as keyof typeof icons]

        // Check React Icons with normalized name
        if (!IconComponent) {
            IconComponent = ReactIconsRegistry[normalizedName]
        }
    }

    // 4. Last resort fallback
    if (!IconComponent) {
        return null
    }

    return <IconComponent {...props} />
}
