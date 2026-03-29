"use client"

import { useEffect } from "react"

import { applyUiRadiusToDocument } from "@/lib/ui/radius"
import { useUiSettingsStore } from "@/lib/ui-settings/store"

/** Keeps global `--radius*` CSS variables aligned with persisted UI settings. */
export function RadiusCssVarSync() {
    const radius = useUiSettingsStore((s) => s.radius)

    useEffect(() => {
        applyUiRadiusToDocument(radius)
    }, [radius])

    return null
}
