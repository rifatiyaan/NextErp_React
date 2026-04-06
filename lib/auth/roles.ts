const ROLE_CLAIM_URI =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"

export function extractRolesFromJwtPayload(payload: Record<string, unknown>): string[] {
    const fromUri = payload[ROLE_CLAIM_URI]
    const fromShort = payload.role
    const fromPlural = payload.roles
    const raw = fromUri ?? fromShort ?? fromPlural
    if (Array.isArray(raw)) return raw.map((x) => String(x))
    if (typeof raw === "string" && raw.length > 0) return [raw]
    return []
}

export function hasIdentityAdminRole(roles: string[]): boolean {
    return roles.some((r) => {
        const x = r.toLowerCase()
        return x === "superadmin" || x === "admin"
    })
}

export function extractIsGlobalFromJwtPayload(
    payload: Record<string, unknown>
): boolean {
    const v = payload.isGlobal
    return v === true || v === "true"
}
