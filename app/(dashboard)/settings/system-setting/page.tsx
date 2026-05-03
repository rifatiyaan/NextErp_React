"use client"

import { useEffect, useMemo, useState } from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"
import { Label } from "@/components/ui/label"
import { Palette, PanelLeft, PanelTop, Paintbrush, Save, RotateCcw, Sparkles, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { useSystemSettings, useUpdateSystemSettings, useResetSystemSettings } from "@/hooks/use-system-settings"
import { useRequirePermission } from "@/hooks/use-require-permission"
import type { UpdateSystemSettingsRequest } from "@/lib/types/system-settings"

import { ThemePresetGrid } from "./_components/ThemePresetGrid"
import { HslColorPicker } from "./_components/HslColorPicker"
import { PreviewPane } from "./_components/PreviewPane"
import { BrandingSection } from "./_components/BrandingSection"

type Draft = Required<Pick<UpdateSystemSettingsRequest,
    "presetAccentTheme" |
    "customPrimary" | "customSecondary" |
    "customSidebarBackground" | "customSidebarForeground" |
    "navigationPlacement" | "radius" |
    "companyName" | "companyLogoUrl"
>>

const COLOR_TARGETS = [
    { key: "customPrimary" as const, label: "Primary", description: "Main accent — buttons, active states, ring" },
    { key: "customSecondary" as const, label: "Secondary", description: "Subtle backgrounds, badges, muted CTAs" },
    { key: "customSidebarBackground" as const, label: "Sidebar background", description: "Independent of secondary" },
    { key: "customSidebarForeground" as const, label: "Sidebar foreground", description: "Text + icon color in the sidebar" },
]

function radiusToClass(radius: "none" | "sm" | "md", tier: "sm" | "md" | "lg"): string {
    if (radius === "none") return "rounded-none"
    if (radius === "sm") return tier === "sm" ? "rounded-sm" : tier === "md" ? "rounded-sm" : "rounded"
    return tier === "sm" ? "rounded-sm" : tier === "md" ? "rounded-md" : "rounded-lg"
}

const FACTORY_DRAFT: Draft = {
    presetAccentTheme: "theme-slate",
    customPrimary: null,
    customSecondary: null,
    customSidebarBackground: null,
    customSidebarForeground: null,
    navigationPlacement: "sidebar",
    radius: "md",
    companyName: null,
    companyLogoUrl: null,
}

export default function SystemSettingsPage() {
    useRequirePermission("Settings.System.Manage")

    const { data: settings, isPending, error, refetch } = useSystemSettings()
    const updateMutation = useUpdateSystemSettings()
    const resetMutation = useResetSystemSettings()

    const [draft, setDraft] = useState<Draft>(FACTORY_DRAFT)
    const [activeTab, setActiveTab] = useState<"appearance" | "layout" | "branding">("appearance")
    type ColorTarget = "customPrimary" | "customSecondary" | "customSidebarBackground" | "customSidebarForeground"
    const [activeColorTarget, setActiveColorTarget] = useState<ColorTarget>("customPrimary")

    // When the server settings load, hydrate the draft. We deliberately don't
    // overwrite the draft if the user has unsaved changes — only on first load
    // or after a reset.
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => {
        if (!settings || hydrated) return
        setDraft({
            presetAccentTheme: settings.presetAccentTheme,
            customPrimary: settings.customPrimary,
            customSecondary: settings.customSecondary,
            customSidebarBackground: settings.customSidebarBackground,
            customSidebarForeground: settings.customSidebarForeground,
            navigationPlacement: settings.navigationPlacement,
            radius: settings.radius,
            companyName: settings.companyName,
            companyLogoUrl: settings.companyLogoUrl,
        })
        setHydrated(true)
    }, [settings, hydrated])

    const isCustomMode = !draft.presetAccentTheme

    // ── Mutators ──
    const setPreset = (preset: string) =>
        setDraft((d) => ({
            ...d,
            presetAccentTheme: preset,
            customPrimary: null,
            customSecondary: null,
            customSidebarBackground: null,
            customSidebarForeground: null,
        }))

    const setCustomColor = (key: keyof Draft, value: string | null) =>
        setDraft((d) => ({
            ...d,
            presetAccentTheme: null,           // switching to custom clears preset
            [key]: value,
        }))

    const setLayout = (key: "navigationPlacement" | "radius", value: string) =>
        setDraft((d) => ({ ...d, [key]: value as Draft[typeof key] }))

    const setBranding = (next: Partial<Pick<Draft, "companyName" | "companyLogoUrl">>) =>
        setDraft((d) => ({ ...d, ...next }))

    // ── Save / reset ──
    const handleSave = () => {
        const payload: UpdateSystemSettingsRequest = { ...draft }
        // Empty company name should round-trip as null (rather than ""),
        // matches backend "preserve null" semantics.
        if (payload.companyName?.trim() === "") payload.companyName = null
        updateMutation.mutate(payload)
    }

    const handleReset = () => {
        resetMutation.mutate(undefined, {
            onSuccess: (fresh) => {
                setDraft({
                    presetAccentTheme: fresh.presetAccentTheme,
                    customPrimary: fresh.customPrimary,
                    customSecondary: fresh.customSecondary,
                    customSidebarBackground: fresh.customSidebarBackground,
                    customSidebarForeground: fresh.customSidebarForeground,
                    navigationPlacement: fresh.navigationPlacement,
                    radius: fresh.radius,
                    companyName: fresh.companyName,
                    companyLogoUrl: fresh.companyLogoUrl,
                })
            },
        })
    }

    const handleDiscard = () => {
        if (!settings) return
        setDraft({
            presetAccentTheme: settings.presetAccentTheme,
            customPrimary: settings.customPrimary,
            customSecondary: settings.customSecondary,
            customSidebarBackground: settings.customSidebarBackground,
            customSidebarForeground: settings.customSidebarForeground,
            navigationPlacement: settings.navigationPlacement,
            radius: settings.radius,
            companyName: settings.companyName,
            companyLogoUrl: settings.companyLogoUrl,
        })
    }

    // Has the user changed anything since the last server-confirmed state?
    const isDirty = useMemo(() => {
        if (!settings) return false
        return JSON.stringify(draft) !== JSON.stringify({
            presetAccentTheme: settings.presetAccentTheme,
            customPrimary: settings.customPrimary,
            customSecondary: settings.customSecondary,
            customSidebarBackground: settings.customSidebarBackground,
            customSidebarForeground: settings.customSidebarForeground,
            navigationPlacement: settings.navigationPlacement,
            radius: settings.radius,
            companyName: settings.companyName,
            companyLogoUrl: settings.companyLogoUrl,
        })
    }, [draft, settings])

    // Preview-scoped CSS vars — only applied inside <PreviewPane>.
    const previewStyle = useMemo<React.CSSProperties>(() => {
        const style: Record<string, string> = {}
        if (draft.customPrimary) {
            style["--primary"] = draft.customPrimary
        }
        if (draft.customSecondary) {
            style["--secondary"] = draft.customSecondary
        }
        if (draft.customSidebarBackground) {
            style["--sidebar-background"] = draft.customSidebarBackground
        }
        if (draft.customSidebarForeground) {
            style["--sidebar-foreground"] = draft.customSidebarForeground
        }
        return style as React.CSSProperties
    }, [draft])

    const previewClass = draft.presetAccentTheme ?? ""

    return (
        <div className="flex h-full flex-col gap-3 overflow-hidden">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/dashboard">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink href="/settings">Settings</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>System Settings</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Page header */}
            <div className="flex shrink-0 items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Palette className="size-5 text-primary" />
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">System Settings</h1>
                        <p className="text-xs text-muted-foreground">
                            Tenant-wide appearance, layout, and branding · {isDirty ? "unsaved changes" : "in sync"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    disabled={isPending}
                >
                    <Sparkles className={cn("mr-1.5 h-3.5 w-3.5", isPending && "animate-pulse")} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="shrink-0 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
                    {error.message}
                </div>
            )}

            {isPending ? (
                <Loader text="Loading settings…" />
            ) : (
                <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
                    {/* ── LEFT: Live preview ── */}
                    <section className="flex w-80 shrink-0 flex-col gap-2 overflow-y-auto">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Preview
                        </p>
                        <div className={previewClass}>
                            <PreviewPane
                                style={previewStyle}
                                placement={draft.navigationPlacement}
                                radius={draft.radius}
                                companyName={draft.companyName}
                                companyLogoUrl={draft.companyLogoUrl}
                            />
                        </div>

                        <p className="text-[10px] text-muted-foreground">
                            Preview reflects unsaved changes only. The rest of the app updates after Save.
                        </p>
                    </section>

                    {/* ── CENTER: Controls ── */}
                    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
                        <div className="flex shrink-0 gap-1 border-b border-border bg-muted/30 p-1.5">
                            <SectionTab active={activeTab === "appearance"} onClick={() => setActiveTab("appearance")}
                                icon={<Paintbrush className="size-3.5" />} label="Appearance" />
                            <SectionTab active={activeTab === "layout"} onClick={() => setActiveTab("layout")}
                                icon={<PanelLeft className="size-3.5" />} label="Layout" />
                            <SectionTab active={activeTab === "branding"} onClick={() => setActiveTab("branding")}
                                icon={<Building2 className="size-3.5" />} label="Branding" />
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            {/* APPEARANCE */}
                            {activeTab === "appearance" && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-medium">Preset palette</Label>
                                            <span className="text-[10px] text-muted-foreground">
                                                {isCustomMode ? "Custom mode" : "Preset mode"}
                                            </span>
                                        </div>
                                        <ThemePresetGrid
                                            selected={draft.presetAccentTheme}
                                            onSelect={setPreset}
                                            radiusClass={radiusToClass(draft.radius, "md")}
                                        />
                                    </div>

                                    <div className={cn("border border-border bg-muted/20 p-3", radiusToClass(draft.radius, "lg"))}>
                                        <div className="mb-3 flex items-center gap-2">
                                            <Paintbrush className="size-3.5 text-primary" />
                                            <span className="text-xs font-medium">Custom colors</span>
                                            <span className="ml-auto text-[10px] text-muted-foreground">
                                                Setting any color overrides the preset
                                            </span>
                                        </div>

                                        {/* Target tabs — one picker reused for all four colors. */}
                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {COLOR_TARGETS.map((t) => {
                                                const hasValue = !!draft[t.key]
                                                return (
                                                    <button
                                                        key={t.key}
                                                        type="button"
                                                        onClick={() => setActiveColorTarget(t.key)}
                                                        className={cn(
                                                            "flex items-center gap-1.5 border px-2.5 py-1 text-[11px] transition-colors",
                                                            radiusToClass(draft.radius, "md"),
                                                            activeColorTarget === t.key
                                                                ? "border-primary bg-primary/5 text-foreground"
                                                                : "border-border text-muted-foreground hover:text-foreground",
                                                        )}
                                                    >
                                                        <span
                                                            className={cn("size-3 border border-border", radiusToClass(draft.radius, "sm"))}
                                                            style={{
                                                                backgroundColor: hasValue
                                                                    ? `hsl(${draft[t.key]})`
                                                                    : "transparent",
                                                            }}
                                                            aria-hidden
                                                        />
                                                        {t.label}
                                                        {hasValue && (
                                                            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <HslColorPicker
                                            key={activeColorTarget}
                                            label={COLOR_TARGETS.find((t) => t.key === activeColorTarget)!.label}
                                            value={draft[activeColorTarget]}
                                            onChange={(v) => setCustomColor(activeColorTarget, v)}
                                            description={COLOR_TARGETS.find((t) => t.key === activeColorTarget)!.description}
                                            radiusClass={radiusToClass(draft.radius, "md")}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* LAYOUT */}
                            {activeTab === "layout" && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Navigation placement</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ToggleCard
                                                active={draft.navigationPlacement === "sidebar"}
                                                onClick={() => setLayout("navigationPlacement", "sidebar")}
                                                icon={<PanelLeft className="size-4" />}
                                                label="Left sidebar"
                                                description="Vertical menu on the left, generous workspace"
                                            />
                                            <ToggleCard
                                                active={draft.navigationPlacement === "topbar"}
                                                onClick={() => setLayout("navigationPlacement", "topbar")}
                                                icon={<PanelTop className="size-4" />}
                                                label="Top bar"
                                                description="Horizontal nav, more vertical screen space"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Corner radius</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(["none", "sm", "md"] as const).map((r) => (
                                                <ToggleCard
                                                    key={r}
                                                    active={draft.radius === r}
                                                    onClick={() => setLayout("radius", r)}
                                                    icon={<RadiusShape r={r} />}
                                                    label={r === "none" ? "Sharp" : r === "sm" ? "Soft" : "Rounded"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BRANDING */}
                            {activeTab === "branding" && (
                                <BrandingSection
                                    companyName={draft.companyName}
                                    companyLogoUrl={draft.companyLogoUrl}
                                    onCompanyNameChange={(v) => setBranding({ companyName: v })}
                                    onCompanyLogoUrlChange={(v) => setBranding({ companyLogoUrl: v })}
                                />
                            )}
                        </div>
                    </section>

                    {/* ── RIGHT: Summary + actions ── */}
                    <section className="flex w-64 shrink-0 flex-col gap-3 overflow-y-auto">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Summary
                        </p>

                        <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                            <SummaryRow label="Theme" value={isCustomMode ? "Custom" : (draft.presetAccentTheme?.replace("theme-", "") ?? "—")} />
                            <SummaryRow label="Layout" value={draft.navigationPlacement === "sidebar" ? "Left sidebar" : "Top bar"} />
                            <SummaryRow label="Radius" value={draft.radius} />
                            <SummaryRow label="Company" value={draft.companyName ?? "—"} />
                            <SummaryRow label="Logo" value={draft.companyLogoUrl ? "Set" : "—"} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={!isDirty || updateMutation.isPending}
                            >
                                <Save className="mr-1.5 size-3.5" />
                                {updateMutation.isPending ? "Saving…" : "Save changes"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDiscard}
                                disabled={!isDirty || updateMutation.isPending}
                            >
                                Discard
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                disabled={resetMutation.isPending}
                                className="text-destructive hover:text-destructive"
                            >
                                <RotateCcw className="mr-1.5 size-3.5" />
                                {resetMutation.isPending ? "Resetting…" : "Reset to defaults"}
                            </Button>
                        </div>

                        <p className="text-[10px] text-muted-foreground">
                            Reset reverts all tenant-wide UI settings to factory defaults.
                            Each user's light/dark mode preference is unaffected.
                        </p>
                    </section>
                </div>
            )}
        </div>
    )
}

function SectionTab({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground",
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function ToggleCard({
    active,
    onClick,
    icon,
    label,
    description,
}: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
    description?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition-all",
                "hover:border-primary/60",
                active ? "border-primary bg-primary/5 shadow-sm" : "border-border",
            )}
        >
            <span className={cn("flex size-7 items-center justify-center rounded-md", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {icon}
            </span>
            <div className="flex flex-col">
                <span className="text-xs font-medium">{label}</span>
                {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
            </div>
        </button>
    )
}

function RadiusShape({ r }: { r: "none" | "sm" | "md" }) {
    const cls = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
    }[r]
    return <span className={cn("size-4 border-2 border-current", cls)} aria-hidden />
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium truncate ml-2 max-w-[60%]" title={value}>{value}</span>
        </div>
    )
}
