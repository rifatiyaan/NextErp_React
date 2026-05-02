// Types matching your .NET backend API

export interface LoginDto {
    email: string
    password: string
}

export interface RegisterDto {
    email: string
    password: string
    branchId?: string
}

export interface AuthResponse {
    token: string
}

export interface User {
    id: string
    email: string
    userName: string
    roles: string[]
    isGlobal?: boolean
}

export interface CurrentUser {
    id: string
    email?: string
    userName?: string
    firstName?: string
    lastName?: string
    branchId?: string | null
    branchName?: string | null
    isSuperAdmin: boolean
    isGlobal: boolean
    roles: string[]
    permissions: string[]
}

export type LoginFormType = LoginDto
export type RegisterFormType = RegisterDto
