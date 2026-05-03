export interface SystemSettings {
    id: string
    tenantId: string

    presetAccentTheme: string | null
    customPrimary: string | null
    customSecondary: string | null
    customSidebarBackground: string | null
    customSidebarForeground: string | null

    navigationPlacement: "sidebar" | "topbar"
    radius: "none" | "sm" | "md"

    companyName: string | null
    companyLogoUrl: string | null

    createdAt: string
    updatedAt: string | null
}

export interface UpdateSystemSettingsRequest {
    presetAccentTheme?: string | null
    customPrimary?: string | null
    customSecondary?: string | null
    customSidebarBackground?: string | null
    customSidebarForeground?: string | null

    navigationPlacement?: "sidebar" | "topbar"
    radius?: "none" | "sm" | "md"

    companyName?: string | null
    companyLogoUrl?: string | null
}
