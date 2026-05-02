import { fetchAPI } from "@/lib/api/client"
import type { CurrentUser } from "@/types/auth"

export const authAPI = {
    async me(signal?: AbortSignal): Promise<CurrentUser> {
        return fetchAPI<CurrentUser>("/api/Auth/me", { signal })
    },
}
