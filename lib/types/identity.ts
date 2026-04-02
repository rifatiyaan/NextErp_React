export interface IdentityRoleEntry {
    id: string
    name: string
    userCount: number
    permissionSummary: string
    permissions: string[]
}

export interface IdentityUserEntry {
    id: string
    userName: string
    email: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    branchId: string
    branchName: string
    roleId: string
    roleName: string
    isEmailConfirmed: boolean
}

export interface IdentityBranchEntry {
    id: string
    name: string
    isActive: boolean
}

export interface IdentityCommandCenterDto {
    roles: IdentityRoleEntry[]
    users: IdentityUserEntry[]
    branches: IdentityBranchEntry[]
}

export interface PatchUserRequest {
    branchId?: string
    roleName?: string
}
