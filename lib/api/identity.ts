import { fetchAPI } from "@/lib/api/client"
import type { IdentityCommandCenterDto, PatchUserRequest } from "@/lib/types/identity"

function normalizeEntry<T extends Record<string, unknown>>(raw: T): T {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(raw)) {
        const camel = k.charAt(0).toLowerCase() + k.slice(1)
        out[camel] = v
    }
    return out as T
}

function normalizeDto(raw: Record<string, unknown>): IdentityCommandCenterDto {
    const roles = Array.isArray(raw.roles ?? raw.Roles)
        ? (raw.roles ?? raw.Roles as unknown[]).map((r) =>
              normalizeEntry(r as Record<string, unknown>)
          )
        : []

    const users = Array.isArray(raw.users ?? raw.Users)
        ? (raw.users ?? raw.Users as unknown[]).map((u) =>
              normalizeEntry(u as Record<string, unknown>)
          )
        : []

    const branches = Array.isArray(raw.branches ?? raw.Branches)
        ? (raw.branches ?? raw.Branches as unknown[]).map((b) =>
              normalizeEntry(b as Record<string, unknown>)
          )
        : []

    return { roles, users, branches } as IdentityCommandCenterDto
}

export const identityAPI = {
    async getDashboard(): Promise<IdentityCommandCenterDto> {
        const raw = await fetchAPI<Record<string, unknown>>("/api/identity/dashboard")
        return normalizeDto(raw)
    },

    async patchUser(userId: string, dto: PatchUserRequest): Promise<void> {
        await fetchAPI(`/api/identity/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify(dto),
        })
    },

    async setRolePermissions(roleId: string, permissionKeys: string[]): Promise<void> {
        await fetchAPI(`/api/identity/roles/${roleId}/permissions`, {
            method: "PUT",
            body: JSON.stringify({ permissionKeys }),
        })
    },
}
