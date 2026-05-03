"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { systemSettingsAPI } from "@/lib/api/system-settings"
import { systemSettingsQueries } from "@/lib/query/options"
import { queryKeys } from "@/lib/query/keys"
import type { UpdateSystemSettingsRequest } from "@/lib/types/system-settings"


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

export function useUploadCompanyLogo() {
    return useMutation({
        mutationFn: (file: File) => systemSettingsAPI.uploadLogo(file),
        meta: {
            silent: true,
        },
    })
}
