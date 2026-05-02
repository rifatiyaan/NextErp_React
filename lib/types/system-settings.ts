/**
 * Per-tenant UI/branding settings shape — matches
 * <see cref="NextErp.Application.DTOs.SystemSettings.Response.Single"/>.
 *
 * Color values are HSL strings in the CSS-var format ("H S% L%", e.g.
 * "221 83% 53%") — applied directly to CSS variables, no conversion needed.
 *
 * Accent is either a preset (`presetAccentTheme`) OR custom (`custom*`),
 * never both.
 */
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

/**
 * Update payload — every field is optional. Null in a field means "don't
 * touch existing" because the backend AutoMapper profile uses Condition().
 * To explicitly clear a field (e.g. remove company name), the frontend must
 * send an empty string and the backend will preserve as-is — to actually
 * clear, use the Reset endpoint.
 *
 * Switching preset → custom: send `presetAccentTheme: null` is NOT enough;
 * just send a `custom*` field and the handler auto-clears the preset.
 */
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
