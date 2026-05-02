"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { systemSettingsAPI } from "@/lib/api/system-settings"
import { systemSettingsQueries } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { UpdateSystemSettingsRequest } from "@/lib/types/system-settings"

/**
 * Per-tenant UI / branding settings — read + write hooks.
 *
 * Read hook is cheap (long staleTime, single row, no permission required).
 * Write hooks are gated by `Settings.System.Manage` on the backend; if the
 * current user lacks the permission, the global error toast surfaces a 403.
 *
 * On every successful mutation the cache is invalidated so the live `<head>`
 * style sync component (mounted in Providers) re-applies the new theme
 * within milliseconds.
 */

// ----- Reads -----

export function useSystemSettings() {
    return useQuery(systemSettingsQueries.current())
}

// ----- Mutations -----

export function useUpdateSystemSettings() {
    return useMutation({
        mutationFn: (input: UpdateSystemSettingsRequest) => systemSettingsAPI.update(input),
        meta: {
            successMessage: "Appearance updated",
            invalidates: [queryKeys.systemSettings.all],
        },
    })
}

export function useResetSystemSettings() {
    return useMutation({
        mutationFn: () => systemSettingsAPI.reset(),
        meta: {
            successMessage: "Reset to defaults",
            invalidates: [queryKeys.systemSettings.all],
        },
    })
}

/**
 * Uploads the company logo and resolves to the public URL. Caller is
 * responsible for then PUTting the URL via {@link useUpdateSystemSettings}
 * to commit it. Kept as a separate mutation (not chained) so the form can
 * preview the upload before the user clicks Save.
 *
 * `silent: true` — the form shows its own progress UI; a generic toast
 * during upload would be noisy. Errors still surface via the form's
 * onError callback.
 */
export function useUploadCompanyLogo() {
    return useMutation({
        mutationFn: (file: File) => systemSettingsAPI.uploadLogo(file),
        meta: {
            silent: true,
        },
    })
}
