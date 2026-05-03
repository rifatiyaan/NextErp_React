import { fetchAPI } from "@/lib/api/client"
import type { SystemSettings, UpdateSystemSettingsRequest } from "@/lib/types/system-settings"

export const systemSettingsAPI = {
    async get(signal?: AbortSignal): Promise<SystemSettings> {
        return fetchAPI<SystemSettings>("/api/SystemSettings", { signal })
    },

    async update(input: UpdateSystemSettingsRequest): Promise<SystemSettings> {
        return fetchAPI<SystemSettings>("/api/SystemSettings", {
            method: "PUT",
            body: JSON.stringify(input),
        })
    },

    async reset(): Promise<SystemSettings> {
        return fetchAPI<SystemSettings>("/api/SystemSettings/reset", {
            method: "POST",
        })
    },

    async uploadLogo(file: File): Promise<{ url: string }> {
        const formData = new FormData()
        formData.append("file", file)
        return fetchAPI<{ url: string }>("/api/SystemSettings/logo", {
            method: "POST",
            body: formData,
        })
    },
}
